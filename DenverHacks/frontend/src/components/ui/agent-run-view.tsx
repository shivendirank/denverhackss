'use client';

import React from 'react';
import { Play, Shield, Wrench, CreditCard, ExternalLink, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/agents';
import type { AgentRun, AgentRunStep } from '@/lib/agents';

function StepIcon({ type, status }: { type: AgentRunStep['type']; status: AgentRunStep['status'] }) {
  const StatusIcon = status === 'success' ? CheckCircle2 : status === 'pending' ? Loader2 : XCircle;
  const iconClass = status === 'success' ? 'text-white/70' : status === 'pending' ? 'text-white/50' : 'text-white/40';
  if (type === 'auth') return <Shield size={14} className="text-zinc-500" />;
  if (type === 'call_tool') return <Wrench size={14} className="text-zinc-500" />;
  if (type === 'pay') return <CreditCard size={14} className="text-zinc-500" />;
  return null;
}

export interface AgentRunViewProps {
  run: AgentRun;
  className?: string;
}

/**
 * Live agent run view: steps (auth → call tool → pay → …) with status and tx links.
 */
export function AgentRunView({ run, className }: AgentRunViewProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/60 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-zinc-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Last run
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">{run.runId}</span>
      </div>
      <div className="p-3 text-xs text-zinc-500 border-b border-white/5">
        Started {run.startedAt}
      </div>
      <ul className="divide-y divide-white/5">
        {run.steps.map((step, i) => (
          <li key={step.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-zinc-400">
              {i + 1}
            </span>
            <StepIcon type={step.type} status={step.status} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-200">{step.label}</p>
              {step.toolName && (
                <p className="text-xs text-zinc-500">{step.toolName}</p>
              )}
              {step.amount && (
                <p className="text-xs font-mono text-zinc-400">{step.amount}</p>
              )}
            </div>
            {step.txHash && (
              <a
                href={getExplorerTxUrl(step.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                title="View on Kitescan"
              >
                Tx
                <ExternalLink size={10} />
              </a>
            )}
            <span
              className={cn(
                'shrink-0 text-[11px] font-medium uppercase',
                step.status === 'success' && 'text-white/70',
                step.status === 'pending' && 'text-white/50',
                step.status === 'failed' && 'text-white/40'
              )}
            >
              {step.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
