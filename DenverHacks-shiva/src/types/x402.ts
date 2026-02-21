export interface X402Challenge {
  scheme: "x402";
  network: "base" | "kite" | string;
  asset: string; // e.g., "ETH", "HBAR"
  amount: string; // wei as string
  payTo: string; // escrow contract address
  memo: string; // toolId
  expires: number; // unix timestamp ms
}

export interface X402PaymentProof {
  txHash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
}

export interface X402State {
  challenge: X402Challenge;
  proof?: X402PaymentProof;
  verified: boolean;
}
