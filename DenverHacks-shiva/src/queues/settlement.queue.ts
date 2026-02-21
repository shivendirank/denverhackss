import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { config } from "@/config";
import { processSettlementBatch } from "@/services/settlement";
import pino from "pino";

const logger = pino();

let redis: Redis | null = null;
let settlementBaseQueue: Queue | null = null;
let settlementKiteQueue: Queue | null = null;
let baseWorker: Worker | null = null;
let kiteWorker: Worker | null = null;

/**
 * Initialize Redis connection and queues
 */
async function initializeRedis(): Promise<Redis> {
  if (redis) return redis;

  redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
    retryStrategy: () => null, // Don't retry, fail fast
    lazyConnect: true, // Don't auto-connect
  });

  // Suppress unhandled errors
  const errorHandler = () => {}; // Ignore errors until connect
  redis.on("error", errorHandler);

  // Wait for connection with timeout
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Redis connection timeout"));
    }, 5000);

    redis!.on("connect", () => {
      clearTimeout(timeout);
      resolve(redis!);
    });

    redis!.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Attempt to connect
    redis!.connect().catch(reject);
  });
}

/**
 * Lazy-load queues on first use
 */
async function getQueues() {
  if (settlementBaseQueue && settlementKiteQueue) {
    return { baseQueue: settlementBaseQueue, kiteQueue: settlementKiteQueue };
  }

  const redisConn = await initializeRedis();

  settlementBaseQueue = new Queue("settlement-base", {
    connection: redisConn as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
    },
  });

  settlementKiteQueue = new Queue("settlement-kite", {
    connection: redisConn as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
    },
  });

  return { baseQueue: settlementBaseQueue, kiteQueue: settlementKiteQueue };
}

/**
 * Settlement workers
 * Process batches of executions and submit to Escrow
 */
async function initializeWorkers(): Promise<void> {
  if (baseWorker && kiteWorker) return;

  const redisConn = await initializeRedis();
  const { baseQueue, kiteQueue } = await getQueues();

  baseWorker = new Worker(
    "settlement-base",
    async (job) => {
      try {
        logger.info({ jobId: job.id }, "Processing base settlement batch");
        await processSettlementBatch("base");
        return { status: "completed" };
      } catch (error) {
        logger.error({ jobId: job.id, error }, "Base settlement batch failed");
        throw error;
      }
    },
    { connection: redisConn as any, concurrency: 1 }
  );

  kiteWorker = new Worker(
    "settlement-kite",
    async (job) => {
      try {
        logger.info({ jobId: job.id }, "Processing kite settlement batch");
        await processSettlementBatch("kite");
        return { status: "completed" };
      } catch (error) {
        logger.error({ jobId: job.id, error }, "Kite settlement batch failed");
        throw error;
      }
    },
    { connection: redisConn as any, concurrency: 1 }
  );

  baseWorker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Base settlement batch completed");
  });

  baseWorker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, error: err.message },
      "Base settlement batch failed"
    );
  });

  kiteWorker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Kite settlement batch completed");
  });

  kiteWorker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, error: err.message },
      "Kite settlement batch failed"
    );
  });
}

/**
 * Schedule settlement batch processing
 * - Every 5 minutes
 * - Or when 50 pending executions accumulated
 */
export async function initializeSettlementSchedule(): Promise<void> {
  try {
    const { baseQueue, kiteQueue } = await getQueues();
    await initializeWorkers();

    // Add repeating jobs every 5 minutes
    await baseQueue.add(
      "process",
      {},
      {
        repeat: {
          pattern: "*/5 * * * *", // Every 5 minutes
        },
        jobId: "settlement-base-periodic",
      }
    );

    await kiteQueue.add(
      "process",
      {},
      {
        repeat: {
          pattern: "*/5 * * * *", // Every 5 minutes
        },
        jobId: "settlement-kite-periodic",
      }
    );

    logger.info("Settlement schedule initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize settlement schedule");
    throw error;
  }
}

/**
 * Manually trigger settlement for a chain
 */
export async function triggerSettlementBatch(chain: "base" | "kite"): Promise<void> {
  const { baseQueue, kiteQueue } = await getQueues();
  const queue = chain === "base" ? baseQueue : kiteQueue;
  if (queue) {
    await queue.add("process", {}, { priority: 10 });
  }
}

export async function closeSettlementWorkers(): Promise<void> {
  if (baseWorker) {
    await baseWorker.close();
  }
  if (kiteWorker) {
    await kiteWorker.close();
  }
  if (redis) {
    await redis.disconnect();
  }
  logger.info("Settlement workers closed");
}
