'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolUsageEntry } from '@/lib/agents';

export interface PerToolUsageBillingProps {
  usage: ToolUsageEntry[];
  className?: string;
}

const MAX_BAR_WIDTH_PX = 180;

/**
 * Per-tool usage & billing as a horizontal bar chart (calls + total spent).
 */
export function PerToolUsageBilling({ usage, className }: PerToolUsageBillingProps) {
  if (usage.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-500 text-sm',
          className
        )}
      >
        <BarChart3 size={20} className="mx-auto mb-2 opacity-50" />
        No usage data
      </div>
    );
  }

  const maxCount = Math.max(...usage.map((u) => u.usageCount), 1);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
        <BarChart3 size={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Usage & billing
        </h3>
      </div>
      <div className="p-4">
        {/* Chart area */}
        <div className="space-y-4">
          {usage.map((u, i) => {
            const widthPct = (u.usageCount / maxCount) * 100;
            return (
              <div key={u.toolId} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-medium text-zinc-200 truncate min-w-0 flex-1">
                    {u.toolName}
                  </p>
                  <span className="font-mono text-xs text-zinc-500 shrink-0">
                    {u.usageCount} calls
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="relative h-6 rounded-md bg-zinc-800 overflow-hidden shrink-0"
                    style={{ width: MAX_BAR_WIDTH_PX }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                      className="absolute left-0 top-0 bottom-0 rounded-md bg-zinc-500 min-w-[4px]"
                    />
                  </div>
                  <span className="font-mono text-xs text-emerald-400/90 shrink-0">
                    {u.totalSpent}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-0.5">Last used {u.lastUsed}</p>
              </div>
            );
          })}
        </div>
        {/* Scale hint */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">
            Max {maxCount} calls
          </span>
        </div>
      </div>
    </div>
  );
}
