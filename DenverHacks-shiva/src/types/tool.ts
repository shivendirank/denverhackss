export interface ToolSpec {
  id: string;
  onChainId: string;
  name: string;
  description: string;
  schema: OpenAIFunction;
  endpointUrl: string;
  priceWei: string;
  authType: "none" | "apikey" | "bearer" | "oauth2";
  authConfig?: string;
  active: boolean;
  createdAt: Date;
  zgStorageRef: string | undefined;
  baseToolId: string | undefined;
  kiteTxHash: string | undefined;
}

export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolExecutionRequest {
  toolId: string;
  params: Record<string, unknown>;
  agentWallet: string;
  signature: string;
  paymentChain: "base" | "kite";
  nonce: number;
}

export interface ToolRegistrationPayload {
  openApiSpecUrl?: string;
  openApiSpec?: Record<string, unknown>;
  endpointUrl: string;
  name: string;
  description: string;
  priceWei: string;
  authType: "none" | "apikey" | "bearer" | "oauth2";
  authConfig?: Record<string, string>;
}
