'use client';

import { useEffect, useState } from 'react';
import { Shield, ExternalLink, Loader2, CheckCircle2, Clock, Link } from 'lucide-react';

interface AgentNFTData {
  tokenId?: string;
  reputation: number;
  actionCount: number;
  hasTEE: boolean;
  active: boolean;
  explorerUrl?: string | null;
  txHash?: string;
  blockNumber?: number;
  mintedAt?: number;
}

interface AgentZeroGNFTProps {
  agentId: string;
  apiBaseUrl?: string;
}

export default function AgentZeroGNFT({ agentId, apiBaseUrl = 'http://localhost:3000' }: AgentZeroGNFTProps) {
  const [nftData, setNftData] = useState<AgentNFTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<'pending' | 'confirmed' | 'unknown'>('unknown');

  const ZG_NETWORK = '0G Newton Testnet';
  const ZG_CHAIN_ID = '16602';
  const ZG_EXPLORER = 'https://explorer-testnet.0g.ai';

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/zg/agents/${agentId}/nft`)
      .then(res => res.json())
      .then(data => {
        // Handle both minted and not-minted status
        if (data.status === 'minted' && data.agent) {
          setNftData({
            tokenId: data.agent.tokenId,
            reputation: data.agent.reputation || 0,
            actionCount: data.agent.actionCount || 0,
            hasTEE: data.agent.hasTEE || false,
            active: data.agent.active || false,
            explorerUrl: data.agent.explorerUrl,
            txHash: data.agent.txHash,
            blockNumber: data.agent.blockNumber,
            mintedAt: data.agent.mintedAt,
          });
          setTxStatus('confirmed');
        } else if (data.status === 'not-minted') {
          // Show placeholder for not minted
          setNftData(null);
          setTxStatus('unknown');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId, apiBaseUrl]);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-emerald-500/20">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" />
      </div>
    );
  }

  if (!nftData?.tokenId) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-emerald-400/50" />
          <span className="font-mono text-sm text-white/50">0G Identity NFT</span>
        </div>
        
        {/* Chain Info */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/40">Network</span>
            <span className="text-emerald-400/70 font-medium">{ZG_NETWORK}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Chain ID</span>
            <span className="text-white/60 font-mono">{ZG_CHAIN_ID}</span>
          </div>
        </div>

        <div className="text-center text-white/40 text-sm py-4">
          <div className="mb-2">⏳ NFT not minted yet</div>
          <div className="text-xs text-white/30">Awaiting blockchain confirmation</div>
        </div>

        <a
          href={ZG_EXPLORER}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors mt-3"
        >
          <Link className="w-3 h-3" />
          View on 0G Explorer
        </a>
      </div>
    );
  }

  const reputationColor = nftData.reputation >= 75 ? 'emerald' : nftData.reputation >= 50 ? 'blue' : 'yellow';

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-emerald-500/20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-sm text-white/90">0G Identity NFT</span>
        </div>
        {nftData.explorerUrl && (
          <a
            href={nftData.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Chain & Transaction Status */}
      <div className="bg-black/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Network</span>
          <span className="text-emerald-400 font-medium">{ZG_NETWORK}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Chain ID</span>
          <span className="text-white/60 font-mono">{ZG_CHAIN_ID}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
          <span className="text-white/40">Transaction</span>
          <div className="flex items-center gap-1.5">
            {txStatus === 'confirmed' ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Confirmed</span>
              </>
            ) : txStatus === 'pending' ? (
              <>
                <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-medium">Pending</span>
              </>
            ) : (
              <span className="text-white/40">Unknown</span>
            )}
          </div>
        </div>
        {nftData.txHash && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">TX Hash</span>
            <a
              href={`${ZG_EXPLORER}/tx/${nftData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400/70 hover:text-emerald-400 font-mono text-[10px] flex items-center gap-1"
            >
              {nftData.txHash.slice(0, 6)}...{nftData.txHash.slice(-4)}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
        {nftData.blockNumber && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Block</span>
            <span className="text-white/60 font-mono">#{nftData.blockNumber}</span>
          </div>
        )}
      </div>

      {/* Token ID */}
      <div>
        <div className="text-xs text-white/40 mb-1">Token ID</div>
        <div className="font-mono text-sm text-white/70">#{nftData.tokenId}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/40 mb-1">Reputation</div>
          <div className={`text-lg font-bold text-${reputationColor}-400`}>
            {nftData.reputation}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/40 mb-1">Actions</div>
          <div className="text-lg font-bold text-white/70">
            {nftData.actionCount}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 pt-2 border-t border-white/5">
        {nftData.hasTEE && (
          <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400">
            TEE Enabled
          </span>
        )}
        {nftData.active && (
          <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-400">
            Active
          </span>
        )}
      </div>
    </div>
  );
}
