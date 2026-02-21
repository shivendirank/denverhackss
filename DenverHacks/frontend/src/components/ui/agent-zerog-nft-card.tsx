'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZeroGNFTData {
  status: 'minted' | 'not-minted';
  tokenId?: string;
  reputation?: number;
  actionCount?: number;
  explorerUrl?: string;
  agent?: {
    id: string;
    name: string;
    wallet: string;
  };
}

export interface AgentZeroGNFTCardProps {
  agentId: string;
  apiBaseUrl?: string;
  className?: string;
}

/**
 * Agent 0G NFT Card
 * Displays agent's iNFT (intelligent NFT) data from 0G Chain
 * Shows: NFT status, reputation score, action count, explorer link
 */
export function AgentZeroGNFTCard({
  agentId,
  apiBaseUrl = 'http://localhost:3000',
  className,
}: AgentZeroGNFTCardProps) {
  const [nftData, setNftData] = useState<ZeroGNFTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${apiBaseUrl}/api/zg/agents/${agentId}/nft`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setNftData(data);
      } catch (err: any) {
        console.error('Failed to fetch 0G NFT data:', err);
        setError(err.message || 'Failed to load NFT data');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
    // Poll every 30 seconds
    const interval = setInterval(fetchNFTData, 30000);
    return () => clearInterval(interval);
  }, [agentId, apiBaseUrl]);

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-purple-950/20 backdrop-blur-sm p-4 md:p-5',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-violet-400" />
          <span className="text-sm text-zinc-400">Loading 0G NFT...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'rounded-xl border border-red-500/20 bg-red-950/10 backdrop-blur-sm p-4 md:p-5',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm text-red-400">0G Chain unavailable</span>
        </div>
      </div>
    );
  }

  if (!nftData || nftData.status === 'not-minted') {
    return (
      <div
        className={cn(
          'rounded-xl border border-zinc-700/50 bg-zinc-900/40 backdrop-blur-sm p-4 md:p-5',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
          <span className="text-sm text-zinc-400">No 0G NFT</span>
        </div>
      </div>
    );
  }

  // Minted NFT display
  const reputationColor = (score: number) => {
    if (score >= 150) return 'text-emerald-400';
    if (score >= 100) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/30 to-purple-950/20 backdrop-blur-sm p-4 md:p-5 hover:border-violet-500/50 transition-all duration-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-violet-400" />
          <span className="text-sm font-semibold text-violet-300">
            0G Chain iNFT
          </span>
        </div>
        {nftData.explorerUrl && (
          <a
            href={nftData.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-violet-400 transition-colors"
            title="View on 0G Explorer"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Token ID */}
        <div className="rounded-lg bg-black/30 p-3">
          <div className="text-xs text-zinc-500 mb-1">Token ID</div>
          <div className="text-base font-mono font-semibold text-violet-300">
            #{nftData.tokenId}
          </div>
        </div>

        {/* Reputation Score */}
        <div className="rounded-lg bg-black/30 p-3">
          <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
            <TrendingUp size={12} />
            Reputation
          </div>
          <div className={cn('text-base font-semibold', reputationColor(nftData.reputation || 0))}>
            {nftData.reputation || 0}
          </div>
        </div>

        {/* Action Count */}
        <div className="rounded-lg bg-black/30 p-3">
          <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
            <Activity size={12} />
            Actions
          </div>
          <div className="text-base font-semibold text-blue-400">
            {nftData.actionCount || 0}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            On-chain identity & reputation
          </span>
          <span className="text-violet-400 font-medium">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

export default AgentZeroGNFTCard;
