/**
 * AI Agent Trust & Payment Layer
 * Main Backend Server Entry Point
 */

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";
import { AppError } from "./types/errors.js";
import pino from "pino";
import settlementsRouter from "./routes/settlements.js";
import toolsRouter from "./routes/tools.js";
import agentsRouter from "./routes/agents.js";
import zgRouter from "./routes/zg.js";
import { seedDemoData, isDegradedMode } from "./services/in-memory-storage.js";

// Load environment variables
dotenv.config();

const logger = pino();
const app = express();
const PORT = process.env.PORT || 3000;

// ================================================
// MIDDLEWARE
// ================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-wallet, x-payment-chain, x-payment');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// Simple wallet auth middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const walletHeader = req.headers["x-wallet"] as string | undefined;
  (req as any).agentWallet = walletHeader || "0x0000000000000000000000000000000000000000";
  next();
});

// ================================================
// ROUTES
// ================================================

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ 
    service: "AI Agent Trust & Payment Layer",
    status: "running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    let dbHealthy = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbHealthy = true;
    } catch (error) {
      logger.warn("Database health check failed");
    }

    res.json({
      status: dbHealthy ? "healthy" : "degraded",
      database: dbHealthy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Health check failed");
    res.status(503).json({ status: "unhealthy", error: "Service check failed" });
  }
});

// ================================================
// TOOL ROUTES (OLD - will be deprecated)
// ================================================

// Register new tool
app.post("/api/tools/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, endpointUrl, priceWei, authType, authConfig, openApiSpec } = req.body;
    const ownerWallet = (req as any).agentWallet;

    if (!name || !description || !endpointUrl || !priceWei) {
      return res.status(400).json({ 
        error: "Missing required fields: name, description, endpointUrl, priceWei" 
      });
    }

    const tool = await prisma.tool.create({
      data: {
        onChainId: `tool_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ownerWallet,
        name,
        description,
        endpointUrl,
        priceWei,
        authType: authType || 'none',
        authConfig: authConfig || null,
        schema: {},
        openApiSpec: openApiSpec || {},
        active: true,
      },
    });

    logger.info({ toolId: tool.onChainId }, "Tool registered");

    res.status(201).json({
      success: true,
      tool,
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// ESCROW/BALANCE ROUTES
// ================================================

// Get agent balance
app.get("/api/escrow/balance", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).agentWallet;

    const agent = await prisma.agent.findUnique({
      where: { wallet },
      include: { balance: true },
    });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({ 
      success: true, 
      balance: agent.balance || {
        baseBalanceWei: "0",
        kiteBalanceWei: "0",
        hbarBalance: "0",
      },
    });
  } catch (error) {
    next(error);
  }
});

// ================================================
// REPUTATION ROUTES
// ================================================

// Get leaderboard
app.get("/api/reputation/leaderboard", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const agents = await prisma.agent.findMany({
      where: { active: true },
      orderBy: { reputationScore: 'desc' },
      take: limit,
      select: {
        agentId: true,
        name: true,
        wallet: true,
        reputationScore: true,
        createdAt: true,
      },
    });

    res.json({ success: true, leaderboard: agents });
  } catch (error) {
    next(error);
  }
});

// ================================================
// X402 PAYMENT & SETTLEMENT ROUTES
// ================================================

// Agent management and details
app.use("/api/agents", agentsRouter);

// Settlement history for agents
app.use("/api/settlements", settlementsRouter);

// Tool execution with x402 payments
app.use("/api/tools", toolsRouter);

// 0G Chain iNFT and identity
app.use("/api/zg", zgRouter);

// ================================================
// ERROR HANDLER
// ================================================

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

// ================================================
// START SERVER
// ================================================

async function startServer() {
  try {
    // Verify database connectivity (optional)
    let dbHealthy = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info("✅ Database connected");
      dbHealthy = true;
    } catch (error) {
      logger.warn("⚠️  Database not available - running in degraded mode");
      // Seed demo data when DB is unavailable
      seedDemoData();
      logger.info("✅ Demo data seeded (in-memory storage)");
    }

    // Also seed if degraded mode flag is set
    if (isDegradedMode && dbHealthy === false) {
      seedDemoData();
      logger.info("✅ Demo data seeded (degraded mode)");
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info({ port: PORT }, `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🦅 AI Agent Trust & Payment Layer                       ║
║   Production Backend - ETHDenver 2026                     ║
║                                                            ║
║   Port:    ${PORT}                                             ║
║   Status:  ${dbHealthy ? 'Healthy' : 'Degraded'}          ║
║   Health:  http://localhost:${PORT}/health                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);

      console.log('\n📍 Available endpoints:');
      console.log('  GET  /health');
      console.log('  POST /api/agents');
      console.log('  GET  /api/agents/:agentId');
      console.log('  GET  /api/agents/wallet/:wallet');
      console.log('  GET  /api/agents');
      console.log('  POST /api/tools');
      console.log('  GET  /api/tools/:toolId');
      console.log('  GET  /api/tools');
      console.log('  GET  /api/escrow/balance');
      console.log('  GET  /api/reputation/leaderboard');
      console.log('');
      console.log('🎯 x402 Payment Endpoints (Kite AI):');
      console.log('  POST /api/tools/execute          - Execute tool with x402 payment');
      console.log('  GET  /api/tools/status/:id       - Get execution status');
      console.log('  GET  /api/settlements/:wallet    - Get settlement history');
      console.log('  GET  /api/settlements/batch/:id  - Get batch details');
      console.log('');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down gracefully");

      server.close(async () => {
        try {
          await prisma.$disconnect();
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

