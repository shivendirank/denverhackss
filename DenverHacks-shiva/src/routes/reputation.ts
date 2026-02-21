import { Router, Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import Redis from "ioredis";
import { config } from "@/config";
import pino from "pino";

const logger = pino();
const router = Router();
const redis = new Redis(config.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 0 });
redis.on("error", () => {}); // Suppress errors

/**
 * GET /api/reputation/leaderboard
 * Get top agents by reputation score
 */
router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    // Check cache first — fail fast if Redis not ready
    let cached: string | null = null;
    try {
      cached = await redis.get("leaderboard:cache");
    } catch { /* cache miss, continue to DB */ }

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const agents = await prisma.agent.findMany({
      where: { active: true },
      orderBy: { reputationScore: "desc" },
      take: 100,
      select: {
        id: true,
        agentId: true,
        name: true,
        reputationScore: true,
        reputationData: true,
        createdAt: true,
        nftTokenId: true,
      },
    });

    const leaderboard = agents.map((agent, index) => ({
      rank: index + 1,
      ...agent,
    }));

    // Cache for 5 minutes — best effort
    try {
      await redis.setex("leaderboard:cache", 300, JSON.stringify(leaderboard));
    } catch { /* cache write not critical */ }

    res.json(leaderboard);
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/reputation/:agentId
 * Get detailed reputation metrics for an agent
 */
router.get("/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params as { agentId: string };

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Query executions separately since they're not a direct relation
    const executions = await prisma.execution.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const successCount = executions.filter((e) => e.status === "SUCCESS").length;
    const totalCount = executions.length;

    res.json({
      agentId: agent.agentId,
      name: agent.name,
      reputationScore: agent.reputationScore,
      reputationData: agent.reputationData,
      totalExecutions: executions.length,
      successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(2) : "0",
      recentExecutions: executions,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
