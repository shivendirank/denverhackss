"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Wallet,
  Code,
  Zap,
  Shield,
  Database,
  Network,
  X,
  ExternalLink,
  Play,
  Loader2
} from "lucide-react";

interface X402Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "active" | "complete";
  details?: string[];
}

export interface X402DemoProps {
  fromAgent: string;
  toAgent: string;
  amount: string;
  purpose: string;
  txHash?: string;
  onClose?: () => void;
}

/**
 * X402 Payment Protocol Demo
 * Beautiful visualization of how agent-to-agent payments work
 */
export function X402Demo({ 
  fromAgent, 
  toAgent, 
  amount, 
  purpose, 
  txHash,
  onClose 
}: X402DemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<X402Step[]>([
    {
      id: "auth",
      title: "Authentication",
      description: "Agent identity verification via EIP-712 signature",
      icon: <Shield className="w-5 h-5" />,
      status: "pending",
      details: [
        "Verify agent wallet signature",
        "Check TEE attestation",
        "Validate spending limits"
      ]
    },
    {
      id: "escrow",
      title: "Escrow Debit",
      description: "Funds locked in smart contract escrow",
      icon: <Wallet className="w-5 h-5" />,
      status: "pending",
      details: [
        `Debiting ${amount} from ${fromAgent}`,
        "Optimistic balance update",
        "Escrow contract confirmed"
      ]
    },
    {
      id: "execute",
      title: "Execute Transaction",
      description: "Transfer initiated on Kite AI Testnet",
      icon: <Zap className="w-5 h-5" />,
      status: "pending",
      details: [
        `Transferring to ${toAgent}`,
        "Purpose: " + purpose,
        "Gas optimization applied"
      ]
    },
    {
      id: "attest",
      title: "HCS Attestation",
      description: "Immutable proof logged to Hedera Consensus Service",
      icon: <Database className="w-5 h-5" />,
      status: "pending",
      details: [
        "Generating cryptographic proof",
        "Submitting to HCS",
        "Verifiable on-chain record"
      ]
    },
    {
      id: "settle",
      title: "Settlement",
      description: "Final confirmation on Kite AI blockchain",
      icon: <Network className="w-5 h-5" />,
      status: "pending",
      details: [
        "Batch settlement processing",
        "On-chain finality achieved",
        txHash ? `Tx: ${txHash.slice(0, 10)}...${txHash.slice(-8)}` : "Transaction confirmed"
      ]
    }
  ]);

  const playDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Reset all steps
    setSteps(prev => prev.map(s => ({ ...s, status: "pending" })));

    // Animate through steps
    let stepIndex = 0;
    const interval = setInterval(() => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i < stepIndex ? "complete" : i === stepIndex ? "active" : "pending"
      })));

      stepIndex++;
      setCurrentStep(stepIndex);

      if (stepIndex > steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_50%)]" />
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        )}

        {/* Header */}
        <div className="relative px-8 py-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-6 h-6 text-white/70" />
            <h2 className="text-2xl font-bold text-white">X402 Payment Protocol</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Agent-to-Agent Transaction Demo • Kite AI Testnet
          </p>
        </div>

        {/* Transaction Info */}
        <div className="relative px-8 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-zinc-500 mb-1">FROM</p>
                <p className="text-sm font-semibold text-white">{fromAgent}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70" />
              <div className="text-center">
                <p className="text-xs text-zinc-500 mb-1">TO</p>
                <p className="text-sm font-semibold text-white">{toAgent}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-1">AMOUNT</p>
              <p className="text-lg font-bold text-cyan-400">{amount}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-zinc-500 mb-1">PURPOSE</p>
            <p className="text-sm text-white/80">{purpose}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="relative px-8 py-6 space-y-4 max-h-[400px] overflow-y-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border transition-all duration-500 ${
                step.status === "complete"
                  ? "bg-white/5 border-white/20"
                  : step.status === "active"
                  ? "bg-white/5 border-white/20 shadow-lg shadow-white/10"
                  : "bg-black/20 border-white/5"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg transition-all duration-500 ${
                    step.status === "complete"
                      ? "bg-white/10 text-white/70"
                      : step.status === "active"
                      ? "bg-white/10 text-white/70"
                      : "bg-zinc-700/50 text-zinc-500"
                  }`}
                >
                  {step.status === "complete" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : step.status === "active" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold transition-colors ${
                        step.status === "complete"
                          ? "text-white/70"
                          : step.status === "active"
                          ? "text-white/70"
                          : "text-zinc-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                    {step.status === "complete" && (
                      <span className="text-xs text-white/70 font-mono">
                        ✓ COMPLETE
                      </span>
                    )}
                    {step.status === "active" && (
                      <span className="text-xs text-white/70 font-mono animate-pulse">
                        PROCESSING...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{step.description}</p>

                  {/* Details */}
                  {step.details && (step.status === "active" || step.status === "complete") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1 text-xs"
                    >
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2 text-zinc-500">
                          <div className="w-1 h-1 rounded-full bg-zinc-600" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 bottom-0 w-0.5 h-4 bg-gradient-to-b from-white/20 to-transparent translate-y-full" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative px-8 py-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {txHash && (
                <a
                  href={`https://testnet.kitescan.ai/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Kitescan
                </a>
              )}
            </div>
            <button
              onClick={playDemo}
              disabled={isPlaying}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Playing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play Demo
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
