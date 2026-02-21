/**
 * Autonomous Execution Demo Component
 * Demonstrates AI agents executing tools without manual wallet clicks
 * Shows real-time x402 payments on Kite AI Testnet
 */

'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Zap, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { executeToolCall, getExecutionStatus, getKitescanUrl, type ExecutionResult } from '@/lib/kite-api';
import { cn } from '@/lib/utils';

export interface AutonomousExecutionDemoProps {
  agentWallet: string;
  agentName?: string;
  className?: string;
}

interface ExecutionLog {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'pending';
  txHash?: string;
}

/**
 * Autonomous Execution Demo
 * 
 * What this demonstrates (for Kite AI Bounty):
 * ✅ Agent executes without manual wallet clicking
 * ✅ x402 payment flow (debit escrow → call API → settle)
 * ✅ Real Kite AI Testnet transactions
 * ✅ On-chain settlement verification
 */
export function AutonomousExecutionDemo({ 
  agentWallet, 
  agentName = 'Agent',
  className 
}: AutonomousExecutionDemoProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [currentExecution, setCurrentExecution] = useState<ExecutionResult | null>(null);
  const [executionCount, setExecutionCount] = useState(0);

  // Auto-run loop (runs every 30 seconds when enabled)
  useEffect(() => {
    if (!isRunning) return;

    const runExecution = async () => {
      addLog('Starting autonomous execution...', 'info');
      
      try {
        // Execute weather API tool (demo tool ID)
        const toolId = 'tool-1704096549000-qtx6t9x'; // Weather API from seed data
        
        addLog('Verifying agent identity & balance...', 'pending');
        await new Promise(resolve => setTimeout(resolve, 1000));

        addLog('Executing Weather API (0.002 KITE)...', 'pending');
        
        const result = await executeToolCall({
          agentWallet,
          toolId,
          params: { city: 'Denver', date: new Date().toISOString() },
          paymentChain: 'kite',
        });

        setCurrentExecution(result);

        if (result.status === 'failed') {
          addLog(`Execution failed: ${result.error}`, 'error');
          return;
        }

        addLog(`Execution created: ${result.executionId}`, 'success');
        addLog('Balance deducted from escrow (optimistic)', 'info');
        addLog('Scheduled for settlement batch...', 'pending');

        setExecutionCount(prev => prev + 1);

        // Poll for settlement
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = setInterval(async () => {
          attempts++;
          
          const status = await getExecutionStatus(result.executionId);
          
          if (status?.txHash && status.txHash !== 'pending') {
            clearInterval(pollInterval);
            addLog('Settlement confirmed on Kite AI! ✓', 'success', status.txHash);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            addLog('Settlement pending (check activity feed)', 'info');
          }
        }, 3000);

      } catch (error: any) {
        addLog(`Error: ${error.message}`, 'error');
      }
    };

    // Run immediately
    runExecution();

    // Then run every 30 seconds
    const interval = setInterval(runExecution, 30000);

    return () => clearInterval(interval);
  }, [isRunning, agentWallet]);

  const addLog = (message: string, type: ExecutionLog['type'], txHash?: string) => {
    setLogs(prev => [
      {
        timestamp: Date.now(),
        message,
        type,
        txHash,
      },
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  const toggleRunning = () => {
    if (!isRunning) {
      setLogs([]);
      setExecutionCount(0);
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getLogIcon = (type: ExecutionLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={14} className="text-white/70 shrink-0" />;
      case 'error':
        return <AlertCircle size={14} className="text-white/50 shrink-0" />;
      case 'pending':
        return <Loader2 size={14} className="text-white/60 shrink-0 animate-spin" />;
      default:
        return <Zap size={14} className="text-white/60 shrink-0" />;
    }
  };

  return (
    <div className={cn(
      'rounded-xl border border-white/10 bg-black/40 overflow-hidden backdrop-blur-sm',
      className
    )}>
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between bg-black/60">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-white/70" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Autonomous Mode
          </h3>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {executionCount > 0 && (
            <span className="text-xs text-zinc-500">
              {executionCount} execution{executionCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={toggleRunning}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              isRunning
                ? 'bg-white/10 hover:bg-white/15 text-white/70 border border-white/20'
                : 'bg-white/10 hover:bg-white/15 text-white/70 border border-white/20'
            )}
          >
            {isRunning ? (
              <>
                <Pause size={14} />
                Stop
              </>
            ) : (
              <>
                <Play size={14} />
                Start
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Info Banner */}
        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/70 leading-relaxed">
            <strong className="text-white/90">Bounty Demo:</strong> {agentName} executes Weather API every 30s.
            No wallet popups. Autonomous x402 payments on Kite AI Testnet.
          </p>
        </div>

        {/* Execution Logs */}
        <div className="space-y-1">
          {logs.length === 0 && !isRunning && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Click "Start" to begin autonomous execution
            </div>
          )}

          {logs.map((log, index) => (
            <div
              key={`${log.timestamp}-${index}`}
              className={cn(
                'p-2 rounded-lg text-xs font-mono transition-all',
                log.type === 'error' && 'bg-white/5 border border-white/10',
                log.type === 'success' && 'bg-white/5 border border-white/10',
                log.type === 'pending' && 'bg-white/5 border border-white/10',
                log.type === 'info' && 'bg-black/30 border border-white/5'
              )}
            >
              <div className="flex items-start gap-2">
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <span className="text-zinc-400 text-[10px] mr-2">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={cn(
                    log.type === 'error' && 'text-white/60',
                    log.type === 'success' && 'text-white/70',
                    log.type === 'pending' && 'text-white/60',
                    log.type === 'info' && 'text-zinc-300'
                  )}>
                    {log.message}
                  </span>
                  {log.txHash && (
                    <a
                      href={getKitescanUrl(log.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 text-white/70 hover:text-white/90 transition-colors"
                    >
                      View tx
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Status */}
        {currentExecution && (
          <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Latest Execution:</span>
              <span className="font-mono text-zinc-300">
                {currentExecution.executionId.slice(0, 20)}...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-2 bg-zinc-900/20">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 text-center">
          Kite AI x402 Autonomous Payments · No Manual Wallet Clicks
        </p>
      </div>
    </div>
  );
}
