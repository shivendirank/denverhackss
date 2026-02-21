'use client';

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getExplorerAddressUrl } from '@/lib/agents';

function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

export interface AgentIdentityCardProps {
  /** Display name of the agent */
  name: string;
  /** Full wallet address (e.g. Kite AI / Ethereum) */
  walletAddress: string;
  /** Whether the agent has verifiable on-chain identity */
  verified?: boolean;
  /** Optional accent color class for the verified badge (e.g. text-emerald-400) */
  verifiedClassName?: string;
  className?: string;
}

/**
 * Agent Identity Card – shows agent name, truncated wallet address,
 * verified badge, and link to chain explorer (e.g. Kite testnet).
 */
export function AgentIdentityCard({
  name,
  walletAddress,
  verified = true,
  verifiedClassName = 'text-emerald-400',
  className,
}: AgentIdentityCardProps) {
  const explorerUrl = getExplorerAddressUrl(walletAddress);
  const truncated = truncateAddress(walletAddress);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm p-4 md:p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-zinc-200 truncate">
            {name}
          </span>
          {verified && (
            <span
              className={cn(
                'inline-flex items-center gap-1 shrink-0 text-xs font-medium',
                verifiedClassName
              )}
              title="Verifiable on-chain identity"
            >
              <ShieldCheck size={14} strokeWidth={2.5} />
              Verified
            </span>
          )}
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors min-w-0"
          title={`View on Kite Explorer: ${walletAddress}`}
        >
          <span className="truncate">{truncated}</span>
          <ExternalLink size={12} className="shrink-0" />
        </a>
      </div>
      <p className="text-[11px] uppercase tracking-wider text-zinc-500 mt-2">
        Agent identity · Kite AI Testnet
      </p>
    </div>
  );
}
