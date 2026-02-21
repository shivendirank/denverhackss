'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PaymentTx } from '@/lib/agents';

export interface PaymentInflowOutflowChartProps {
  transactions: PaymentTx[];
  className?: string;
}

/** Parse numeric value from amount string e.g. "+0.24 ETH" or "-0.02 ETH" */
function parseAmount(amount: string): number {
  const n = parseFloat(amount.replace(/[^0-9.-]/g, '').trim());
  return Number.isFinite(n) ? Math.abs(n) : 0;
}

/**
 * Inflow vs outflow chart: sums recent transactions and shows two bars or a stacked bar.
 */
export function PaymentInflowOutflowChart({ transactions, className }: PaymentInflowOutflowChartProps) {
  const { inflowTotal, outflowTotal, inflowLabel, outflowLabel } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    for (const tx of transactions) {
      const val = parseAmount(tx.amount);
      if (tx.direction === 'in') inSum += val;
      else outSum += val;
    }
    const sample = transactions[0]?.amount ?? '';
    const unit = sample.trim().split(/\s+/).pop() ?? '';
    return {
      inflowTotal: inSum,
      outflowTotal: outSum,
      inflowLabel: inSum > 0 ? `+${inSum.toFixed(2)} ${unit}`.trim() : '—',
      outflowLabel: outSum > 0 ? `−${outSum.toFixed(2)} ${unit}`.trim() : '—',
    };
  }, [transactions]);

  const max = Math.max(inflowTotal, outflowTotal, 0.01);
  const inPct = (inflowTotal / max) * 100;
  const outPct = (outflowTotal / max) * 100;

  if (transactions.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg bg-zinc-800/50 border border-white/5 p-3 text-center text-zinc-500 text-xs',
          className
        )}
      >
        No transactions yet
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 uppercase tracking-wider">Inflow vs outflow</span>
      </div>
      <div className="flex gap-6">
        {/* Inflow bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">In</span>
            <span className="font-mono text-xs text-emerald-400 truncate">{inflowLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${inPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-emerald-500/80 min-w-0"
            />
          </div>
        </div>
        {/* Outflow bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Out</span>
            <span className="font-mono text-xs text-rose-400 truncate">{outflowLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${outPct}%` }}
              transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
              className="h-full rounded-full bg-rose-500/80 min-w-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
