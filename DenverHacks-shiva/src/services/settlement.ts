import { prisma } from "@/lib/prisma";
import { submitTransaction } from "@/blockchain/relayer";
import { getContractAddressForChain, ESCROW_ABI } from "@/blockchain/contracts";
import { submitAttestation } from "@/hedera/hcsAttestation";
import { encodeFunctionData } from "viem";
import { ExecutionStatus } from "@prisma/client";
import type { AgentAttestation } from "@/types/hedera";
import pino from "pino";

const logger = pino();

/**
 * Process settlement batch for a given chain
 * Group executions by (agentWallet, toolOwnerWallet)
 * Submit atomic debit calls to Escrow contract
 */
export async function processSettlementBatch(chain: "base" | "kite"): Promise<void> {
  try {
    // Fetch all PENDING executions on this chain (up to 50)
    const executions = await prisma.execution.findMany({
      where: {
        status: "PENDING",
        paymentChain: chain,
      },
      take: 50,
      include: {
        agent: true,
        tool: true,
      },
    });

    if (executions.length === 0) {
      logger.debug({ chain }, "No pending executions to settle");
      return;
    }

    // Group by (agentWallet, toolOwnerWallet)
    const groups: {
      [key: string]: {
        agentWallet: string;
        toolOwnerWallet: string;
        executionIds: string[];
        totalWei: bigint;
      };
    } = {};

    for (const execution of executions) {
      const key = `${execution.agent.wallet}:${execution.tool.ownerWallet}`;

      if (!groups[key]) {
        groups[key] = {
          agentWallet: execution.agent.wallet,
          toolOwnerWallet: execution.tool.ownerWallet,
          executionIds: [],
          totalWei: 0n,
        };
      }

      groups[key].executionIds.push(execution.id);
      groups[key].totalWei += BigInt(execution.costWei);
    }

    logger.info(
      { chain, groupCount: Object.keys(groups).length, executionCount: executions.length },
      "Processing settlement batch"
    );

    // Submit debit for each group
    const escrowAddress = getContractAddressForChain(chain, "escrow");

    for (const groupKey of Object.keys(groups)) {
      const group = groups[groupKey];
      if (!group) {
        logger.warn({ groupKey }, "Skipping undefined group");
        continue;
      }

      try {
        const debitData = encodeFunctionData({
          abi: ESCROW_ABI,
          functionName: "debit",
          args: [
            group.agentWallet as `0x${string}`,
            group.toolOwnerWallet as `0x${string}`,
            group.totalWei,
          ],
        });

        const result = await submitTransaction({
          chain,
          to: escrowAddress as `0x${string}`,
          data: debitData,
        });

        // Update all executions in this group to SUCCESS
        await prisma.execution.updateMany({
          where: { id: { in: group.executionIds } },
          data: {
            status: "SUCCESS",
            [chain === "base" ? "baseTxHash" : "kiteTxHash"]: result.txHash,
          },
        });

        // Create settlement record
        const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await prisma.settlement.create({
          data: {
            id: batchId,
            batchId,
            executionIds: group.executionIds,
            totalWei: group.totalWei.toString(),
            chain,
            txHash: result.txHash,
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });

        logger.info(
          {
            chain,
            agentWallet: group.agentWallet,
            toolOwnerWallet: group.toolOwnerWallet,
            totalWei: group.totalWei.toString(),
            txHash: result.txHash,
            executionCount: group.executionIds.length,
          },
          "Settlement confirmed"
        );

        // Submit PAYMENT_SETTLED attestations (non-blocking)
        for (const executionId of group.executionIds) {
          const execution = executions.find((e) => e.id === executionId);
          if (execution && execution.agent.hcsTopicId) {
            const attestation: AgentAttestation = {
              type: "PAYMENT_SETTLED",
              agentId: execution.agentId,
              toolId: execution.toolId,
              costWei: execution.costWei,
              result: "SUCCESS",
              timestamp: Date.now(),
              meta: {
                txHash: result.txHash,
                chain,
                executionId,
              },
            };

            submitAttestation(execution.agent.hcsTopicId, attestation).catch((err) => {
              logger.error({ error: err }, "Failed to submit settlement attestation (non-blocking)");
            });
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(
          { chain, agentWallet: group.agentWallet, error: message },
          "Settlement debit failed"
        );

        // Mark executions as FAILED and restore balances
        await prisma.execution.updateMany({
          where: { id: { in: group.executionIds } },
          data: { status: "FAILED" },
        });

        // Restore escrow balances for all agents in this transaction
        for (const executionId of group.executionIds) {
          const execution = executions.find((e) => e.id === executionId);
          if (execution) {
            const balanceKey = chain === "base" ? "baseBalanceWei" : "kiteBalanceWei";
            const currentBalance = await prisma.escrowBalance.findUnique({
              where: { agentId: execution.agentId },
            });

            if (currentBalance) {
              const current = BigInt((currentBalance[balanceKey as keyof typeof currentBalance] as string) || "0");
              const restored = (current + BigInt(execution.costWei)).toString();

              await prisma.escrowBalance.update({
                where: { agentId: execution.agentId },
                data: { [balanceKey]: restored },
              });
            }
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ chain, error: message }, "Settlement batch processing failed");
    throw error;
  }
}

/**
 * Trigger settlement batch processing
 * Should be called by:
 * - BullMQ queue timer (every 5 minutes)
 * - Or when 50 PENDING executions accumulated
 */
export async function triggerSettlement(chain: "base" | "kite"): Promise<void> {
  const pendingCount = await prisma.execution.count({
    where: {
      status: "PENDING",
      paymentChain: chain,
    },
  });

  if (pendingCount > 0) {
    logger.info({ chain, pendingCount }, "Triggering settlement");
    await processSettlementBatch(chain);
  }
}
