/**
 * Settlements API Routes
 * Provides x402 payment settlement data for agent dashboards
 */

import { Router, type Request, type Response } from "express";
import { findExecutions, findSettlements } from "../services/in-memory-storage.js";

const router = Router();

/**
 * GET /api/settlements/:agentWallet
 * Get all settlements for a specific agent
 */
router.get("/:agentWallet", async (req: Request, res: Response) => {
  try {
    const agentWallet = Array.isArray(req.params.agentWallet) 
      ? req.params.agentWallet[0] 
      : req.params.agentWallet;

    if (!agentWallet) {
      return res.status(400).json({ error: "Agent wallet required" });
    }

    // Get all executions for this agent (successful ones)
    const executions = findExecutions({
      agentWallet: agentWallet.toLowerCase(),
    });

    // Format for frontend
    const payments = executions.map((exec) => ({
      id: exec.id,
      type: "Tool Execution",
      toolName: exec.toolName,
      txHash: exec.kiteTxHash || exec.baseTxHash || "pending",
      costKite: formatWei(exec.costWei),
      costWei: exec.costWei,
      chain: exec.paymentChain,
      hcsSequence: exec.hcsSequenceNumber,
      timestamp: exec.completedAt || exec.createdAt,
      status: exec.status.toLowerCase(),
    }));

    // Sort by timestamp (newest first)
    payments.sort((a, b) => b.timestamp - a.timestamp);

    res.json(payments);
  } catch (error: any) {
    console.error("Error fetching settlements:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/settlements/batch/:batchId
 * Get details of a specific settlement batch
 */
router.get("/batch/:batchId", async (req: Request, res: Response) => {
  try {
    const batchId = Array.isArray(req.params.batchId) 
      ? req.params.batchId[0] 
      : req.params.batchId;

    if (!batchId) {
      return res.status(400).json({ error: "Batch ID required" });
    }

    const settlements = findSettlements({ batchId });

    if (settlements.length === 0) {
      return res.status(404).json({ error: "Settlement batch not found" });
    }

    res.json(settlements[0]);
  } catch (error: any) {
    console.error("Error fetching batch:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Convert wei string to KITE (human-readable)
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
