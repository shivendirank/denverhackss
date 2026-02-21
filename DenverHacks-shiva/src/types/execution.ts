export interface ExecutionContext {
  agentWallet: string;
  agentId: string;
  toolId: string;
  params: Record<string, unknown>;
  signature: string;
  paymentChain: "base" | "kite";
  nonce: number;
}

export interface UpstreamResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  duration: number; // ms
}

export interface ExecutionResult {
  executionId: string;
  success: boolean;
  upstream?: UpstreamResponse;
  costWei: string;
  batchId?: string;
  ucpNonce: string;
  hcsSequence?: number;
}

export interface EIP712Signature {
  v: number;
  r: string;
  s: string;
  deadline?: number;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface EIP712Execution {
  toolId: string; // bytes32
  paramsHash: string; // bytes32
  nonce: number;
}
