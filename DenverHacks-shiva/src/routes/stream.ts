import { Router, Request, Response } from "express";
import Redis from "ioredis";
import { config } from "@/config";
import pino from "pino";

const logger = pino();
const router = Router();

const redis = new Redis(config.REDIS_URL, { lazyConnect: true });
redis.on("error", () => {}); // Suppress errors

/**
 * GET /api/stream
 * Server-Sent Events endpoint for real-time agent activity streaming
 * Connects to Redis pub/sub and pushes events to observer dashboard
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const pubsub = new Redis(config.REDIS_URL, { lazyConnect: true });
    pubsub.on("error", () => {}); // Suppress errors

    // Must connect before subscribe when lazyConnect is true
    await pubsub.connect().catch(() => {
      logger.warn("Redis pubsub connect failed — stream will be silent");
    });

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Subscribe to Redis pub/sub channels
    pubsub.subscribe(
      "agent_execution",
      "payment_settled",
      "reputation_updated",
      "ucp_message",
      "agent_registered",
      (err, count) => {
        if (err) {
          logger.error({ error: err }, "Failed to subscribe to Redis channels");
          res.write("data: {\"error\": \"subscription failed\"}\n\n");
          res.end();
          return;
        }
        logger.info({ subscriptionCount: count }, "Client subscribed to event stream");
      }
    );

    // Handle incoming messages
    pubsub.on("message", (channel, message) => {
      try {
        const payload = JSON.parse(message);
        res.write(`event: ${channel}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (error) {
        logger.warn({ channel, error }, "Failed to parse event message");
      }
    });

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 30000); // Every 30 seconds

    // Cleanup on disconnect
    req.on("close", () => {
      clearInterval(heartbeat);
      pubsub.unsubscribe();
      pubsub.quit();
      logger.info("Client disconnected from event stream");
    });

    res.on("error", (error) => {
      logger.error({ error }, "SSE connection error");
      clearInterval(heartbeat);
      pubsub.unsubscribe();
      pubsub.quit();
    });
  } catch (error) {
    logger.error({ error }, "SSE endpoint error");
    res.status(500).json({ error: "Failed to establish stream" });
  }
});

export default router;
