export interface UCPCapabilityAd {
  type: "CAPABILITY_AD";
  agentId: string;
  tools: {
    toolId: string;
    name: string;
    description: string;
    priceWei: string;
  }[];
  timestamp: number;
}

export interface UCPCommerceRequest {
  type: "COMMERCE_REQUEST";
  nonce: string;
  fromAgentId: string;
  toAgentId: string;
  toolId: string;
  offerAmount: string;
  timestamp: number;
}

export interface UCPCommerceAccept {
  type: "COMMERCE_ACCEPT";
  nonce: string;
  agentId: string;
  executionId: string;
  timestamp: number;
}

export interface UCPCommerceComplete {
  type: "COMMERCE_COMPLETE";
  nonce: string;
  agentId: string;
  txId: string;
  result: "SUCCESS" | "FAILURE";
  timestamp: number;
}

export type UCPMessagePayload =
  | UCPCapabilityAd
  | UCPCommerceRequest
  | UCPCommerceAccept
  | UCPCommerceComplete;
