export interface AgentAttestation {
  type:
    | "TOOL_EXECUTED"
    | "PAYMENT_SETTLED"
    | "REPUTATION_UPDATED"
    | "AGENT_REGISTERED";
  agentId: string;
  toolId?: string;
  costWei?: string;
  result: "SUCCESS" | "FAILURE";
  timestamp: number;
  meta?: Record<string, string>;
}

export interface ReputationData {
  score: number; // 0-100
  totalExecutions: number;
  successRate: number;
  totalVolumeWei: string;
  lastUpdated: number | Date;
}

export type ReputationScore = ReputationData;

export interface UCPMessage {
  type:
    | "CAPABILITY_AD"
    | "COMMERCE_REQUEST"
    | "COMMERCE_ACCEPT"
    | "COMMERCE_COMPLETE";
  fromAgentId: string;
  toAgentId?: string;
  toolId?: string;
  nonce?: string;
  offerAmount?: string;
  txId?: string;
  result?: "SUCCESS" | "FAILURE";
  timestamp: number;
}

export interface HCSAttestationResponse {
  topicId: string;
  sequenceNumber: number;
  timestamp: number;
}

export interface HCSQuery {
  topicId: string;
  limit?: number;
  order?: "asc" | "desc";
}
