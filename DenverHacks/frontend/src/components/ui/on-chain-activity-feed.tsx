'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getKitescanUrl, getAgentPayments, type KitePayment } from '@/lib/kite-api';

function truncateTxHash(hash: string, start = 10, end = 8): string {
  if (hash.length <= start + end || hash === 'pending') return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-zinc-500">—</span>;
  const normalizedStatus = status.toLowerCase();
  const styles: Record<string, string> = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    failed: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  const labels: Record<string, string> = {
    success: 'Confirmed',
    confirmed: 'Confirmed',
    pending: 'Pending',
    failed: 'Failed',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        styles[normalizedStatus] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
      )}
    >
      {labels[normalizedStatus] || normalizedStatus}
    </span>
  );
}

export interface OnChainActivityFeedProps {
  agentWallet?: string;
  entries?: KitePayment[];
  className?: string;
  enableRealTime?: boolean;
}

/**
 * Live on-chain activity feed: action type, amount, status, tx hash with link to Kitescan.
 * Matches agent dashboard theme (dark, zinc borders).
 * Now supports REAL x402 payment data from Kite AI Testnet!
 */
export function OnChainActivityFeed({ 
  agentWallet, 
  entries: providedEntries, 
  className,
  enableRealTime = true 
}: OnChainActivityFeedProps) {
  const [payments, setPayments] = useState<KitePayment[]>(providedEntries || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real payments from API if wallet is provided
  useEffect(() => {
    if (!agentWallet || !enableRealTime || providedEntries) return;

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAgentPayments(agentWallet);
        setPayments(data);
      } catch (err: any) {
        console.error('Failed to fetch payments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [agentWallet, enableRealTime, providedEntries]);

  // Use provided entries or fetched payments
  const displayData = providedEntries || payments;

  if (loading && displayData.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-500',
          className
        )}
      >
        <Loader2 size={24} className="mx-auto mb-2 opacity-50 animate-spin" />
        <p className="text-sm">Loading activity...</p>
      </div>
    );
  }

  if (error && displayData.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-500',
          className
        )}
      >
        <Activity size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm text-rose-400">Failed to load activity</p>
        <p className="text-xs text-zinc-600 mt-1">{error}</p>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-500',
          className
        )}
      >
        <Activity size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No on-chain activity yet</p>
        <p className="text-xs text-zinc-600 mt-1">Execute a tool to see payments here</p>
      </div>
    );
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Use date format
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-zinc-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Live x402 Payments
          </h3>
        </div>
        {loading && (
          <Loader2 size={14} className="text-zinc-500 animate-spin" />
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Tool</th>
              <th className="px-4 py-3 font-medium">Cost (KITE)</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-zinc-200 font-medium">
                  {payment.toolName}
                  {payment.hcsSequence && (
                    <span className="ml-2 text-[10px] text-cyan-400/60">
                      HCS #{payment.hcsSequence}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-amber-400/90 font-mono text-xs font-semibold">
                  {payment.costKite}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {formatTime(payment.timestamp)}
                </td>
                <td className="px-4 py-3">
                  {payment.txHash === 'pending' ? (
                    <span className="font-mono text-xs text-zinc-600">
                      pending...
                    </span>
                  ) : (
                    <a
                      href={getKitescanUrl(payment.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
                      title="View on Kitescan"
                    >
                      {truncateTxHash(payment.txHash)}
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[11px] uppercase tracking-wider text-zinc-600 border-t border-white/5 flex items-center justify-between">
        <span>Kite AI Testnet · testnet.kitescan.ai</span>
        {enableRealTime && agentWallet && (
          <span className="text-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </p>
    </div>
  );
}
