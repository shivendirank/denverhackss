/**
 * Execution Proxy Service
 * Handles autonomous tool execution with x402 payment verification
 */

import axios from "axios";
import {
  isDegradedMode,
  createExecution,
  getAgentByWallet,
  getTool,
  type Execution,
  type Tool,
} from "./in-memory-storage.js";
import { processSettlementBatch } from "./settlement.js";

interface ExecutionContext {
  agentWallet: string;
  toolId: string;
  params: Record<string, any>;
  paymentChain: "kite" | "base";
}

interface ExecutionResult {
  executionId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  result?: any;
  error?: string;
  estimatedSettlement?: number;
}

/**
 * Execute a tool call with x402 payment flow
 * 1. Verify agent identity
 * 2. Check escrow balance (simulated for demo)
 * 3. Create execution record
 * 4. Call tool API
 * 5. Mark for settlement
 */
export async function executeToolCall(context: ExecutionContext): Promise<ExecutionResult> {
  try {
    // 1. Get agent
    const agent = getAgentByWallet(context.agentWallet);
    if (!agent) {
      throw new Error(`Agent not found: ${context.agentWallet}`);
    }

    // 2. Get tool
    const tool = getTool(context.toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${context.toolId}`);
    }

    if (!tool.active) {
      throw new Error(`Tool is not active: ${tool.name}`);
    }

    // 3. Check balance (simulated for demo)
    const hasBalance = await checkAgentBalance(context.agentWallet, tool.priceWei, context.paymentChain);
    if (!hasBalance) {
      throw new Error(`Insufficient balance. Required: ${formatWei(tool.priceWei)} KITE`);
    }

    // 4. Create execution record (PENDING)
    const execution = createExecution({
      agentId: agent.id,
      agentWallet: agent.wallet,
      toolId: tool.id,
      toolName: tool.name,
      toolOwnerWallet: tool.ownerWallet,
      costWei: tool.priceWei,
      paymentChain: context.paymentChain,
      status: "PENDING",
    });

    console.log(`🚀 Executing tool: ${tool.name} (${execution.id})`);

    // 5. Execute tool API call (with timeout)
    let result: any;
    try {
      const response = await axios.post(
        tool.apiEndpoint,
        context.params,
        {
          timeout: 30000, // 30 second timeout
          headers: {
            "Content-Type": "application/json",
            "X-Agent-Id": agent.id,
            "X-Execution-Id": execution.id,
          },
        }
      );
      result = response.data;
    } catch (apiError: any) {
      // Tool API failed, but we still charge (pay-per-attempt model)
      console.warn(`⚠️  Tool API failed: ${apiError.message}`);
      result = { error: apiError.message };
    }

    // 6. Schedule settlement (non-blocking)
    setTimeout(() => {
      processSettlementBatch(context.paymentChain).catch((err) => {
        console.error("Settlement error (non-blocking):", err);
      });
    }, 5000); // Settle after 5 seconds

    return {
      executionId: execution.id,
      status: "PENDING",
      result,
      estimatedSettlement: Date.now() + 30000,
    };
  } catch (error: any) {
    console.error("Execution error:", error);
    return {
      executionId: `failed-${Date.now()}`,
      status: "FAILED",
      error: error.message,
    };
  }
}

/**
 * Check if agent has sufficient balance in escrow
 * TODO: Replace with real blockchain call when contracts are deployed
 */
async function checkAgentBalance(
  agentWallet: string,
  requiredWei: string,
  chain: "kite" | "base"
): Promise<boolean> {
  // In demo mode, always return true
  if (isDegradedMode) {
    console.log(`✅ Balance check passed (demo mode): ${agentWallet}`);
    return true;
  }

  // TODO: Call Escrow.balanceOf(agentWallet) on blockchain
  // const balance = await escrowContract.read.balanceOf([agentWallet]);
  // return balance >= BigInt(requiredWei);

  return true;
}

/**
 * Format wei to human-readable KITE
 */
function formatWei(weiString: string): string {
  const wei = BigInt(weiString);
  const kite = Number(wei) / 1e18;
  return kite.toFixed(4);
}

/**
 * Get execution status by ID
 */
export function getExecutionStatus(executionId: string): Execution | undefined {
  const { getExecution } = require("./in-memory-storage.js");
  return getExecution(executionId);
}
