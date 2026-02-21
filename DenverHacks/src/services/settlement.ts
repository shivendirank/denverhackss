/**
 * Settlement Service for x402 Payments
 * Processes batched settlements to Escrow contract on Kite AI Testnet
 */

import { encodeFunctionData } from "viem";
import { getWalletClientForChain, kiteClient } from "../blockchain/clients.js";
import { ESCROW_ABI, getContractAddressForChain } from "../blockchain/contracts.js";
import {
  isDegradedMode,
  findExecutions,
  updateExecution,
  createSettlement,
  type Execution,
} from "./in-memory-storage.js";
import type { Chain } from "../blockchain/clients.js";

interface SettlementGroup {
  agentWallet: string;
  toolOwnerWallet: string;
  executionIds: string[];
  totalWei: bigint;
}

/**
 * Process settlement batch for Kite AI chain
 * Groups pending executions and submits atomic debit calls
 */
export async function processSettlementBatch(chain: Chain = "kite"): Promise<void> {
  try {
    // In degraded mode, use in-memory storage
    if (isDegradedMode) {
      console.log(`⚠️  Running settlement in memory-only mode (chain: ${chain})`);
      return await processSettlementInMemory(chain);
    }

    // TODO: Add Prisma support here when DATABASE_URL is configured
    console.log(`⚠️  PostgreSQL support coming soon. Using in-memory for now.`);
    return await processSettlementInMemory(chain);
  } catch (error) {
    console.error("Settlement batch error:", error);
    throw error;
  }
}

/**
 * In-memory settlement processing (for demo mode)
 */
async function processSettlementInMemory(chain: Chain): Promise<void> {
  // Fetch all PENDING executions on this chain
  const executions = findExecutions({ status: "PENDING", paymentChain: chain });

  if (executions.length === 0) {
    console.log(`No pending executions to settle on ${chain}`);
    return;
  }

  console.log(`Found ${executions.length} pending execution(s) on ${chain}`);

  // Group by (agentWallet, toolOwnerWallet)
  const groups: Map<string, SettlementGroup> = new Map();

  for (const execution of executions) {
    const key = `${execution.agentWallet}:${execution.toolOwnerWallet}`;

    if (!groups.has(key)) {
      groups.set(key, {
        agentWallet: execution.agentWallet,
        toolOwnerWallet: execution.toolOwnerWallet,
        executionIds: [],
        totalWei: 0n,
      });
    }

    const group = groups.get(key)!;
    group.executionIds.push(execution.id);
    group.totalWei += BigInt(execution.costWei);
  }

  console.log(`Processing ${groups.size} settlement group(s)`);

  // Submit debit for each group
  const walletClient = getWalletClientForChain(chain);
  const escrowAddress = getContractAddressForChain(chain, "escrow");

  if (!walletClient) {
    console.warn("⚠️  No wallet client (RELAYER_PRIVATE_KEY not set). Simulating settlements...");
    // Simulate settlement without actual blockchain transaction
    for (const group of groups.values()) {
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

      // Update executions to SUCCESS
      for (const executionId of group.executionIds) {
        updateExecution(executionId, {
          status: "SUCCESS",
          kiteTxHash: mockTxHash,
          completedAt: Date.now(),
        });
      }

      // Create settlement record
      const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      createSettlement({
        batchId,
        executionIds: group.executionIds,
        agentWallet: group.agentWallet,
        toolOwnerWallet: group.toolOwnerWallet,
        totalWei: group.totalWei.toString(),
        chain,
        txHash: mockTxHash,
        status: "CONFIRMED",
        confirmedAt: Date.now(),
      });

      console.log(`✅ Simulated settlement: ${group.agentWallet} → ${group.toolOwnerWallet} (${group.totalWei.toString()} wei)`);
    }
    return;
  }

  // Real blockchain settlement (when RELAYER_PRIVATE_KEY is set)
  for (const group of groups.values()) {
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

      // Submit transaction via wallet client
      const sendTransaction = walletClient.sendTransaction as any;
      const hash = await sendTransaction({
        to: escrowAddress as `0x${string}`,
        data: debitData,
      });

      // Wait for confirmation
      await kiteClient.waitForTransactionReceipt({ hash });

      // Update executions to SUCCESS
      for (const executionId of group.executionIds) {
        updateExecution(executionId, {
          status: "SUCCESS",
          kiteTxHash: hash,
          completedAt: Date.now(),
        });
      }

      // Create settlement record
      const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      createSettlement({
        batchId,
        executionIds: group.executionIds,
        agentWallet: group.agentWallet,
        toolOwnerWallet: group.toolOwnerWallet,
        totalWei: group.totalWei.toString(),
        chain,
        txHash: hash,
        status: "CONFIRMED",
        confirmedAt: Date.now(),
      });

      console.log(`✅ Settlement confirmed: ${hash}`);
    } catch (error) {
      console.error(`Failed to settle group ${group.agentWallet}:${group.toolOwnerWallet}`, error);

      // Mark executions as FAILED
      for (const executionId of group.executionIds) {
        updateExecution(executionId, {
          status: "FAILED",
          errorMessage: String(error),
          completedAt: Date.now(),
        });
      }
    }
  }
}

/**
 * Get estimated settlement time for pending executions
 */
export function getEstimatedSettlementTime(): number {
  // Settlements typically process within 30 seconds
  return Date.now() + 30000;
}
