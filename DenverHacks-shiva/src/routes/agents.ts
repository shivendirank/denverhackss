import { Router, Request, Response } from "express";
import { z } from "zod";
import { createAgent, getAgent, getAgentByWallet } from "@/services/agentIdentity";
import { validateBody } from "@/middleware/validate";
import pino from "pino";

const logger = pino();
const router = Router();

const agentCreationSchema = z.object({
  name: z.string().min(1).max(100),
});

const agentIdParamSchema = z.object({
  agentId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

/**
 * GET /api/agents
 * List all registered agents
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { prisma } = await import("@/lib/prisma");
    const agents = await prisma.agent.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        agentId: true,
        name: true,
        wallet: true,
        reputationScore: true,
        hcsTopicId: true,
        nftTokenId: true,
        createdAt: true,
      },
    });
    res.json(agents);
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/agents
 * Create a new agent with on-chain identity
 */
router.post(
  "/",
  validateBody(agentCreationSchema),
  async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const wallet = (req as any).agentWallet as string;

      if (!wallet) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const agent = await createAgent(wallet, name);

      logger.info(
        { agentId: agent.agentId, wallet, name },
        "Agent created"
      );

      res.status(201).json(agent);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/agents/:agentId
 * Get agent identity and reputation
 */
router.get("/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params as { agentId: string };

    const agent = await getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json(agent);
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/agents/wallet/:wallet
 * Get agent by wallet address
 */
router.get("/wallet/:wallet", async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params as { wallet: string };

    const agent = await getAgentByWallet(wallet);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json(agent);
  } catch (error) {
    throw error;
  }
});

export default router;
