'use client';

import React from 'react';
import { ExternalLink, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/agents';
import type { OnChainEntry, OnChainStatus } from '@/lib/agents';

function truncateTxHash(hash: string, start = 10, end = 8): string {
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
}

function StatusBadge({ status }: { status?: OnChainStatus }) {
  if (!status) return <span className="text-zinc-500">—</span>;
  const styles: Record<OnChainStatus, string> = {
    confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    failed: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  const labels: Record<OnChainStatus, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    failed: 'Failed',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

export interface OnChainActivityFeedProps {
  entries: OnChainEntry[];
  className?: string;
}

/**
 * Live on-chain activity feed: action type, amount, status, tx hash with link to Kitescan.
 * Matches agent dashboard theme (dark, zinc, borders).
 */
export function OnChainActivityFeed({ entries, className }: OnChainActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-500',
          className
        )}
      >
        <Activity size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No on-chain activity yet</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
        <Activity size={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Live on-chain activity
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Tx hash</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-zinc-200 font-medium">{entry.action}</td>
                <td className="px-4 py-3 text-zinc-300 font-mono text-xs">
                  {entry.amount ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{entry.time}</td>
                <td className="px-4 py-3">
                  <a
                    href={getExplorerTxUrl(entry.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="View on Kitescan"
                  >
                    {truncateTxHash(entry.txHash)}
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[11px] uppercase tracking-wider text-zinc-600 border-t border-white/5">
        Kite AI Testnet · testnet.kitescan.ai
      </p>
    </div>
  );
}
