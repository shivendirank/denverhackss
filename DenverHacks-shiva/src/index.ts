import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { config } from "@/config";
import { healthCheck, getClientForChain } from "@/blockchain/clients";
import { closePrisma, prisma } from "@/lib/prisma";
import toolsRouter from "@/routes/tools";
import agentsRouter from "@/routes/agents";
import escrowRouter from "@/routes/escrow";
import reputationRouter from "@/routes/reputation";
import streamRouter from "@/routes/stream";
import { x402Middleware, verifyX402Payment } from "@/middleware/x402";
import { AppError } from "@/types/errors";
import { initializeSettlementSchedule, closeSettlementWorkers } from "@/queues/settlement.queue";
import { initializeReputationSchedule, closeReputationWorker } from "@/queues/reputation.queue";
import pino from "pino";
import { getHederaClient, closeHederaClient } from "@/hedera/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino();

const app = express();

// Middleware
app.use(
  cors({
    origin: true, // reflect request origin — tighten to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-wallet", "x-payment-chain", "x-payment"],
    credentials: true,
  })
);
// note: cors() middleware above already handles OPTIONS pre-flight automatically
app.use(express.json());
app.use(pinoHttp());

// Placeholder SIWE auth - in production, implement full EIP-4361 signature verification
app.use((req: Request, res: Response, next: NextFunction) => {
  const walletHeader = req.headers["x-wallet"] as string | undefined;
  (req as any).agentWallet = walletHeader || "0x0000000000000000000000000000000000000000";
  next();
});

// Routes
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public/observer.html"));
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const blockchainHealthy = await healthCheck();
    const baseBlock = blockchainHealthy ? await getClientForChain("base").getBlockNumber() : 0n;
    const kiteBlock = blockchainHealthy ? await getClientForChain("kite").getBlockNumber() : 0n;
    const zgBlock = blockchainHealthy ? await getClientForChain("zg").getBlockNumber() : 0n;

    const dbHealthy = await prisma.tool.count().then(() => true).catch(() => false);

    res.json({
      status: "ok",
      chains: {
        base: baseBlock.toString(),
        kite: kiteBlock.toString(),
        zg: zgBlock.toString(),
      },
      hedera: {
        connected: true,
      },
      db: dbHealthy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Health check failed");
    res.status(503).json({ status: "unhealthy", error: "Service check failed" });
  }
});

// API routes
app.use("/api/tools", toolsRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/escrow", escrowRouter);
app.use("/api/reputation", reputationRouter);
app.use("/api/stream", streamRouter);

// Global error handler
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    logger.error({ code: error.code, statusCode: error.statusCode }, error.message);
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }

  if (error instanceof Error) {
    logger.error({ error: error.message }, "Unhandled error");
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }

  logger.error({ error }, "Unknown error type");
  res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
});

/**
 * Initialize queues and start server
 */
async function startServer() {
  try {
    // Verify blockchain connectivity
    const blockchainHealthy = await healthCheck();
    if (!blockchainHealthy) {
      logger.warn("Blockchain health check failed - proceeding anyway");
    }

    // Verify database connectivity
    let dbHealthy = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info("Database connected");
      dbHealthy = true;
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : String(error) },
        "⚠️  Database not available - running in degraded mode"
      );
    }

    // Initialize Hedera client (optional - warnings if not available)
    try {
      getHederaClient();
      logger.info("Hedera client initialized");
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : String(error) },
        "⚠️  Hedera client not available - running in degraded mode"
      );
    }

    // Initialize recurring jobs (optional - continue if Redis unavailable)
    try {
      await initializeSettlementSchedule();
      await initializeReputationSchedule();
      logger.info("Job queues initialized");
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : String(error) },
        "⚠️  Redis/Job queues not available - running in degraded mode. Settlement and reputation updates will not process automatically."
      );
    }

    // Start server
    const server = app.listen(config.PORT, () => {
      logger.info({ port: config.PORT }, "🚀 Server started");
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down gracefully");

      server.close(async () => {
        try {
          await closeSettlementWorkers().catch((e) =>
            logger.warn("Settlement workers not available")
          );
          await closeReputationWorker().catch((e) =>
            logger.warn("Reputation worker not available")
          );
          await closeHederaClient();
          await closePrisma();
          logger.info("✅ Graceful shutdown complete");
          process.exit(0);
        } catch (error) {
          logger.error({ error }, "Error during shutdown");
          process.exit(1);
        }
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

startServer();

export default app;
