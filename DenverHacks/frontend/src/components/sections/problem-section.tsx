'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import HeroShutterText from '@/components/ui/hero-shutter-text';
import { GlitchText } from '@/components/ui/glitch-text';
import { ScrambleText } from '@/components/ui/scramble-text';

const ProblemCanvas = dynamic(
  () => import('@/components/ui/problem-canvas').then((m) => m.ProblemCanvas),
  { ssr: false }
);

/* ─── Flashcard data ─────────────────────────────────── */

const cards = [
  {
    id: '01',
    title: 'NO ISOLATED EXECUTION',
    type: 'critical' as const,
    severity: 92,
    label: 'CRITICAL',
    body: 'API credentials and private keys live unencrypted in memory. Any compromise exposes every secret the agent holds.',
  },
  {
    id: '02',
    title: 'ZERO ON-CHAIN AUDITABILITY',
    type: 'data' as const,
    rows: [
      { k: 'Cryptographic Proof', v: 'None' },
      { k: 'Tamper Evidence', v: 'Absent' },
    ],
  },
  {
    id: '03',
    title: 'UNVERIFIABLE IDENTITY',
    type: 'text' as const,
    body: 'Agents impersonate others, replay stale signatures, and double-spend escrow balances with no on-chain anchor. Trust is purely',
    italic: 'social.',
  },
  {
    id: '04',
    title: 'PAYMENT SETTLEMENT CHAOS',
    type: 'data' as const,
    rows: [
      { k: 'Gas Cost vs Work Value', v: '10× overpay' },
      { k: 'Micro-tx Viability', v: 'Impossible' },
    ],
  },
];

/* ─── Section ────────────────────────────────────────── */

export const ProblemSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        revealRef.current,
        { filter: 'blur(24px)', opacity: 0, scale: 1.015 },
        {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1,
          duration: 2,
          ease: 'expo.out',
        }
      );

      gsap.from('.problem-cell', {
        x: 56,
        opacity: 0,
        stagger: 0.1,
        duration: 1.4,
        ease: 'power4.out',
        delay: 0.6,
        clearProps: 'all',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#020202] flex flex-col selection:bg-red-500 selection:text-white overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      {/* ── 3D Canvas bounded to section ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ProblemCanvas />
      </div>

      {/* ── Floating Mouse-Following Gradient ── */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-[1] blur-3xl"
        animate={{
          x: `${mousePosition.x}%`,
          y: `${mousePosition.y}%`,
        }}
        transition={{ type: 'spring' as const, stiffness: 50, damping: 30 }}
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* ── Interactive Grid Particles ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => {
          const pseudoRandom = (seed: number) => {
            const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
            return x - Math.floor(x);
          };

          return (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-red-500/30 rounded-full"
              style={{
                left: `${pseudoRandom(i * 2) * 100}%`,
                top: `${pseudoRandom(i * 3) * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + pseudoRandom(i * 5),
                repeat: Infinity,
                delay: pseudoRandom(i * 7),
              }}
            />
          );
        })}
      </div>

      {/* ── Content ── */}
      <div
        ref={revealRef}
        className="relative z-10 w-full flex flex-col md:flex-row p-8 md:p-14 lg:p-20 items-center md:items-stretch gap-10"
        style={{ minHeight: '100svh' }}
      >
        {/* ── Left: heading + CTA ── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pb-12 md:pb-8 w-full">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-2.5 h-2.5 bg-red-500 rounded-full">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40" />
            </div>
            <span className="font-mono text-[11px] font-bold text-red-400 tracking-[0.2em] uppercase">
              TRUST LAYER // THE PROBLEM
            </span>
          </motion.div>

          <div className="max-w-3xlФ lg:-translate-y-6 pr-6">
            <h2
              className="font-black leading-[0.92] tracking-tighter text-white uppercase"
              style={{ fontSize: 'clamp(2.6rem,6.5vw,7.5rem)' }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                AI AGENTS ARE
              </motion.span>
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(239,68,68,0.75)' }}>
                <HeroShutterText text="BLIND" inline />
              </span>{' '}
              &amp;{' '}
              <GlitchText text="EXPOSED" className="text-white" />
            </h2>
            <motion.p
              className="mt-7 text-sm text-white/45 max-w-xs leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <ScrambleText
                text="Autonomous agents execute billions of API calls with zero cryptographic isolation, no verifiable identity, and no trustless payment rails."
                delay={1500}
              />
            </motion.p>

            {/* ── Animated Stats ── */}
            <motion.div
              className="mt-8 flex gap-6 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              {[
                { label: 'Vulnerable APIs', value: '99.7%' },
                { label: 'Lost Annually', value: '$2.1B' },
                { label: 'Attack Surface', value: 'Infinite' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="group relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="px-4 py-2 rounded-lg bg-red-950/30 border border-red-500/20 backdrop-blur-sm">
                    <div className="text-lg font-black text-red-400 font-mono">{stat.value}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-red-500/0 group-hover:bg-red-500/10 transition-all duration-300 blur-xl" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Right: flashcards ── */}
        <div className="w-full md:w-72 lg:w-[22rem] flex-shrink-0 flex flex-col gap-3 justify-center z-20">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              className="relative problem-cell glass-panel p-4 sm:p-5 cursor-pointer group overflow-hidden"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-500/0 group-hover:border-red-500/50 transition-all duration-300" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-500/0 group-hover:border-red-500/50 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-500/0 group-hover:border-red-500/50 transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-500/0 group-hover:border-red-500/50 transition-all duration-300" />

              {/* Scanning Line Effect */}
              {hoveredCard === card.id && (
                <motion.div
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent z-30"
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Content */}
              <div className="relative z-10">
                <span className="font-mono text-[9px] text-red-500/40 group-hover:text-red-400/60 uppercase tracking-widest block mb-3 transition-colors">
                  {card.id} // {card.title}
                </span>

                {card.type === 'critical' && (
                  <div>
                    <div className="flex justify-between items-end mt-2 mb-4">
                      <h4 className="text-2xl font-bold text-white group-hover:text-red-300 tracking-tighter transition-colors">
                        {card.label}
                      </h4>
                      <span className="font-mono text-[10px] text-red-400">
                        RISK {card.severity}%
                      </span>
                    </div>
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-700 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${card.severity}%` }}
                        transition={{ delay: 0.8 + i * 0.15, duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="mt-4 text-[11px] text-white/35 group-hover:text-white/50 leading-relaxed font-mono transition-colors">
                      {card.body}
                    </p>
                  </div>
                )}

                {card.type === 'data' && card.rows && (
                  <div className="mt-2 flex flex-col gap-3">
                    {card.rows.map((row, ri) => (
                      <div key={ri}>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-white/40 group-hover:text-white/60 transition-colors">{row.k}</span>
                          <span className="text-red-400 font-bold">{row.v}</span>
                        </div>
                        {ri < (card.rows?.length ?? 0) - 1 && (
                          <div className="h-[1px] w-full bg-white/5 mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {card.type === 'text' && (
                  <p className="text-[12px] font-medium text-white/55 group-hover:text-white/70 mt-3 leading-snug transition-colors">
                    {card.body}{' '}
                    <span className="italic text-red-400">{card.italic}</span>
                  </p>
                )}
              </div>

              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-all duration-500 rounded-xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
