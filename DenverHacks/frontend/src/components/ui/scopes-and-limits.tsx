'use client';

import React from 'react';
import { Settings, Gauge, List, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScopesAndLimits as ScopesAndLimitsType } from '@/lib/agents';

export interface ScopesAndLimitsProps {
  scopes: ScopesAndLimitsType;
  toolNames?: Record<string, string>;
  className?: string;
}

/**
 * Settings: scopes & limits – rate limits, allowed tools, spend limit.
 */
export function ScopesAndLimits({ scopes, toolNames = {}, className }: ScopesAndLimitsProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
        <Settings size={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Scopes & limits
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Gauge size={14} className="text-zinc-500 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Rate limit</p>
            <p className="text-sm font-mono text-zinc-200">{scopes.rateLimitPerMin} / min</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <List size={14} className="text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Allowed tools</p>
            <div className="flex flex-wrap gap-1.5">
              {scopes.allowedToolIds.length === 0 ? (
                <span className="text-xs text-zinc-500">All</span>
              ) : (
                scopes.allowedToolIds.map((id) => (
                  <span
                    key={id}
                    className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-mono text-zinc-400"
                  >
                    {toolNames[id] ?? id}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Coins size={14} className="text-zinc-500 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Spend limit (daily)</p>
            <p className="text-sm font-mono text-zinc-200">{scopes.spendLimitPerDay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
