'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const chains = [
  {
    name: 'Base Sepolia',
    role: 'Settlement',
    description: 'Atomic batch settlement. 50 executions → 1 on-chain tx. ≈50× gas savings via Escrow contract.',
    color: '#2563eb',
    glow: 'rgba(37,99,235,0.3)',
    icon: '⬡',
    tags: ['ToolRegistry', 'Escrow', 'Settlement'],
  },
  {
    name: 'Kite AI Chain',
    role: 'Micropayments',
    description: 'HTTP-native x402 payment middleware. Pay-per-call with EIP-712 signed execution requests.',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.3)',
    icon: '⚡',
    tags: ['x402', 'EIP-712', 'ToolRegistry'],
  },
  {
    name: '0G Chain',
    role: 'Agent Identity',
    description: 'ERC-7857 iNFT minted per agent. Permanent identity + reputation container. OpenAPI specs stored on 0G Storage.',
    color: '#059669',
    glow: 'rgba(5,150,105,0.3)',
    icon: '◈',
    tags: ['iNFT', '0G Storage', 'Metadata'],
  },
  {
    name: 'Hedera',
    role: 'Attestations',
    description: 'HCS topics per agent log every execution. HTS handles AGENT token payments. UCP enables agent-to-agent commerce.',
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.3)',
    icon: '✦',
    tags: ['HCS', 'HTS', 'UCP'],
  },
];

export const ArchitectureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineProgress = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);
  const bgGridY    = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const headingY   = useTransform(scrollYProgress, [0, 1], ['30px', '-40px']);
  const cardsY     = useTransform(scrollYProgress, [0, 1], ['40px', '-20px']);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-black overflow-hidden py-32 px-6"
    >
      {/* Parallax background grid */}
      <motion.div
        style={{ y: bgGridY }}
        className="absolute inset-[-20%] pointer-events-none opacity-[0.03]"
        aria-hidden
      >
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          style={{ y: headingY }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-bold mb-4">
            Architecture
          </p>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            One Job.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">
              Four Chains.
            </span>
          </h2>
          <p className="mt-6 text-white/50 text-lg max-w-2xl mx-auto">
            No chain knows about the others. All trust is established at the
            backend layer — a clean separation of concerns built for scale.
          </p>
        </motion.div>

        {/* Chain cards — parallax layer */}
        <motion.div style={{ y: cardsY }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {chains.map((chain, i) => (
            <motion.div
              key={chain.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                delay: i * 0.1,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative border border-white/8 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden cursor-default"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${chain.glow} 0%, transparent 70%)`,
                }}
              />

              {/* Top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: chain.color }}
              />

              {/* Icon */}
              <div
                className="text-3xl mb-4"
                style={{ color: chain.color, textShadow: `0 0 20px ${chain.color}` }}
              >
                {chain.icon}
              </div>

              {/* Role badge */}
              <div
                className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  background: `${chain.color}22`,
                  color: chain.color,
                  border: `1px solid ${chain.color}44`,
                }}
              >
                {chain.role}
              </div>

              <h3 className="text-white font-bold text-lg mb-2">{chain.name}</h3>
              <p className="text-white/45 text-sm leading-relaxed mb-4">
                {chain.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {chain.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-white/30 border border-white/8"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connector line underneath */}
        <div className="hidden xl:flex items-center justify-between px-8 mt-6 relative">
          <motion.div
            className="absolute left-8 right-8 h-[1px] bg-gradient-to-r from-blue-600 via-purple-600 via-green-600 to-red-600"
            style={{ scaleX: lineProgress, transformOrigin: 'left' }}
          />
          {chains.map((c) => (
            <motion.div
              key={c.name}
              className="w-2 h-2 rounded-full z-10"
              style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            />
          ))}
        </div>

        {/* Relayer note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-12 border border-white/8 rounded-2xl p-6 bg-white/[0.02] text-center"
        >
          <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-2">
            Single Relayer Pattern
          </p>
          <p className="text-white/50 text-sm max-w-2xl mx-auto">
            One private key operates across all four EVM chains with Redis-locked nonces
            preventing double-spending. All inter-chain communication is handled at the
            backend layer — no bridge contracts, no cross-chain messaging overhead.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6">
            {[
              ['≤ 500ms', 'Execution latency'],
              ['50×', 'Gas reduction via batching'],
              ['EIP-712', 'Signed every request'],
              ['HCS', 'Tamper-proof audit log'],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-red-400 font-extrabold text-xl">{val}</div>
                <div className="text-white/30 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
