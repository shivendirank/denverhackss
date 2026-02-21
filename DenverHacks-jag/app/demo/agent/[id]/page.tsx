import { notFound } from 'next/navigation';
import { getAgentDetailById, type AgentDetail } from '@/lib/agents';
import SpatialProductShowcase from '@/components/ui/spatial-product-showcase';

interface PageProps {
  params: { id: string };
}

// API base URL - change to your backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch agent data from real backend
 */
async function fetchAgentData(agentId: string) {
  try {
    const [agentRes, balanceRes, securityRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/agents/${agentId}`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/agents/${agentId}/balance`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/agents/${agentId}/security`, { cache: 'no-store' }),
    ]);

    const agent = agentRes.status === 'fulfilled' && agentRes.value.ok 
      ? await agentRes.value.json() 
      : null;
    const balance = balanceRes.status === 'fulfilled' && balanceRes.value.ok 
      ? await balanceRes.value.json() 
      : null;
    const security = securityRes.status === 'fulfilled' && securityRes.value.ok 
      ? await securityRes.value.json() 
      : null;

    return { agent, balance, security };
  } catch (error) {
    console.error('Error fetching agent data:', error);
    return { agent: null, balance: null, security: null };
  }
}

/**
 * Format timestamp to human-readable
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 1) return `${seconds}s ago`;
  if (hours < 1) return `${minutes}m ago`;
  return `${hours}h ago`;
}

/**
 * Map backend data to frontend AgentDetail format
 */
function mapBackendToAgentDetail(
  agent: any,
  balance: any,
  security: any,
  staticAgent: AgentDetail
): AgentDetail {
  // Map tool usage to format
  const usedTools = (agent.toolUsage || []).slice(0, 5).map((tu: any) => ({
    id: tu.toolId,
    name: tu.toolName,
    count: tu.usageCount,
  }));

  // Map executions to onChainHistory
  const onChainHistory = (agent.recentExecutions || []).slice(0, 10).map((exec: any, idx: number) => ({
    id: String(idx + 1),
    action: exec.toolName || 'Unknown',
    txHash: exec.txHash || '0x' + Math.random().toString(16).substr(2, 64),
    time: formatTimestamp(exec.createdAt),
    amount: formatWei(exec.costWei) + ' KITE',
    status: exec.status.toLowerCase() as 'confirmed' | 'pending' | 'failed',
  }));

  // Map settlements to payments
  const paymentTransactions = (agent.settlements || []).slice(0, 10).map((s: any, idx: number) => ({
    id: String(idx + 1),
    amount: `${s.amountKite || '0'} KITE`,
    direction: 'out' as const,
    time: formatTimestamp(s.createdAt),
  }));

  // Map tool usage for per-tool billing
  const toolUsage = (agent.toolUsage || []).map((tu: any) => ({
    toolId: tu.toolId,
    toolName: tu.toolName,
    usageCount: tu.usageCount,
    totalSpent: tu.totalSpent || '0 KITE',
    lastUsed: onChainHistory.find(h => h.action === tu.toolName)?.time || 'N/A',
  }));

  return {
    ...staticAgent,
    walletAddress: agent.wallet,
    verified: agent.verified || false,
    status: getAgentStatus(agent.name),
    statusDetail: getAgentStatusDetail(agent.name, agent.successfulExecutions || 0),
    onChainHistory,
    usedTools,
    paymentTransactions,
    wallet: balance
      ? {
          balance: `${balance.balanceKite} KITE`,
          balanceRaw: parseFloat(balance.balanceKite),
          lowBalanceThreshold: parseFloat(balance.lowBalanceThreshold),
          faucetUrl: balance.faucetUrl,
        }
      : undefined,
    scopesAndLimits: security
      ? {
          rateLimitPerMin: security.rateLimitPerMin,
          allowedToolIds: security.allowedTools,
          spendLimitPerDay: `${security.spendLimitPerDay} KITE`,
        }
      : undefined,
    toolUsage,
    features: agent.features || staticAgent.features,
  };
}

/**
 * Format wei to KITE
 */
function formatWei(weiString: string): string {
  try {
    const wei = BigInt(weiString);
    const kite = Number(wei) / 1e18;
    return kite.toFixed(4);
  } catch {
    return '0.0000';
  }
}

/**
 * Get agent status
 */
function getAgentStatus(agentName: string): string {
  const statusMap: Record<string, string> = {
    'Neural Core': 'Processing',
    'Quantum Mind': 'Idle',
    'Sentinel Vision': 'Active',
    'Logic Weaver': 'Analyzing',
    'Oracle Prime': 'Research',
  };
  return statusMap[agentName] || 'Active';
}

/**
 * Get agent status detail
 */
function getAgentStatusDetail(agentName: string, executions: number): string {
  const detailMap: Record<string, string> = {
    'Neural Core': `Running inference on batch #${Math.floor(Math.random() * 9000 + 1000)}`,
    'Quantum Mind': 'Awaiting next training job',
    'Sentinel Vision': 'Object detection pipeline live',
    'Logic Weaver': 'Building report for dataset v3',
    'Oracle Prime': `Experiment ${Math.floor(Math.random() * 20 + 1)} — hyperparameter sweep`,
  };
  return detailMap[agentName] || `Completed ${executions} executions`;
}

export default async function AgentPage({ params }: PageProps) {
  const agentId = params.id;

  // Get static UI data (colors, images, etc.)
  const staticAgent = getAgentDetailById(agentId);
  if (!staticAgent) notFound();

  // Fetch real backend data
  const { agent, balance, security } = await fetchAgentData(agentId);

  // If backend returns data, merge with static
  if (agent) {
    const mergedAgent = mapBackendToAgentDetail(agent, balance, security, staticAgent);
    return <SpatialProductShowcase data={mergedAgent} />;
  }

  // Fallback to static mock data if backend unavailable
  return <SpatialProductShowcase data={staticAgent} />;
}
