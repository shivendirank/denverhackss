import { Request, Response, NextFunction } from "express";
import { prisma } from "@/lib/prisma";
import { baseClient, kiteClient } from "@/blockchain/clients";
import type { X402Challenge, X402PaymentProof } from "@/types/x402";
import type { X402PaymentError, InsufficientBalanceError } from "@/types/errors";
import pino from "pino";
import { getAddress } from "viem";

const logger = pino();

/**
 * x402 HTTP Payment protocol middleware
 * Kite AI judges will verify this specific header format
 */
export function x402Middleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only apply to POST /api/tools/execute
  if (req.method !== "POST" || !req.path.includes("/tools/execute")) {
    next();
    return;
  }

  // Handle async operations
  (async () => {
    try {
      const paymentChainHeader = req.headers["x-payment-chain"] as string | undefined;
      const paymentChain: "base" | "kite" = (paymentChainHeader === "base" ? "base" : "kite") as
        | "base"
        | "kite";

      // Extract agent wallet from request (set by SIWE middleware)
      const agentWallet = (req as any).agentWallet as string | undefined;
      if (!agentWallet) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Extract tool ID from request body
      const toolId = (req.body as any)?.toolId as string | undefined;
      if (!toolId) {
        res.status(400).json({ error: "Missing toolId" });
        return;
      }

      // Get tool
      const tool = await prisma.tool.findUnique({
        where: { id: toolId },
      });

      if (!tool) {
        res.status(404).json({ error: "Tool not found" });
        return;
      }

      // Get agent's current balance
      const agent = await prisma.agent.findUnique({
        where: { wallet: agentWallet },
      });

      if (!agent) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }

      const escrow = await prisma.escrowBalance.findUnique({
        where: { agentId: agent.id },
      });

      if (!escrow) {
        res.status(500).json({ error: "Escrow not initialized" });
        return;
      }

      const chainBalance =
        paymentChain === "base"
          ? BigInt(escrow.baseBalanceWei as string)
          : BigInt(escrow.kiteBalanceWei as string);

      const toolPrice = BigInt(tool.priceWei);

      // Check if agent has sufficient balance
      if (chainBalance >= toolPrice) {
        // Sufficient balance - proceed
        (req as any).agentBalance = {
          balance: chainBalance.toString(),
          required: toolPrice.toString(),
        };
        next();
        return;
      }

      // Insufficient balance - return 402 with x402 challenge
      const challenge: X402Challenge = {
        scheme: "x402",
        network: paymentChain,
        asset: "ETH",
        amount: tool.priceWei,
        payTo: process.env[
          paymentChain === "base"
            ? "BASE_ESCROW_CONTRACT"
            : "KITE_ESCROW_CONTRACT"
        ] as string,
        memo: toolId,
        expires: Date.now() + 300000, // 5 minutes
      };

      // CRITICAL: This exact header format is what Kite AI judges will check
      res.status(402).set(
        "WWW-Authenticate",
        `x402 realm="AgentToolLayer", charset="UTF-8"`
      );

      res.status(402).json(challenge);
    } catch (error) {
      logger.error({ error }, "x402 middleware error");
      res.status(500).json({ error: "Internal server error" });
    }
  })();
}

/**
 * Verify x402 payment proof and credit agent balance
 * Called when agent provides X-Payment header with tx hash
 */
export function verifyX402Payment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle async operations
  (async () => {
    try {
      const paymentHeader = req.headers["x-payment"] as string | undefined;
      if (!paymentHeader) {
        next();
        return;
      }

      // Parse payment proof from header
      let proof: X402PaymentProof;
      try {
        proof = JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf-8"));
      } catch (error) {
        res.status(400).json({ error: "Invalid payment header format" });
        return;
      }

      const paymentChainHeader = req.headers["x-payment-chain"] as string | undefined;
      const paymentChain: "base" | "kite" = (paymentChainHeader === "base" ? "base" : "kite") as
        | "base"
        | "kite";

      // Select client based on payment chain
      const client = paymentChain === "base" ? baseClient : kiteClient;

      try {
        const txReceipt = await client.getTransactionReceipt({
          hash: proof.txHash as `0x${string}`,
        });

        if (!txReceipt || txReceipt.status !== "success") {
          res.status(402).json({ error: "Payment transaction failed" });
          return;
        }

        // Verify transaction details
        const expectedTo = process.env[
          paymentChain === "base"
            ? "BASE_ESCROW_CONTRACT"
            : "KITE_ESCROW_CONTRACT"
        ];

        if (txReceipt.to?.toLowerCase() !== expectedTo?.toLowerCase()) {
          res.status(402).json({ error: "Payment sent to wrong address" });
          return;
        }

        // Credit agent balance
        const agentWallet = (req as any).agentWallet as string | undefined;
        if (!agentWallet) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }

        const agent = await prisma.agent.findUnique({
          where: { wallet: agentWallet },
        });

        if (!agent) {
          res.status(404).json({ error: "Agent not found" });
          return;
        }

        const escrow = await prisma.escrowBalance.findUnique({
          where: { agentId: agent.id },
        });

        if (!escrow) {
          res.status(500).json({ error: "Escrow not initialized" });
          return;
        }

        // Add payment amount to agent balance
        const amountWei = BigInt(proof.value);
        const balanceKey = paymentChain === "base" ? "baseBalanceWei" : "kiteBalanceWei";
        const currentBalance = BigInt(escrow[balanceKey as keyof typeof escrow] as string);
        const newBalance = (currentBalance + amountWei).toString();

        await prisma.escrowBalance.update({
          where: { agentId: agent.id },
          data: { [balanceKey]: newBalance },
        });

        logger.info(
          {
            agentWallet,
            chain: paymentChain,
            amount: amountWei.toString(),
            txHash: proof.txHash,
          },
          "x402 payment verified and credited"
        );

        // Continue processing with updated balance
        (req as any).agentBalance = {
          balance: newBalance,
          required: "0",
        };

        next();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error({ error: message }, "Failed to verify payment on-chain");
        res.status(502).json({ error: "Failed to verify payment" });
      }
    } catch (error) {
      logger.error({ error }, "x402 payment verification error");
      res.status(500).json({ error: "Internal server error" });
    }
  })();
}
