'use client';

import React, { useEffect, useState } from 'react';
import { Shield, TrendingUp, Activity, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentNFTStatus {
  agentId: string;
  agentName: string;
  wallet: string;
  hasnft: boolean;
  tokenId?: string;
  reputation?: number;
  actionCount?: number;
  explorerUrl?: string | null;
}

interface ZeroGStatusResponse {
  total: number;
  minted: number;
  pending: number;
  agents: AgentNFTStatus[];
}

export interface ZeroGDashboardOverviewProps {
  apiBaseUrl?: string;
  className?: string;
}

/**
 * 0G Dashboard Overview
 * Shows NFT minting status for all agents in the system
 */
export function ZeroGDashboardOverview({
  apiBaseUrl = 'http://localhost:3000',
  className,
}: ZeroGDashboardOverviewProps) {
  const [status, setStatus] = useState<ZeroGStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${apiBaseUrl}/api/zg/agents/status`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data);
      } catch (err: any) {
        console.error('Failed to fetch 0G status:', err);
        setError(err.message || 'Failed to load status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-purple-950/20 backdrop-blur-sm p-6',
          className
        )}
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-violet-400" />
            <span className="text-sm text-zinc-400">Loading 0G Chain status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'rounded-xl border border-red-500/20 bg-red-950/10 backdrop-blur-sm p-6',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">
              Failed to connect to 0G Chain
            </p>
            <p className="text-xs text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const completionPercentage = status.total > 0 
    ? Math.round((status.minted / status.total) * 100)
    : 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-purple-950/20 backdrop-blur-sm',
        className
      )}
    >
      {/* Header Stats */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              0G Chain Identity Status
            </h2>
          </div>
          <a
            href="https://explorer-testnet.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            0G Explorer
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-black/30 p-4">
            <div className="text-xs text-zinc-500 mb-1">Total Agents</div>
            <div className="text-2xl font-bold text-zinc-200">{status.total}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-4 border border-white/10">
            <div className="text-xs text-white/60 mb-1">Minted NFTs</div>
            <div className="text-2xl font-bold text-white/70">{status.minted}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-4 border border-white/10">
            <div className="text-xs text-white/60 mb-1">Pending</div>
            <div className="text-2xl font-bold text-white/70">{status.pending}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Minting Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white/40 to-white/60 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Agent Details</h3>
        <div className="space-y-2">
          {status.agents.map((agent) => (
            <div
              key={agent.agentId}
              className={cn(
                'rounded-lg border p-3 transition-all duration-200',
                agent.hasnft
                  ? 'border-white/20 bg-white/5'
                  : 'border-zinc-700/50 bg-zinc-900/40'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200">
                      {agent.agentName}
                    </span>
                    {agent.hasnft && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                        <Shield size={10} />
                        Minted
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                    <span className="font-mono">
                      {agent.wallet.slice(0, 6)}...{agent.wallet.slice(-4)}
                    </span>
                    {agent.hasnft && (
                      <>
                        <span className="flex items-center gap-1">
                          Token #{agent.tokenId}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={10} />
                          {agent.reputation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity size={10} />
                          {agent.actionCount} actions
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {agent.explorerUrl && (
                  <a
                    href={agent.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 transition-colors"
                    title="View on 0G Explorer"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="rounded-lg bg-violet-950/30 border border-violet-500/20 p-3">
          <p className="text-xs text-zinc-400">
            <span className="font-semibold text-violet-300">0G Chain</span> provides
            verifiable on-chain identity and reputation for autonomous AI agents.
            All actions are cryptographically logged and composable.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ZeroGDashboardOverview;
