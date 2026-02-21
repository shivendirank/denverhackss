import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody, validateQuery } from "@/middleware/validate";
import pino from "pino";

const logger = pino();
const router = Router();

const depositSchema = z.object({
  chain: z.enum(["base", "kite"]),
});

/**
 * GET /api/escrow/balance
 * Get agent's escrow balance on all chains
 */
router.get("/balance", async (req: Request, res: Response) => {
  try {
    const wallet = (req as any).agentWallet as string;

    if (!wallet) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const agent = await prisma.agent.findUnique({
      where: { wallet },
      include: { balance: true },
    });

    if (!agent || !agent.balance) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      agentId: agent.agentId,
      baseBalanceWei: agent.balance.baseBalanceWei,
      kiteBalanceWei: agent.balance.kiteBalanceWei,
      hbarBalance: agent.balance.hbarBalance,
      updatedAt: agent.balance.updatedAt,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/escrow/deposit
 * Record a deposit (actual deposit must be sent first via direct contract call)
 * Returns tx details for client to verify on-chain
 */
router.post(
  "/deposit",
  validateBody(depositSchema),
  async (req: Request, res: Response) => {
    try {
      const { chain } = req.body;
      const wallet = (req as any).agentWallet as string;

      if (!wallet) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const agent = await prisma.agent.findUnique({
        where: { wallet },
      });

      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      logger.info(
        { agentId: agent.agentId, chain, wallet },
        "Deposit initiated"
      );

      // Return contract details for client to call deposit() on
      const contractAddress =
        chain === "base"
          ? process.env.BASE_ESCROW_CONTRACT
          : process.env.KITE_ESCROW_CONTRACT;

      res.json({
        message: "Please send ETH to the Escrow contract deposit() function",
        contract: contractAddress,
        chain,
        agentAddress: wallet,
      });
    } catch (error) {
      throw error;
    }
  }
);

/**
 * POST /api/escrow/withdraw
 * Initiate withdrawal from escrow (contract will send funds)
 */
router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const wallet = (req as any).agentWallet as string;

    if (!wallet) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const agent = await prisma.agent.findUnique({
      where: { wallet },
      include: { balance: true },
    });

    if (!agent || !agent.balance) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const totalBalance =
      BigInt(agent.balance.baseBalanceWei) +
      BigInt(agent.balance.kiteBalanceWei);

    if (totalBalance === 0n) {
      return res.status(400).json({ error: "No balance to withdraw" });
    }

    logger.info(
      {
        agentId: agent.agentId,
        totalBalanceWei: totalBalance.toString(),
      },
      "Withdrawal initiated"
    );

    res.json({
      message: "Call withdraw() on both Base and Kite Escrow contracts to receive your funds",
      totalBalanceWei: totalBalance.toString(),
      baseBalanceWei: agent.balance.baseBalanceWei,
      kiteBalanceWei: agent.balance.kiteBalanceWei,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
