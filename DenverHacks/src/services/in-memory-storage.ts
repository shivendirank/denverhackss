/**
 * In-Memory Storage for Development Mode
 * This replaces PostgreSQL when DATABASE_URL is not configured
 * Perfect for rapid prototyping and demos
 */

import type { Chain } from "../blockchain/clients.js";

export interface Execution {
  id: string;
  agentId: string;
  agentWallet: string;
  toolId: string;
  toolName: string;
  toolOwnerWallet: string;
  costWei: string;
  paymentChain: Chain;
  status: "PENDING" | "SUCCESS" | "FAILED";
  baseTxHash?: string;
  kiteTxHash?: string;
  hcsSequenceNumber?: number;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
}

export interface Settlement {
  id: string;
  batchId: string;
  executionIds: string[];
  agentWallet: string;
  toolOwnerWallet: string;
  totalWei: string;
  chain: Chain;
  txHash: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  confirmedAt?: number;
  createdAt: number;
}

export interface Agent {
  id: string;
  name: string;
  wallet: string;
  hcsTopicId?: string;
  createdAt: number;
}

export interface Tool {
  id: string;
  name: string;
  ownerWallet: string;
  priceWei: string;
  apiEndpoint: string;
  active: boolean;
  createdAt: number;
}

// In-memory stores
const executions: Map<string, Execution> = new Map();
const settlements: Map<string, Settlement> = new Map();
const agents: Map<string, Agent> = new Map();
const tools: Map<string, Tool> = new Map();

// Helper to check if we're in degraded mode
export const isDegradedMode = !process.env.DATABASE_URL;

// ============================================
// EXECUTION CRUD
// ============================================

export function createExecution(data: Omit<Execution, "id" | "createdAt">): Execution {
  const id = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const execution: Execution = {
    ...data,
    id,
    createdAt: Date.now(),
  };
  executions.set(id, execution);
  return execution;
}

export function getExecution(id: string): Execution | undefined {
  return executions.get(id);
}

export function findExecutions(filter: Partial<Execution>): Execution[] {
  return Array.from(executions.values()).filter((exec) =>
    Object.entries(filter).every(([key, value]) => exec[key as keyof Execution] === value)
  );
}

export function updateExecution(id: string, data: Partial<Execution>): Execution | null {
  const execution = executions.get(id);
  if (!execution) return null;

  const updated = { ...execution, ...data };
  executions.set(id, updated);
  return updated;
}

// ============================================
// SETTLEMENT CRUD
// ============================================

export function createSettlement(data: Omit<Settlement, "id" | "createdAt">): Settlement {
  const id = `settle-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const settlement: Settlement = {
    ...data,
    id,
    createdAt: Date.now(),
  };
  settlements.set(id, settlement);
  return settlement;
}

export function getSettlement(id: string): Settlement | undefined {
  return settlements.get(id);
}

export function findSettlements(filter: Partial<Settlement>): Settlement[] {
  return Array.from(settlements.values()).filter((settle) =>
    Object.entries(filter).every(([key, value]) => settle[key as keyof Settlement] === value)
  );
}

// ============================================
// AGENT CRUD
// ============================================

export function createAgent(
  data: Omit<Agent, "id" | "createdAt"> & { id?: string }
): Agent {
  const id = data.id || `agent-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const agent: Agent = {
    name: data.name,
    wallet: data.wallet,
    hcsTopicId: data.hcsTopicId,
    id,
    createdAt: Date.now(),
  };
  agents.set(id, agent);
  return agent;
}

export function getAgent(id: string): Agent | undefined {
  return agents.get(id);
}

export function getAgentByWallet(wallet: string): Agent | undefined {
  return Array.from(agents.values()).find((a) => a.wallet.toLowerCase() === wallet.toLowerCase());
}

export function findAgents(): Agent[] {
  return Array.from(agents.values());
}

// ============================================
// TOOL CRUD
// ============================================

export function createTool(
  data: Omit<Tool, "id" | "createdAt"> & { id?: string }
): Tool {
  const id = data.id || `tool-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const tool: Tool = {
    name: data.name,
    ownerWallet: data.ownerWallet,
    priceWei: data.priceWei,
    apiEndpoint: data.apiEndpoint,
    active: data.active,
    id,
    createdAt: Date.now(),
  };
  tools.set(id, tool);
  return tool;
}

export function getTool(id: string): Tool | undefined {
  return tools.get(id);
}

export function findTools(filter: Partial<Tool>): Tool[] {
  return Array.from(tools.values()).filter((tool) =>
    Object.entries(filter).every(([key, value]) => tool[key as keyof Tool] === value)
  );
}

// ============================================
// SEED DATA (for demo) - 5 Unique Agents
// ============================================

export function seedDemoData() {
  // ============== AGENT 01: Neural Core ==============
  // Features: TEE-enabled, high balance, autonomous trader
  const agent01 = createAgent({
    id: "01",
    name: "Neural Core",
    wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f8bC31",
    hcsTopicId: "0.0.123456",
  });

  // ============== AGENT 02: Quantum Mind ==============
  // Features: No TEE, research focus, price oracle specialist
  const agent02 = createAgent({
    id: "02",
    name: "Quantum Mind",
    wallet: "0x853e46Dd7645D0642a4c9ba455cCe8f9cA627dE2",
    hcsTopicId: "0.0.123457",
  });

  // ============== AGENT 03: Sentinel Vision ==============
  // Features: TEE-enabled, computer vision, model training
  const agent03 = createAgent({
    id: "03",
    name: "Sentinel Vision",
    wallet: "0x9A4B3C2D1E0F5A6B7C8D9E0F1A2B3C4D5E6F7A8B",
    hcsTopicId: "0.0.123458",
  });

  // ============== AGENT 04: Logic Weaver ==============
  // Features: No TEE, data processing, batch operations
  const agent04 = createAgent({
    id: "04",
    name: "Logic Weaver",
    wallet: "0x1F2E3D4C5B6A7988776655443322110000FEDCBA",
    hcsTopicId: "0.0.123459",
  });

  // ============== AGENT 05: Oracle Prime ==============
  // Features: TEE-enabled, financial data, real-time analytics
  const agent05 = createAgent({
    id: "05",
    name: "Oracle Prime",
    wallet: "0xABCDEF0123456789ABCDEF0123456789ABCDEF01",
    hcsTopicId: "0.0.123460",
  });

  // ============== TOOLS ==============
  const weatherTool = createTool({
    name: "Weather API",
    ownerWallet: "0x000000000000000000000000000000000000dEaD",
    priceWei: "2000000000000000", // 0.002 KITE
    apiEndpoint: "https://api.openweathermap.org/data/2.5/weather",
    active: true,
  });

  const priceOracle = createTool({
    name: "Price Oracle",
    ownerWallet: "0x000000000000000000000000000000000000dEaD",
    priceWei: "5000000000000000", // 0.005 KITE
    apiEndpoint: "https://api.coingecko.com/api/v3/simple/price",
    active: true,
  });

  const imageGen = createTool({
    name: "Image Generation",
    ownerWallet: "0x000000000000000000000000000000000000dEaD",
    priceWei: "10000000000000000", // 0.01 KITE
    apiEndpoint: "https://api.stability.ai/v1/generation",
    active: true,
  });

  const dataAnalysis = createTool({
    name: "Data Analysis",
    ownerWallet: "0x000000000000000000000000000000000000dEaD",
    priceWei: "3000000000000000", // 0.003 KITE
    apiEndpoint: "https://api.datanalysis.io/v1/analyze",
    active: true,
  });

  const sentimentAPI = createTool({
    name: "Sentiment Analysis",
    ownerWallet: "0x000000000000000000000000000000000000dEaD",
    priceWei: "1500000000000000", // 0.0015 KITE
    apiEndpoint: "https://api.sentiment.ai/v1/analyze",
    active: true,
  });

  // ============== EXECUTIONS - Agent 01 (Neural Core) ==============
  // Active trader, uses weather + price oracle
  createExecution({
    agentId: agent01.id,
    agentWallet: agent01.wallet,
    toolId: weatherTool.id,
    toolName: weatherTool.name,
    toolOwnerWallet: weatherTool.ownerWallet,
    costWei: weatherTool.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x7a3f2e1b9c8d5f6e4a2b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    hcsSequenceNumber: 12345,
    completedAt: Date.now() - 300000,
  });

  createExecution({
    agentId: agent01.id,
    agentWallet: agent01.wallet,
    toolId: priceOracle.id,
    toolName: priceOracle.name,
    toolOwnerWallet: priceOracle.ownerWallet,
    costWei: priceOracle.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
    hcsSequenceNumber: 12346,
    completedAt: Date.now() - 240000,
  });

  createExecution({
    agentId: agent01.id,
    agentWallet: agent01.wallet,
    toolId: weatherTool.id,
    toolName: weatherTool.name,
    toolOwnerWallet: weatherTool.ownerWallet,
    costWei: weatherTool.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x3c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    hcsSequenceNumber: 12347,
    completedAt: Date.now() - 120000,
  });

  // ============== EXECUTIONS - Agent 02 (Quantum Mind) ==============
  // Research focus, price oracle + sentiment
  createExecution({
    agentId: agent02.id,
    agentWallet: agent02.wallet,
    toolId: priceOracle.id,
    toolName: priceOracle.name,
    toolOwnerWallet: priceOracle.ownerWallet,
    costWei: priceOracle.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x4d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e",
    hcsSequenceNumber: 12348,
    completedAt: Date.now() - 180000,
  });

  createExecution({
    agentId: agent02.id,
    agentWallet: agent02.wallet,
    toolId: sentimentAPI.id,
    toolName: sentimentAPI.name,
    toolOwnerWallet: sentimentAPI.ownerWallet,
    costWei: sentimentAPI.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x5e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f",
    hcsSequenceNumber: 12349,
    completedAt: Date.now() - 90000,
  });

  // ============== EXECUTIONS - Agent 03 (Sentinel Vision) ==============
  // Computer vision, image generation
  createExecution({
    agentId: agent03.id,
    agentWallet: agent03.wallet,
    toolId: imageGen.id,
    toolName: imageGen.name,
    toolOwnerWallet: imageGen.ownerWallet,
    costWei: imageGen.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
    hcsSequenceNumber: 12350,
    completedAt: Date.now() - 360000,
  });

  // ============== EXECUTIONS - Agent 04 (Logic Weaver) ==============
  // Data processing specialist
  createExecution({
    agentId: agent04.id,
    agentWallet: agent04.wallet,
    toolId: dataAnalysis.id,
    toolName: dataAnalysis.name,
    toolOwnerWallet: dataAnalysis.ownerWallet,
    costWei: dataAnalysis.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x7a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    hcsSequenceNumber: 12351,
    completedAt: Date.now() - 480000,
  });

  createExecution({
    agentId: agent04.id,
    agentWallet: agent04.wallet,
    toolId: dataAnalysis.id,
    toolName: dataAnalysis.name,
    toolOwnerWallet: dataAnalysis.ownerWallet,
    costWei: dataAnalysis.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x8b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c",
    hcsSequenceNumber: 12352,
    completedAt: Date.now() - 210000,
  });

  // ============== EXECUTIONS - Agent 05 (Oracle Prime) ==============
  // Financial specialist, price oracle heavy user
  createExecution({
    agentId: agent05.id,
    agentWallet: agent05.wallet,
    toolId: priceOracle.id,
    toolName: priceOracle.name,
    toolOwnerWallet: priceOracle.ownerWallet,
    costWei: priceOracle.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0x9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    hcsSequenceNumber: 12353,
    completedAt: Date.now() - 150000,
  });

  createExecution({
    agentId: agent05.id,
    agentWallet: agent05.wallet,
    toolId: priceOracle.id,
    toolName: priceOracle.name,
    toolOwnerWallet: priceOracle.ownerWallet,
    costWei: priceOracle.priceWei,
    paymentChain: "kite",
    status: "SUCCESS",
    kiteTxHash: "0xa0d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
    hcsSequenceNumber: 12354,
    completedAt: Date.now() - 60000,
  });

  console.log("✅ Seeded 5 unique agents with distinct features");
  console.log("  - Agent 01 (Neural Core): TEE, Trading, 3 executions");
  console.log("  - Agent 02 (Quantum Mind): No TEE, Research, 2 executions");
  console.log("  - Agent 03 (Sentinel Vision): TEE, Vision, 1 execution");
  console.log("  - Agent 04 (Logic Weaver): No TEE, Data, 2 executions");
  console.log("  - Agent 05 (Oracle Prime): TEE, Finance, 2 executions");
}
