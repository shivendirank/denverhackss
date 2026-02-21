/**
 * Kite AI API Client
 * Frontend service for interacting with x402 payment backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface KitePayment {
  id: string;
  type: string;
  toolName: string;
  txHash: string;
  costKite: string;
  costWei?: string;
  chain: 'kite' | 'base';
  hcsSequence?: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface ExecutionResult {
  executionId: string;
  status: 'pending' | 'success' | 'failed';
  result?: any;
  error?: string;
  estimatedSettlement?: number;
}

export interface ToolExecutionParams {
  agentWallet: string;
  toolId: string;
  params?: Record<string, any>;
  paymentChain?: 'kite' | 'base';
}

/**
 * Get payment/settlement history for an agent
 */
export async function getAgentPayments(agentWallet: string): Promise<KitePayment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/settlements/${agentWallet}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch payments: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching agent payments:', error);
    return [];
  }
}

/**
 * Execute a tool call with x402 payment
 * This triggers autonomous payment flow:
 * 1. Create execution record
 * 2. Deduct from escrow (optimistic)
 * 3. Call tool API
 * 4. Schedule settlement batch
 */
export async function executeToolCall(params: ToolExecutionParams): Promise<ExecutionResult> {
  try {
    const res = await fetch(`${API_BASE}/api/tools/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentWallet: params.agentWallet,
        toolId: params.toolId,
        params: params.params || {},
        paymentChain: params.paymentChain || 'kite',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Execution failed');
    }

    return res.json();
  } catch (error: any) {
    return {
      executionId: `failed-${Date.now()}`,
      status: 'failed',
      error: error.message,
    };
  }
}

/**
 * Get status of a specific execution
 */
export async function getExecutionStatus(executionId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/tools/status/${executionId}`);
    
    if (!res.ok) {
      throw new Error('Execution not found');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching execution status:', error);
    return null;
  }
}

/**
 * Get all available tools
 */
export async function getAvailableTools(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tools`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch tools');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching tools:', error);
    return [];
  }
}

/**
 * Format wei to human-readable KITE
 */
export function formatKite(weiString: string): string {
  try {
    const wei = BigInt(weiString);
    const kite = Number(wei) / 1e18;
    return kite.toFixed(4);
  } catch {
    return '0.0000';
  }
}

/**
 * Get Kitescan explorer URL for transaction
 */
export function getKitescanUrl(txHash: string): string {
  return `https://testnet.kitescan.ai/tx/${txHash}`;
}

/**
 * Get Hedera explorer URL for HCS attestation
 */
export function getHederaExplorerUrl(topicId: string, sequenceNumber: number): string {
  return `https://hashscan.io/testnet/topic/${topicId}/message/${sequenceNumber}`;
}

/**
 * Get list of all agents
 */
export async function getAgents(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/agents`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch agents');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
}

/**
 * Get detailed agent data with all dashboard metrics
 */
export async function getAgentDetails(agentId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/agents/${agentId}`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch agent details');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching agent details:', error);
    return null;
  }
}

/**
 * Get agent wallet balance
 */
export async function getAgentBalance(agentId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/agents/${agentId}/balance`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch agent balance');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching agent balance:', error);
    return null;
  }
}

/**
 * Get agent security settings (scopes & limits)
 */
export async function getAgentSecurity(agentId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/agents/${agentId}/security`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch agent security');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching agent security:', error);
    return null;
  }
}
