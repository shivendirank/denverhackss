/**
 * Agents API Routes
 * Provides agent details, balances, usage stats, security settings
 */

import { Router, type Request, type Response } from "express";
import {
  findAgents,
  getAgent,
  getAgentByWallet,
  findExecutions,
  findTools,
  findSettlements,
} from "../services/in-memory-storage.js";

const router = Router();

/**
 * GET /api/agents
 * List all agents
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const agents = findAgents();

    const formatted = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      wallet: agent.wallet,
      hcsTopicId: agent.hcsTopicId,
      verified: !!agent.hcsTopicId,
      createdAt: agent.createdAt,
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/:id
 * Get agent details with all dashboard data
 */
router.get("/:id", (req: Request, res: Response) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID required" });
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Get executions for this agent
    const executions = findExecutions({ agentWallet: agent.wallet });

    // Calculate total spent
    let totalSpentWei = 0n;
    for (const exec of executions) {
      if (exec.status === "SUCCESS") {
        totalSpentWei += BigInt(exec.costWei);
      }
    }

    // Get tool usage stats (group by tool)
    const toolUsageMap = new Map<string, { name: string; count: number; spent: bigint }>();
    for (const exec of executions) {
      if (exec.status === "SUCCESS") {
        const existing = toolUsageMap.get(exec.toolId);
        if (existing) {
          existing.count++;
          existing.spent += BigInt(exec.costWei);
        } else {
          toolUsageMap.set(exec.toolId, {
            name: exec.toolName,
            count: 1,
            spent: BigInt(exec.costWei),
          });
        }
      }
    }

    const toolUsage = Array.from(toolUsageMap.entries()).map(([toolId, data]) => ({
      toolId,
      toolName: data.name,
      usageCount: data.count,
      totalSpent: formatWei(data.spent.toString()),
    }));

    // Get recent settlements
    const settlements = findSettlements({ agentWallet: agent.wallet });

    // Agent features based on characteristics
    const features = getAgentFeatures(agent.name);

    res.json({
      id: agent.id,
      name: agent.name,
      wallet: agent.wallet,
      verified: !!agent.hcsTopicId,
      hcsTopicId: agent.hcsTopicId,
      totalExecutions: executions.length,
      successfulExecutions: executions.filter((e) => e.status === "SUCCESS").length,
      totalSpent: formatWei(totalSpentWei.toString()),
      toolUsage,
      recentExecutions: executions.slice(0, 10),
      settlements: settlements.slice(0, 5),
      features,
      hasTEE: getAgentTEEStatus(agent.name),
      specialization: getAgentSpecialization(agent.name),
    });
  } catch (error: any) {
    console.error("Error fetching agent details:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/:id/balance
 * Get agent wallet balance (simulated for demo)
 */
router.get("/:id/balance", (req: Request, res: Response) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID required" });
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Calculate spent amount
    const executions = findExecutions({ agentWallet: agent.wallet });
    let totalSpentWei = 0n;
    for (const exec of executions) {
      if (exec.status === "SUCCESS") {
        totalSpentWei += BigInt(exec.costWei);
      }
    }

    // Simulate starting balance based on agent
    const startingBalances: Record<string, string> = {
      "Neural Core": "1500000000000000000", // 1.5 KITE
      "Quantum Mind": "2000000000000000000", // 2.0 KITE
      "Sentinel Vision": "1000000000000000000", // 1.0 KITE
      "Logic Weaver": "800000000000000000", // 0.8 KITE
      "Oracle Prime": "2500000000000000000", // 2.5 KITE
    };

    const startingBalanceWei = BigInt(startingBalances[agent.name] || "1000000000000000000");
    const currentBalanceWei = startingBalanceWei - totalSpentWei;

    res.json({
      agentId: agent.id,
      agentWallet: agent.wallet,
      balanceKite: formatWei(currentBalanceWei.toString()),
      balanceWei: currentBalanceWei.toString(),
      totalSpent: formatWei(totalSpentWei.toString()),
      chain: "kite",
      lowBalanceThreshold: "0.1",
      faucetUrl: "https://faucet.gokite.ai",
    });
  } catch (error: any) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/:id/security
 * Get agent security settings (scopes & limits)
 */
router.get("/:id/security", (req: Request, res: Response) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID required" });
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Get all tools
    const allTools = findTools({ active: true });

    // Security settings vary by agent
    const securityProfiles: Record<
      string,
      { rateLimit: number; dailyLimit: string; allowedTools: string[] }
    > = {
      "Neural Core": {
        rateLimit: 30,
        dailyLimit: "0.5",
        allowedTools: allTools.map((t) => t.id), // Full access
      },
      "Quantum Mind": {
        rateLimit: 20,
        dailyLimit: "0.3",
        allowedTools: allTools.filter((t) => t.name.includes("Oracle") || t.name.includes("Sentiment")).map((t) => t.id),
      },
      "Sentinel Vision": {
        rateLimit: 15,
        dailyLimit: "0.2",
        allowedTools: allTools.filter((t) => t.name.includes("Image")).map((t) => t.id),
      },
      "Logic Weaver": {
        rateLimit: 25,
        dailyLimit: "0.4",
        allowedTools: allTools.filter((t) => t.name.includes("Data") || t.name.includes("Analysis")).map((t) => t.id),
      },
      "Oracle Prime": {
        rateLimit: 40,
        dailyLimit: "1.0",
        allowedTools: allTools.filter((t) => t.name.includes("Price") || t.name.includes("Oracle")).map((t) => t.id),
      },
    };

    const profile = securityProfiles[agent.name] || securityProfiles["Neural Core"];

    // Calculate current usage
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const recentExecutions = findExecutions({ agentWallet: agent.wallet }).filter(
      (e) => e.createdAt > oneDayAgo
    );

    let todaySpentWei = 0n;
    for (const exec of recentExecutions) {
      if (exec.status === "SUCCESS") {
        todaySpentWei += BigInt(exec.costWei);
      }
    }

    res.json({
      agentId: agent.id,
      agentWallet: agent.wallet,
      rateLimitPerMin: profile.rateLimit,
      currentCallsToday: recentExecutions.length,
      spendLimitPerDay: profile.dailyLimit,
      currentSpendToday: formatWei(todaySpentWei.toString()),
      allowedTools: profile.allowedTools,
      allowedToolNames: allTools
        .filter((t) => profile.allowedTools.includes(t.id))
        .map((t) => t.name),
      revocationStatus: "active",
    });
  } catch (error: any) {
    console.error("Error fetching security settings:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Format wei to KITE
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

/**
 * Helper: Get agent features/metrics
 */
function getAgentFeatures(agentName: string): Array<{ label: string; value: number; icon: string }> {
  const features: Record<string, Array<{ label: string; value: number; icon: string }>> = {
    "Neural Core": [
      { label: "Latency", value: 12, icon: "Zap" },
      { label: "Sync Rate", value: 98, icon: "Wifi" },
      { label: "TEE Security", value: 100, icon: "Brain" },
    ],
    "Quantum Mind": [
      { label: "Throughput", value: 94, icon: "Cpu" },
      { label: "Accuracy", value: 88, icon: "Brain" },
      { label: "Research Score", value: 92, icon: "Activity" },
    ],
    "Sentinel Vision": [
      { label: "FPS", value: 60, icon: "Activity" },
      { label: "Detection", value: 92, icon: "Zap" },
      { label: "TEE Security", value: 100, icon: "Brain" },
    ],
    "Logic Weaver": [
      { label: "Data Load", value: 78, icon: "Cpu" },
      { label: "Model Score", value: 96, icon: "Brain" },
      { label: "Batch Efficiency", value: 85, icon: "Wifi" },
    ],
    "Oracle Prime": [
      { label: "Inference", value: 85, icon: "Zap" },
      { label: "Uptime", value: 99, icon: "Wifi" },
      { label: "TEE Security", value: 100, icon: "Brain" },
    ],
  };

  return features[agentName] || features["Neural Core"];
}

/**
 * Helper: Check if agent has TEE
 */
function getAgentTEEStatus(agentName: string): boolean {
  const teeEnabled = ["Neural Core", "Sentinel Vision", "Oracle Prime"];
  return teeEnabled.includes(agentName);
}

/**
 * Helper: Get agent specialization
 */
function getAgentSpecialization(agentName: string): string {
  const specializations: Record<string, string> = {
    "Neural Core": "Autonomous Trading & Multi-tool Coordination",
    "Quantum Mind": "Research & Sentiment Analysis",
    "Sentinel Vision": "Computer Vision & Model Training",
    "Logic Weaver": "Data Processing & Batch Operations",
    "Oracle Prime": "Financial Analytics & Real-time Data",
  };

  return specializations[agentName] || "General Purpose";
}

export default router;
