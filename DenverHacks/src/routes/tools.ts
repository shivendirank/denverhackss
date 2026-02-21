/**
 * Tools API Routes
 * Handles tool execution with x402 payments
 */

import { Router, type Request, type Response } from "express";
import { executeToolCall, getExecutionStatus } from "../services/executionProxy.js";
import { findTools } from "../services/in-memory-storage.js";

const router = Router();

/**
 * POST /api/tools/execute
 * Execute a tool with x402 payment
 */
router.post("/execute", async (req: Request, res: Response) => {
  try {
    const { agentWallet, toolId, params, paymentChain = "kite" } = req.body;

    if (!agentWallet || !toolId) {
      return res.status(400).json({
        error: "Missing required fields: agentWallet, toolId",
      });
    }

    const result = await executeToolCall({
      agentWallet,
      toolId,
      params: params || {},
      paymentChain,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Tool execution error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tools/status/:executionId
 * Get status of a tool execution
 */
router.get("/status/:executionId", (req: Request, res: Response) => {
  try {
    const executionId = Array.isArray(req.params.executionId) 
      ? req.params.executionId[0] 
      : req.params.executionId;

    const execution = getExecutionStatus(executionId || '');

    if (!execution) {
      return res.status(404).json({ error: "Execution not found" });
    }

    res.json({
      id: execution.id,
      status: execution.status.toLowerCase(),
      toolName: execution.toolName,
      costKite: formatWei(execution.costWei),
      txHash: execution.kiteTxHash || execution.baseTxHash,
      createdAt: execution.createdAt,
      completedAt: execution.completedAt,
    });
  } catch (error: any) {
    console.error("Error fetching execution status:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tools
 * List all available tools
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const tools = findTools({ active: true });

    const formatted = tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      priceKite: formatWei(tool.priceWei),
      priceWei: tool.priceWei,
      apiEndpoint: tool.apiEndpoint,
      ownerWallet: tool.ownerWallet,
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Convert wei string to KITE
 */
function formatWei(weiString: string): string {
  try {
    const wei = BigInt(weiString);
    const kite = Number(wei) / 1e18;
    return kite.toFixed(4);
  } catch {
    return "0.0000";
  }
}

export default router;
