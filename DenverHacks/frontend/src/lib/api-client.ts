/**
 * API Client for AI Agent Trust & Payment Layer Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Agent {
  id: string;
  agentId: string;
  wallet: string;
  nftTokenId?: string;
  hederaAccountId?: string;
  hcsTopicId?: string;
  name: string;
  reputationScore: number;
  reputationData?: any;
  active: boolean;
  createdAt: string;
  balance?: {
    baseBalanceWei: string;
    kiteBalanceWei: string;
    hbarBalance: string;
  };
  executions?: Execution[];
}

export interface Tool {
  id: string;
  onChainId: string;
  ownerWallet: string;
  name: string;
  description: string;
  endpointUrl: string;
  priceWei: string;
  active: boolean;
  createdAt: string;
}

export interface Execution {
  id: string;
  agentId: string;
  toolId: string;
  costWei: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Agent methods
  async createAgent(data: { name: string; wallet: string }): Promise<{ success: boolean; agent: Agent }> {
    return this.fetch('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgent(agentId: string): Promise<{ success: boolean; agent: Agent }> {
    return this.fetch(`/api/agents/${agentId}`);
  }

  async getAgentByWallet(wallet: string): Promise<{ success: boolean; agent: Agent }> {
    return this.fetch(`/api/agents/wallet/${wallet}`);
  }

  async listAgents(limit: number = 50): Promise<{ success: boolean; agents: Agent[]; count: number }> {
    return this.fetch(`/api/agents?limit=${limit}`);
  }

  // Tool methods
  async registerTool(data: {
    name: string;
    description: string;
    endpointUrl: string;
    priceWei: string;
    authType?: string;
    authConfig?: any;
    openApiSpec?: any;
  }): Promise<{ success: boolean; tool: Tool }> {
    return this.fetch('/api/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTool(toolId: string): Promise<{ success: boolean; tool: Tool }> {
    return this.fetch(`/api/tools/${toolId}`);
  }

  async listTools(limit: number = 50): Promise<{ success: boolean; tools: Tool[]; count: number }> {
    return this.fetch(`/api/tools?limit=${limit}`);
  }

  // Balance methods
  async getBalance(wallet: string): Promise<{ success: boolean; balance: any }> {
    return this.fetch('/api/escrow/balance', {
      headers: {
        'x-wallet': wallet,
      },
    });
  }

  // Reputation methods
  async getLeaderboard(limit: number = 100): Promise<{ success: boolean; leaderboard: any[] }> {
    return this.fetch(`/api/reputation/leaderboard?limit=${limit}`);
  }

  // 0G Chain / NFT methods
  async getZeroGStatus(): Promise<{
    total: number;
    minted: number;
    pending: number;
    agents: Array<{
      agentId: string;
      agentName: string;
      wallet: string;
      hasnft: boolean;
      tokenId?: string;
      reputation?: number;
      actionCount?: number;
      explorerUrl?: string | null;
    }>;
  }> {
    return this.fetch('/api/zg/agents/status');
  }

  async getAgentNFT(agentId: string): Promise<{
    success: boolean;
    agent: {
      name: string;
      wallet: string;
      specialization: string;
      hasTEE: boolean;
      reputation: number;
      actionCount: number;
      createdAt: number;
      active: boolean;
      tokenId?: string;
      explorerUrl?: string | null;
    };
  }> {
    return this.fetch(`/api/zg/agents/${agentId}/nft`);
  }

  async mintAgentNFT(agentId: string): Promise<{
    success: boolean;
    message: string;
    tokenId?: string;
    explorerUrl?: string | null;
  }> {
    return this.fetch(`/api/zg/agents/${agentId}/mint`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: boolean; timestamp: string }> {
    return this.fetch('/health');
  }
}

export const apiClient = new APIClient();

export default apiClient;
