import { ExecutionStatus, SettlementStatus } from "@prisma/client";

export interface AgentIdentity {
  agentId: string; // bytes32
  wallet: string;
  name: string;
  nftTokenId: string | undefined;
  hederaAccountId: string | undefined;
  hcsTopicId: string | undefined;
  reputationScore: number;
  active: boolean;
  createdAt: Date;
}

export interface EscrowBalance {
  agentId: string;
  baseBalanceWei: string;
  kiteBalanceWei: string;
  hbarBalance: string;
  updatedAt: Date;
}

export interface ExecutionRecord {
  id: string;
  agentId: string;
  toolId: string;
  paramsHash: string;
  resultHash?: string;
  costWei: string;
  paymentChain: "base" | "kite";
  status: ExecutionStatus;
  upstreamStatus?: number;
  baseTxHash?: string;
  kiteTxHash?: string;
  hcsSequence?: number;
  ucpNonce?: string;
  batchId?: string;
  createdAt: Date;
}

export interface SettlementBatch {
  id: string;
  batchId: string;
  executionIds: string[];
  totalWei: string;
  chain: "base" | "kite";
  txHash?: string;
  status: SettlementStatus;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface AgentCreationRequest {
  name: string;
  wallet: string;
}

export interface AgentCreationResponse {
  agentId: string;
  wallet: string;
  nftTokenId: string;
  hederaAccountId: string;
  hcsTopicId: string;
}

export interface ReputationScore {
  score: number; // 0-100
  totalExecutions: number;
  successRate: number;
  totalVolumeWei: string;
  lastUpdated: Date;
}
