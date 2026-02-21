import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { config } from "@/config";
import { prisma } from "@/lib/prisma";
import {
  calculateReputation,
  updateReputationOnChain,
  updateAgentReputation,
} from "@/hedera/reputationEngine";
import pino from "pino";

const logger = pino();

let redis: Redis | null = null;
let reputationQueue: Queue | null = null;
let reputationWorker: Worker | null = null;

/**
 * Initialize Redis connection
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
 * Lazy-load queue on first use
 */
async function getQueue(): Promise<Queue> {
  if (reputationQueue) return reputationQueue;

  const redisConn = await initializeRedis();

  reputationQueue = new Queue("reputation", {
    connection: redisConn as any,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
    },
  });

  return reputationQueue;
}

/**
 * Reputation update worker
 * Calculates and updates reputation scores for all active agents
 */
async function initializeWorker(): Promise<void> {
  if (reputationWorker) return;

  const redisConn = await initializeRedis();
  const queue = await getQueue();

  reputationWorker = new Worker(
    "reputation",
    async (job) => {
      try {
        logger.info({ jobId: job.id }, "Processing reputation updates");

        // Get all agents that had recent executions
        const recentExecutions = await prisma.execution.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
          distinct: ["agentId"],
          select: { agentId: true },
        });

        const agentIds = recentExecutions.map((e) => e.agentId);
        let updatedCount = 0;

        for (const agentId of agentIds) {
          try {
            const agent = await prisma.agent.findUnique({
              where: { id: agentId },
            });

            if (!agent || !agent.active) continue;

            // Calculate reputation
            const reputation = await calculateReputation(agentId);

            // Update on-chain (non-blocking)
            updateReputationOnChain(
              agent.agentId,
              reputation.score,
              reputation.totalExecutions
            ).catch((err) => {
              logger.error(
                { agentId, error: err },
                "Failed to update reputation on-chain (non-blocking)"
              );
            });

            // Update in DB
            await updateAgentReputation(agent.agentId, reputation);

            updatedCount++;

            logger.debug(
              {
                agentId: agent.agentId,
                score: reputation.score,
                totalExecutions: reputation.totalExecutions,
              },
              "Agent reputation updated"
            );
          } catch (error) {
            logger.error(
              { agentId, error },
              "Failed to update agent reputation (non-blocking)"
            );
          }
        }

        logger.info(
          { jobId: job.id, updatedCount, totalAgents: agentIds.length },
          "Reputation batch completed"
        );

        // Invalidate leaderboard cache
        if (redisConn) {
          await redisConn.del("leaderboard:cache").catch(() => {});
        }

        return { status: "completed", updatedCount };
      } catch (error) {
        logger.error(
          { jobId: job.id, error },
          "Reputation batch processing failed"
        );
        throw error;
      }
    },
    { connection: redisConn as any, concurrency: 1 }
  );

  reputationWorker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Reputation update completed");
  });

  reputationWorker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, error: err.message },
      "Reputation update failed"
    );
  });
}

/**
 * Schedule reputation updates
 * Runs every 5 minutes
 */
export async function initializeReputationSchedule(): Promise<void> {
  try {
    const queue = await getQueue();
    await initializeWorker();

    await queue.add(
      "process",
      {},
      {
        repeat: {
          pattern: "*/5 * * * *", // Every 5 minutes
        },
        jobId: "reputation-periodic",
      }
    );

    logger.info("Reputation schedule initialized");
  } catch (error) {
    logger.error({ error }, "Failed to initialize reputation schedule");
    throw error;
  }
}

export async function closeReputationWorker(): Promise<void> {
  if (reputationWorker) {
    await reputationWorker.close();
  }
  if (redis) {
    await redis.disconnect();
  }
  logger.info("Reputation worker closed");
}
