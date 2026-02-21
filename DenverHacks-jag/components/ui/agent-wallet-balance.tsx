'use client';

import React from 'react';
import { Wallet, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentWallet } from '@/lib/agents';

export interface AgentWalletBalanceProps {
  wallet: AgentWallet;
  className?: string;
}

/**
 * Agent wallet: balance (Kite testnet), low balance warning, link to faucet.
 */
export function AgentWalletBalance({ wallet, className }: AgentWalletBalanceProps) {
  const isLow = wallet.balanceRaw < wallet.lowBalanceThreshold;

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm overflow-hidden',
        isLow && 'border-amber-500/30',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
        <Wallet size={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Agent wallet
        </h3>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-xl font-semibold text-zinc-100">{wallet.balance}</span>
          <span className="text-xs text-zinc-500">Kite Testnet</span>
        </div>
        {isLow && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-amber-200 text-xs">
            <AlertTriangle size={14} />
            <span>Low balance. Top up to avoid failed payments.</span>
          </div>
        )}
        <a
          href={wallet.faucetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Get testnet KITE
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
