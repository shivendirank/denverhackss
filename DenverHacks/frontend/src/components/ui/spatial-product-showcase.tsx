'use client';

import { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  ChevronRight,
  Activity,
  Link2,
  Wrench,
  CreditCard,
  Zap,
  Wifi,
  Cpu,
  Brain,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { AgentIdentityCard } from '@/components/ui/agent-identity-card';
import { OnChainActivityFeed } from '@/components/ui/on-chain-activity-feed';
import { ToolRegistryCatalog } from '@/components/ui/tool-registry-catalog';
import { PerToolUsageBilling } from '@/components/ui/per-tool-usage-billing';
import { AgentWalletBalance } from '@/components/ui/agent-wallet-balance';
import { AgentRunView } from '@/components/ui/agent-run-view';
import { ScopesAndLimits } from '@/components/ui/scopes-and-limits';
import { PaymentInflowOutflowChart } from '@/components/ui/payment-inflow-outflow-chart';
import AgentZeroGNFTCard from '@/components/ui/agent-zerog-nft-card';
import { X402Demo } from '@/components/ui/x402-demo-modal';
import { getExplorerTxUrl, type AgentDetail } from '@/lib/agents';

/** Hue in degrees per agent for orb color variation */
const AGENT_HUE: Record<string, number> = {
  '01': 0,
  '02': 60,
  '03': 120,
  '04': 200,
  '05': 280,
};

const FEATURE_ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Wifi,
  Cpu,
  Brain,
  Activity,
};

// =========================================
// ANIMATION VARIANTS
// =========================================

const ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
  },
  image: (fromLeft: boolean): Variants => ({
    initial: {
      opacity: 0,
      scale: 1.5,
      filter: 'blur(15px)',
      rotate: fromLeft ? -20 : 20,
      x: fromLeft ? -60 : 60,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotate: 0,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      filter: 'blur(20px)',
      transition: { duration: 0.25 },
    },
  }),
};

// =========================================
// SUB-COMPONENTS
// =========================================

const BackgroundGradient = ({ data }: { data: AgentDetail }) => {
  const isBlue = data.colors.gradient.includes('blue');
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        animate={{
          background: isBlue
            ? 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.12), transparent 50%)'
            : 'radial-gradient(circle at 70% 50%, rgba(16, 185, 129, 0.12), transparent 50%)',
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      />
    </div>
  );
};

const AgentVisual = ({ data }: { data: AgentDetail }) => (
  <motion.div layout="position" className="relative group shrink-0">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring}`}
    />
    {/* Outer glow - extends behind the image */}
    <motion.div
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute inset-[-15%] rounded-full bg-gradient-to-br ${data.colors.gradient} blur-3xl opacity-50`}
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute inset-[-5%] rounded-full bg-gradient-to-br ${data.colors.gradient} blur-2xl opacity-60`}
    />
    <div className="relative h-80 w-80 md:h-[420px] md:w-[420px] rounded-full border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-sm ring-2 ring-white/5">
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <VoicePoweredOrb
          className="rounded-full"
          hue={AGENT_HUE[data.id] ?? 0}
          enableVoiceControl={false}
        />
      </motion.div>
    </div>
    <motion.div
      layout="position"
      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 bg-zinc-950/80 px-4 py-2 rounded-full border border-white/5 backdrop-blur">
        <span className={`h-1.5 w-1.5 rounded-full ${data.colors.glow} animate-pulse`} />
        {data.status}
      </div>
    </motion.div>
  </motion.div>
);

const DashboardSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
      <Icon size={16} />
      {title}
    </div>
    {children}
  </div>
);

const AgentDetails = ({
  data,
  onViewFullSpecs,
  onTransactionComplete,
}: {
  data: AgentDetail;
  onViewFullSpecs?: () => void;
  onTransactionComplete?: (transaction: any) => void;
}) => {
  const barColorClass = `left-0 ${data.colors.glow}`;

  return (
    <motion.div
      variants={ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-start text-left w-full max-w-4xl min-w-0 flex-1"
    >
      <Link
        href="/demo"
        className="text-sm text-zinc-500 hover:text-zinc-300 mb-5 inline-flex items-center gap-1 transition-colors"
      >
        ← Back to agents
      </Link>

      {/* Agent Identity Card */}
      {data.walletAddress && (
        <motion.div variants={ANIMATIONS.item} className="w-full mb-6">
          <AgentIdentityCard
            name={data.name}
            walletAddress={data.walletAddress}
            verified={data.verified}
            verifiedClassName="text-emerald-400"
          />
        </motion.div>
      )}

      <motion.h2
        variants={ANIMATIONS.item}
        className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1"
      >
        Agent
      </motion.h2>
      <motion.h1
        variants={ANIMATIONS.item}
        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500"
      >
        {data.name}
      </motion.h1>
      <motion.p
        variants={ANIMATIONS.item}
        className="text-zinc-400 mb-8 text-base"
      >
        {data.role}
      </motion.p>

      {/* Status - full width */}
      <motion.div variants={ANIMATIONS.item} className="w-full mb-6">
        <DashboardSection title="Status" icon={Activity}>
          <div className="bg-zinc-900/60 p-5 rounded-xl border border-white/5 w-full">
            <p className="text-zinc-200 text-base font-medium">{data.status}</p>
            <p className="text-zinc-500 text-sm mt-1">{data.statusDetail}</p>
          </div>
        </DashboardSection>
      </motion.div>

      {/* Dashboard card: 2-column grid on large screens */}
      <motion.div
        variants={ANIMATIONS.item}
        className="w-full bg-zinc-900/40 p-8 rounded-2xl border border-white/5 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {/* On chain history */}
          <DashboardSection title="On chain history" icon={Link2}>
            <ul className="space-y-3">
              {data.onChainHistory.slice(0, 4).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between text-sm text-zinc-400 py-2 border-b border-white/5 last:border-0"
                >
                  <span>{entry.action}</span>
                  <a
                    href={getExplorerTxUrl(entry.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-zinc-500 hover:text-zinc-300 truncate max-w-[120px]"
                    title={entry.txHash}
                  >
                    {entry.txHash.length > 18 ? `${entry.txHash.slice(0, 10)}…${entry.txHash.slice(-6)}` : entry.txHash}
                  </a>
                </li>
              ))}
              {data.onChainHistory.length === 0 && (
                <li className="text-sm text-zinc-500">No recent activity</li>
              )}
            </ul>
          </DashboardSection>

          {/* Used tools */}
          <DashboardSection title="Used tools" icon={Wrench}>
            <ul className="space-y-3">
              {data.usedTools.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between text-sm text-zinc-400"
                >
                  <span>{t.name}</span>
                  <span className="font-mono text-sm text-zinc-500">{t.count} calls</span>
                </li>
              ))}
              {data.usedTools.length === 0 && (
                <li className="text-sm text-zinc-500">No tools recorded</li>
              )}
            </ul>
          </DashboardSection>

          {/* Payment transactions */}
          <DashboardSection title="Payment transactions" icon={CreditCard}>
            <PaymentInflowOutflowChart transactions={data.paymentTransactions} className="mb-4" />
            <ul className="space-y-3">
              {data.paymentTransactions.slice(0, 4).map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className={tx.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'}>
                    {tx.amount}
                  </span>
                  <span className="text-zinc-500">{tx.time}</span>
                </li>
              ))}
              {data.paymentTransactions.length === 0 && (
                <li className="text-sm text-zinc-500">No transactions</li>
              )}
            </ul>
          </DashboardSection>

          {/* Features - spans well in grid */}
          <DashboardSection title="Features" icon={Zap}>
            {data.features.map((feature, idx) => {
              const IconComponent = FEATURE_ICON_MAP[feature.icon] ?? Zap;
              return (
                <div key={feature.label} className="group mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-2 text-base">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <IconComponent size={16} />
                      <span>{feature.label}</span>
                    </div>
                    <span className="font-mono text-sm text-zinc-500">{feature.value}%</span>
                  </div>
                  <div className="relative h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feature.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                      className={`absolute top-0 bottom-0 ${barColorClass} opacity-80`}
                    />
                  </div>
                </div>
              );
            })}
          </DashboardSection>
        </div>

        <div className="pt-6 mt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onViewFullSpecs}
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors group"
          >
            <Sliders size={16} />
            View full specs
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Tool registry & per-tool usage */}
      {(data.toolRegistry?.length ?? 0) > 0 && (
        <motion.div variants={ANIMATIONS.item} className="w-full mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ToolRegistryCatalog tools={data.toolRegistry ?? []} />
          {data.toolUsage && data.toolUsage.length > 0 && (
            <PerToolUsageBilling usage={data.toolUsage} />
          )}
        </motion.div>
      )}

    </motion.div>
  );
};

// =========================================
// MAIN COMPONENT
// =========================================

export interface AgentShowcaseProps {
  data: AgentDetail;
  onTransactionComplete?: (transaction: any) => void;
}

export default function SpatialProductShowcase({ data, onTransactionComplete }: AgentShowcaseProps) {
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const [showX402Modal, setShowX402Modal] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-black text-zinc-100 overflow-hidden selection:bg-zinc-800 flex flex-col items-center justify-center">
      <BackgroundGradient data={data} />

      {/* Floating X402 Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowX402Modal(true)}
        className="fixed top-6 right-6 z-40 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
      >
        <span className="tracking-wider">X402</span>
      </motion.button>

      <main className="relative z-10 w-full px-6 py-8 flex flex-col justify-center max-w-[1600px] mx-auto">
        <motion.div
          layout
          transition={{ type: 'spring' as const, bounce: 0, duration: 0.9 }}
          className="flex flex-col md:flex-row items-start justify-center md:justify-between gap-12 md:gap-16 lg:gap-20 w-full"
        >
          {/* Left column: Orb + compact sections */}
          <motion.div
            layout="position"
            variants={ANIMATIONS.container}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center md:items-start gap-10 shrink-0"
          >
            <AgentVisual data={data} />
            
            <div className="w-full max-w-[420px] mt-3 flex flex-col gap-10">
              {/* 0G Identity NFT - individual attestation */}
              <motion.div variants={ANIMATIONS.item} className="w-full">
                <AgentZeroGNFTCard agentId={data.id} />
              </motion.div>
              
              {/* Wallet balance - compact, fits under orb */}
              {data.wallet && (
                <motion.div variants={ANIMATIONS.item} className="w-full">
                  <AgentWalletBalance wallet={data.wallet} />
                </motion.div>
              )}
              
              {/* Last run view - compact, visual */}
              {data.lastRun && (
                <motion.div variants={ANIMATIONS.item} className="w-full">
                  <AgentRunView run={data.lastRun} />
                </motion.div>
              )}
              
              {/* Scopes & limits - compact settings */}
              {data.scopesAndLimits && (
                <motion.div variants={ANIMATIONS.item} className="w-full">
                  <ScopesAndLimits
                    scopes={data.scopesAndLimits}
                    toolNames={Object.fromEntries((data.toolRegistry ?? []).map((t) => [t.id, t.name]))}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right column: Main dashboard content */}
          <motion.div layout="position" className="w-full flex-1 flex justify-center md:justify-start min-w-0 max-w-none md:pl-10">
            <AgentDetails
              data={data}
              onViewFullSpecs={() => setShowFullSpecs(true)}
              onTransactionComplete={onTransactionComplete}
            />
          </motion.div>
        </motion.div>
      </main>

      {/* Full specs modal: On-chain activity feed */}
      <AnimatePresence>
        {showFullSpecs && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowFullSpecs(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Full specs · On-chain activity
                </h2>
                <button
                  type="button"
                  onClick={() => setShowFullSpecs(false)}
                  className="rounded-lg p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <OnChainActivityFeed agentWallet={data.walletAddress} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* X402 Modal */}
      {showX402Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowX402Modal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <X402Demo
              fromAgent={data.name}
              toAgent="Tool Registry"
              amount="0.001 ETH"
              purpose="Tool usage payment"
              onClose={() => setShowX402Modal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}