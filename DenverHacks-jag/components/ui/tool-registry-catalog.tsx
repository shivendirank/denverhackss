'use client';

import React from 'react';
import { Package, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getExplorerAddressUrl } from '@/lib/agents';
import type { ToolRegistryEntry } from '@/lib/agents';

export interface ToolRegistryCatalogProps {
  tools: ToolRegistryEntry[];
  className?: string;
}

/**
 * Tool registry / catalog: API → tool entries with name, rules, price per call, permissions, on-chain id.
 */
export function ToolRegistryCatalog({ tools, className }: ToolRegistryCatalogProps) {
  if (tools.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-500 text-sm',
          className
        )}
      >
        <Package size={20} className="mx-auto mb-2 opacity-50" />
        No tools registered
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
        <Package size={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Tool registry
        </h3>
      </div>
      <div className="divide-y divide-white/5">
        {tools.map((tool) => (
          <div key={tool.id} className="p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200">{tool.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{tool.apiSource}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-zinc-400">{tool.pricePerCall}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2" title="Rules">
              {tool.rules}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {tool.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wider text-zinc-400"
                >
                  {p}
                </span>
              ))}
              <a
                href={getExplorerAddressUrl(tool.onChainId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 font-mono"
                title="View on-chain"
              >
                {tool.onChainId}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
