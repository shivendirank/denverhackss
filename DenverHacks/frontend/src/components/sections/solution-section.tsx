'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import TextBlockAnimation from '@/components/ui/text-block-animation';
import { GlitchText } from '@/components/ui/glitch-text';
import { ScrambleText } from '@/components/ui/scramble-text';

/* ─── Solution Flashcard data ─────────────────────────────────── */

const solutionCards = [
  {
    id: '01',
    title: 'TEE ATTESTATION',
    type: 'secure' as const,
    integrity: 99.9,
    label: 'SECURE',
    body: 'Hardware-isolated execution environments provide cryptographic proof of code integrity. Every agent operation is verifiable and tamper-proof.',
  },
  {
    id: '02',
    title: 'X402 PAYMENTS',
    type: 'data' as const,
    rows: [
      { k: 'Autonomous Transactions', v: 'Enabled' },
      { k: 'Payment Finality', v: 'Instant' },
    ],
  },
  {
    id: '03',
    title: 'SOVEREIGN IDENTITY',
    type: 'text' as const,
    body: 'On-chain identity anchors ensure every agent is uniquely verifiable. No impersonation, no replay attacks—just',
    italic: 'cryptographic trust.',
  },
  {
    id: '04',
    title: 'FHE COMPUTE',
    type: 'data' as const,
    rows: [
      { k: 'Encrypted Computation', v: 'Native' },
      { k: 'Data Privacy', v: 'Absolute' },
    ],
  },
  {
    id: '05',
    title: 'REPUTATION ORACLE',
    type: 'data' as const,
    rows: [
      { k: 'On-Chain History', v: 'Immutable' },
      { k: 'Trust Score', v: 'Real-time' },
    ],
  },
];

/* ─── Section ────────────────────────────────────────── */

export const SolutionSection = () => {
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

      gsap.from('.solution-cell', {
        x: -56,
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
      className="relative w-full bg-[#020202] flex flex-col selection:bg-pink-500 selection:text-white overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      {/* ── Pink gradient backgrounds ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />
      </div>

      {/* ── Floating Mouse-Following Gradient ── */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-[1] blur-3xl"
        animate={{
          x: `${mousePosition.x}%`,
          y: `${mousePosition.y}%`,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
        style={{
          background: 'radial-gradient(circle, rgba(255,182,217,0.12) 0%, transparent 70%)',
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
              className="absolute w-0.5 h-0.5 bg-pink-400/30 rounded-full"
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
        className="relative z-10 w-full flex flex-col md:flex-row-reverse p-8 md:p-14 lg:p-20 items-center md:items-stretch gap-10 lg:gap-16"
        style={{ minHeight: '100svh' }}
      >
        {/* ── Right: heading + CTA ── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pb-12 md:pb-8 w-full">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-2.5 h-2.5 bg-pink-500 rounded-full">
              <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-40" />
            </div>
            <span className="font-mono text-[11px] font-bold text-pink-400 tracking-[0.25em] uppercase">
              TRUST LAYER // THE SOLUTION
            </span>
          </motion.div>

          <div className="max-w-4xl lg:-translate-y-6">
            <div
              className="font-black leading-[0.88] tracking-[-0.02em] text-white uppercase mb-6"
              style={{ fontSize: 'clamp(3rem,7.5vw,8.5rem)' }}
            >
              <TextBlockAnimation
                blockColor="#FFB6D9"
                animateOnScroll={false}
                delay={0.4}
                duration={0.7}
                stagger={0.08}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="relative"
                >
                  <span className="relative inline-block">
                    SOVEREIGN
                    <motion.div
                      className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-pink-500 to-transparent"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                    />
                  </span>
                </motion.div>
              </TextBlockAnimation>
              
              <TextBlockAnimation
                blockColor="#FFC0E0"
                animateOnScroll={false}
                delay={0.9}
                duration={0.7}
                stagger={0.08}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="relative"
                >
                  <GlitchText 
                    text="EXECUTION" 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white"
                  />
                </motion.div>
              </TextBlockAnimation>

              <TextBlockAnimation
                blockColor="#FFD6EC"
                animateOnScroll={false}
                delay={1.3}
                duration={0.6}
                stagger={0.06}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  className="text-pink-400/80 mt-2"
                  style={{ fontSize: 'clamp(1.8rem,4.5vw,5rem)' }}
                >
                  LAYER
                </motion.div>
              </TextBlockAnimation>
            </div>

            {/* Enhanced Description */}
            <motion.div
              className="mt-10 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.p
                className="text-base md:text-lg text-white/60 max-w-2xl leading-relaxed font-light"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
              >
                <ScrambleText
                  text="Cryptographic isolation, verifiable identity, and autonomous payment rails—secured by TEE, FHE, and on-chain attestation."
                  delay={2200}
                />
              </motion.p>

              <motion.div
                className="flex items-center gap-3 text-pink-300/70 text-sm font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
              >
                <div className="w-12 h-[1px] bg-gradient-to-r from-pink-500/50 to-transparent" />
                <span className="uppercase tracking-wider">Production Ready</span>
              </motion.div>
            </motion.div>

            {/* ── Enhanced Animated Stats ── */}
            <motion.div
              className="mt-12 flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3 }}
            >
              {[
                { label: 'Security Level', value: '99.9%', color: 'from-pink-600 to-pink-400' },
                { label: 'Cost Reduction', value: '90%', color: 'from-pink-500 to-pink-300' },
                { label: 'Trust Score', value: 'A+', color: 'from-pink-400 to-pink-200' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="group relative"
                  whileHover={{ scale: 1.08, y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 + i * 0.15 }}
                >
                  <div className="relative px-6 py-3 rounded-xl bg-gradient-to-br from-pink-950/40 to-pink-900/20 border border-pink-500/30 backdrop-blur-md overflow-hidden">
                    {/* Animated background shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: 'linear',
                        delay: i * 0.3 
                      }}
                    />
                    <div className="relative">
                      <div className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-mono`}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-pink-500/0 group-hover:bg-pink-500/20 transition-all duration-500 blur-2xl -z-10" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Left: flashcards ── */}
        <div className="w-full md:w-80 lg:w-[24rem] xl:w-[26rem] flex-shrink-0 flex flex-col gap-3 justify-center z-20">
          {solutionCards.map((card, i) => (
            <motion.div
              key={card.id}
              className="relative solution-cell glass-panel p-5 sm:p-6 cursor-pointer group overflow-hidden"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.03, x: 5 }}
            >
              {/* Enhanced Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-500/0 group-hover:border-pink-500/70 transition-all duration-300" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-500/0 group-hover:border-pink-500/70 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-500/0 group-hover:border-pink-500/70 transition-all duration-300" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-500/0 group-hover:border-pink-500/70 transition-all duration-300" />

              {/* Scanning Line Effect */}
              {hoveredCard === card.id && (
                <motion.div
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/80 to-transparent z-30"
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Content */}
              <div className="relative z-10">
                <span className="font-mono text-[10px] text-pink-500/50 group-hover:text-pink-400/70 uppercase tracking-[0.2em] block mb-4 transition-colors font-semibold">
                  {card.id} // {card.title}
                </span>

                {card.type === 'secure' && (
                  <div>
                    <div className="flex justify-between items-end mt-2 mb-4">
                      <h4 className="text-2xl font-black text-white group-hover:text-pink-200 tracking-tight transition-colors">
                        {card.label}
                      </h4>
                      <span className="font-mono text-[11px] text-pink-400 font-bold">
                        {card.integrity}% UPTIME
                      </span>
                    </div>
                    <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-700 via-pink-500 to-pink-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${card.integrity}%` }}
                        transition={{ delay: 0.8 + i * 0.15, duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="mt-4 text-xs text-white/40 group-hover:text-white/60 leading-relaxed font-mono transition-colors">
                      {card.body}
                    </p>
                  </div>
                )}

                {card.type === 'data' && card.rows && (
                  <div className="mt-2 flex flex-col gap-3">
                    {card.rows.map((row, ri) => (
                      <div key={ri}>
                        <div className="flex justify-between text-[11px] font-mono items-center">
                          <span className="text-white/45 group-hover:text-white/70 transition-colors font-medium">{row.k}</span>
                          <span className="text-pink-400 font-bold tracking-wide">{row.v}</span>
                        </div>
                        {ri < (card.rows?.length ?? 0) - 1 && (
                          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {card.type === 'text' && (
                  <p className="text-[13px] font-medium text-white/60 group-hover:text-white/80 mt-3 leading-relaxed transition-colors">
                    {card.body}{' '}
                    <span className="italic text-pink-400 font-semibold">{card.italic}</span>
                  </p>
                )}
              </div>

              {/* Enhanced Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-600/0 group-hover:from-pink-500/8 group-hover:to-pink-600/5 transition-all duration-500 rounded-xl" />
              
              {/* Card number watermark */}
              <div className="absolute bottom-2 right-3 text-6xl font-black text-white/[0.02] group-hover:text-pink-500/10 transition-colors pointer-events-none">
                {card.id}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
