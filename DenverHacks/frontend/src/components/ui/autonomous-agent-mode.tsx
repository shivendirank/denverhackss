"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Users,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutonomousAgentModeProps {
  agentId: string;
  agentName: string;
  className?: string;
  onTransactionComplete?: (transaction: any) => void;
}

interface ExecutionLog {
  timestamp: number;
  message: string;
  type: "info" | "success" | "error" | "pending";
  txHash?: string;
  transactionData?: any;
}

const ALL_AGENTS = [
  { id: "01", name: "Neural Core", role: "Standard AI Agent" },
  { id: "02", name: "Quantum Mind", role: "TEE + X402 Payments" },
  { id: "03", name: "Cyber Vision", role: "FHE Compute" },
  { id: "04", name: "Data Nexus", role: "TEE + 0G Chain" },
  { id: "05", name: "Synapse AI", role: "Full Stack: All Features" }
];

const TRANSACTION_SCENARIOS = [
  {
    purpose: "Data Analysis Service",
    amount: "0.0025",
    action: "analyzing encrypted dataset"
  },
  {
    purpose: "Model Training Collaboration",
    amount: "0.005",
    action: "training shared ML model"
  },
  {
    purpose: "API Gateway Access",
    amount: "0.002",
    action: "accessing premium API endpoints"
  },
  {
    purpose: "Compute Resource Sharing",
    amount: "0.0035",
    action: "borrowing GPU compute time"
  },
  {
    purpose: "Storage Allocation",
    amount: "0.0015",
    action: "storing encrypted data on 0G Chain"
  },
  {
    purpose: "TEE Attestation Service",
    amount: "0.004",
    action: "verifying execution integrity via TEE"
  }
];

/**
 * Enhanced Autonomous Agent Mode
 * Features agent-to-agent transactions with X402
 */
export function AutonomousAgentMode({
  agentId,
  agentName,
  className,
  onTransactionComplete
}: AutonomousAgentModeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [executionCount, setExecutionCount] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startAutonomousMode = () => {
    setIsRunning(true);
    setLogs([]);
    setExecutionCount(0);

    addLog("🤖 Autonomous mode activated", "success");
    addLog("Monitoring agent network for collaboration opportunities...", "info");

    // Execute first transaction immediately
    executeAgentTransaction();

    // Then run every 15 seconds
    const interval = setInterval(() => {
      executeAgentTransaction();
    }, 15000);

    setIntervalId(interval);
  };

  const stopAutonomousMode = () => {
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    addLog("⏸️ Autonomous mode paused", "info");
  };

  const executeAgentTransaction = async () => {
    try {
      // Select random target agent (different from current)
      const availableAgents = ALL_AGENTS.filter(a => a.id !== agentId);
      const targetAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];

      // Select random transaction scenario
      const scenario = TRANSACTION_SCENARIOS[Math.floor(Math.random() * TRANSACTION_SCENARIOS.length)];

      addLog(`💭 Prompt: "${agentName} needs help ${scenario.action}"`, "info");
      addLog(`🤝 Initiating transaction with ${targetAgent.name}...`, "pending");

      // Simulate thinking/analysis
      await new Promise(resolve => setTimeout(resolve, 1000));

      addLog(`💰 Sending ${scenario.amount} KITE via X402...`, "pending");

      // Call API to create transaction
      const response = await fetch("/api/agent-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAgentId: agentId,
          toAgentId: targetAgent.id,
          amount: scenario.amount,
          purpose: scenario.purpose
        })
      });

      if (!response.ok) {
        throw new Error("Transaction failed");
      }

      const { transaction } = await response.json();

      // Simulate processing states
      await new Promise(resolve => setTimeout(resolve, 500));
      addLog("🔐 X402 authentication complete", "success");

      await new Promise(resolve => setTimeout(resolve, 500));
      addLog("⚡ Escrow debited, executing transfer...", "success");

      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog(
        `✅ Transaction confirmed! ${targetAgent.name} received ${scenario.amount} KITE`,
        "success",
        transaction.txHash,
        transaction
      );

      setExecutionCount(prev => prev + 1);

      // Trigger notification
      try {
        if (onTransactionComplete && typeof onTransactionComplete === 'function') {
          onTransactionComplete({
            id: transaction.id,
            fromAgentName: agentName,
            toAgentName: targetAgent.name,
            amount: `${scenario.amount} KITE`,
            purpose: scenario.purpose,
            txHash: transaction.txHash,
            timestamp: Date.now()
          });
        }
      } catch (notifError: any) {
        console.error('Error triggering notification:', notifError);
      }

      addLog("📊 Updating on-chain activity feed...", "info");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`, "error");
    }
  };

  const addLog = (
    message: string,
    type: ExecutionLog["type"],
    txHash?: string,
    transactionData?: any
  ) => {
    setLogs(prev => [
      {
        timestamp: Date.now(),
        message,
        type,
        txHash,
        transactionData
      },
      ...prev.slice(0, 29) // Keep last 30 logs
    ]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getLogIcon = (type: ExecutionLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={14} className="text-white/70 shrink-0" />;
      case "error":
        return <AlertCircle size={14} className="text-white/50 shrink-0" />;
      case "pending":
        return <Loader2 size={14} className="text-white/60 shrink-0 animate-spin" />;
      default:
        return <Zap size={14} className="text-white/70 shrink-0" />;
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/10">
            <Users size={16} className="text-white/70" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              Agent Collaboration Mode
            </h3>
            <p className="text-xs text-zinc-500">Agent-to-Agent Transactions via X402</p>
          </div>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-white/70 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {executionCount > 0 && (
            <span className="text-xs text-zinc-500 font-mono">
              {executionCount} transaction{executionCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={isRunning ? stopAutonomousMode : startAutonomousMode}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              isRunning
                ? "bg-white/10 hover:bg-white/20 text-white/70 border border-white/30"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
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
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/90 leading-relaxed mb-1">
                <strong className="text-white/90">AI-Powered Collaboration:</strong> {agentName} autonomously
                discovers when other agents need help and initiates X402 payments.
              </p>
              <p className="text-[10px] text-zinc-400">
                Each transaction demonstrates: Authentication → Escrow → Transfer → HCS Attestation → Settlement
              </p>
            </div>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
          {logs.length === 0 && !isRunning && (
            <div className="text-center py-12 text-zinc-500 text-sm">
              <Users className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <p className="font-medium mb-1">No active collaborations</p>
              <p className="text-xs text-zinc-600">
                Click "Start" to enable autonomous agent-to-agent transactions
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {logs.map((log, index) => (
              <motion.div
                key={`${log.timestamp}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "p-2 rounded-lg text-xs font-mono transition-all",
                  log.type === "error" && "bg-white/5 border border-white/10",
                  log.type === "success" && "bg-white/5 border border-white/10",
                  log.type === "pending" && "bg-white/5 border border-white/10",
                  log.type === "info" && "bg-zinc-800/50 border border-white/5"
                )}
              >
                <div className="flex items-start gap-2">
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-500 text-[10px] mr-2">
                      {formatTime(log.timestamp)}
                    </span>
                    <span
                      className={cn(
                        log.type === "error" && "text-white/60",
                        log.type === "success" && "text-white/70",
                        log.type === "pending" && "text-white/70",
                        log.type === "info" && "text-zinc-300"
                      )}
                    >
                      {log.message}
                    </span>
                    {log.txHash && (
                      <a
                        href={`https://testnet.kitescan.ai/tx/${log.txHash}`}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-white/10 px-4 py-3 bg-zinc-900/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Autonomous X402 Payments • Kite AI Testnet</span>
          {executionCount > 0 && (
            <span className="text-white/70 font-semibold">
              {executionCount} successful {executionCount === 1 ? "transaction" : "transactions"}
            </span>
          )}
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
