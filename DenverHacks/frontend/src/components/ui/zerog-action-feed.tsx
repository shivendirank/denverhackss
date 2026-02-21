'use client';

import React from 'react';
import { Activity, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentAction {
  actionType: string;
  timestamp: number;
  approved: boolean;
  txHash?: string;
}

export interface ZeroGActionFeedProps {
  actions: AgentAction[];
  explorerBaseUrl?: string;
  maxActions?: number;
  className?: string;
}

/**
 * 0G Action Feed
 * Displays on-chain action history from 0G Chain
 */
export function ZeroGActionFeed({
  actions = [],
  explorerBaseUrl = 'https://explorer-testnet.0g.ai',
  maxActions = 10,
  className,
}: ZeroGActionFeedProps) {
  const displayActions = actions.slice(0, maxActions);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'TOOL_EXECUTION':
        return <Activity size={14} className="text-white/60" />;
      case 'PAYMENT':
        return <Activity size={14} className="text-white/60" />;
      case 'STATE_UPDATE':
        return <Activity size={14} className="text-white/60" />;
      default:
        return <Activity size={14} className="text-zinc-400" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'TOOL_EXECUTION':
        return 'Tool Executed';
      case 'PAYMENT':
        return 'Payment Made';
      case 'STATE_UPDATE':
        return 'State Updated';
      default:
        return actionType;
    }
  };

  if (displayActions.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6',
          className
        )}
      >
        <div className="flex flex-col items-center justify-center text-center py-8">
          <Clock size={32} className="text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-500">No on-chain actions yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Actions will appear here when agent executes tools
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-4 md:p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-zinc-200">
            On-Chain Actions
          </h3>
        </div>
        <span className="text-xs text-zinc-500">
          {actions.length} total
        </span>
      </div>

      {/* Action Feed */}
      <div className="space-y-2">
        {displayActions.map((action, index) => (
          <div
            key={index}
            className="group relative rounded-lg border border-white/5 bg-black/20 p-3 hover:bg-black/30 hover:border-white/10 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="mt-0.5">
                {getActionIcon(action.actionType)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-300">
                    {getActionLabel(action.actionType)}
                  </span>
                  {action.approved && (
                    <CheckCircle2 
                      size={14} 
                      className="text-white/60 shrink-0"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-xs text-zinc-500">
                    {formatTimestamp(action.timestamp)}
                  </span>
                  {action.txHash && (
                    <a
                      href={`${explorerBaseUrl}/tx/${action.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View TX
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {actions.length > maxActions && (
        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <span className="text-xs text-zinc-500">
            Showing {maxActions} of {actions.length} actions
          </span>
        </div>
      )}
    </div>
  );
}

export default ZeroGActionFeed;
