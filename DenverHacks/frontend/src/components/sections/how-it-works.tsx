'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const FloatingTetra = dynamic(
  () => import('@/components/ui/floating-geo').then((m) => m.FloatingTetra),
  { ssr: false }
);
const FloatingCube = dynamic(
  () => import('@/components/ui/floating-geo').then((m) => m.FloatingCube),
  { ssr: false }
);
const FloatingIcosa = dynamic(
  () => import('@/components/ui/floating-geo').then((m) => m.FloatingIcosa),
  { ssr: false }
);

const steps = [
  {
    step: '01',
    title: 'Agent Identity Minted',
    body: 'A wallet registers an agent. An ERC-7857 iNFT is minted on 0G Chain, a Hedera account is created with HCS attestation topic, and an escrow balance is initialized across all chains.',
    code: 'POST /agents\n→ iNFT on 0G\n→ HCS topic created\n→ EscrowBalance zeroed',
    Geo: FloatingTetra,
  },
  {
    step: '02',
    title: 'Tool Registry Lookup',
    body: 'OpenAPI specs are uploaded to 0G Storage, converted to EIP-712-compatible function schemas, and registered on Base and Kite chain ToolRegistry contracts.',
    code: 'POST /tools\n→ 0G contentHash\n→ Base ToolRegistry\n→ UCP CAPABILITY_AD',
    Geo: FloatingCube,
  },
  {
    step: '03',
    title: 'Signed Execution Request',
    body: 'The agent signs a tool call with EIP-712. The backend verifies, optimistically deducts escrow, executes upstream via isolated proxy, and submits a TOOL_EXECUTED HCS attestation.',
    code: 'POST /execute\n→ EIP-712 verify\n→ Proxy HTTP call\n→ HCS attestation',
    Geo: FloatingIcosa,
  },
  {
    step: '04',
    title: 'Atomic Batch Settlement',
    body: 'BullMQ triggers every 50 executions or 5 minutes. Executions are grouped by wallet pair, summed, and settled atomically in one Escrow.debit() call. Gas costs drop 50×.',
    code: 'BullMQ trigger\n→ Group by wallet pair\n→ Escrow.debit() batch\n→ Settlement record',
    Geo: FloatingTetra,
  },
];

export const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineH     = useTransform(scrollYProgress, [0.05, 0.85], ['0%', '100%']);
  const headingY  = useTransform(scrollYProgress, [0, 1], ['40px', '-40px']);
  const bgY       = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-black overflow-hidden py-32 px-6"
    >
      {/* Parallax background gradient */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-20%] pointer-events-none"
        aria-hidden
      >
        <div className="w-full h-full bg-gradient-to-b from-transparent via-red-950/6 to-transparent" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          style={{ y: headingY }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-24"
        >
          <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-bold mb-4">
            How It Works
          </p>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Zero Trust.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
              Full Proof.
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/5 hidden lg:block" />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[1px] bg-gradient-to-b from-red-500 to-orange-500 hidden lg:block"
            style={{ height: lineH }}
          />

          <div className="flex flex-col gap-24">
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${isLeft ? '' : 'lg:[direction:rtl]'}`}
                >
                  {/* Text */}
                  <div className={`${isLeft ? 'lg:pr-16' : 'lg:pl-16 [direction:ltr]'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-red-500/50 font-mono text-sm font-bold tracking-widest">
                        {s.step}
                      </span>
                      <div className="h-[1px] flex-1 bg-white/10" />
                    </div>
                    <h3 className="text-white text-2xl md:text-3xl font-extrabold mb-4">
                      {s.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed mb-6">{s.body}</p>
                    {/* Code snippet */}
                    <pre className="bg-white/[0.03] border border-white/8 rounded-xl px-5 py-4 text-red-400/80 text-xs font-mono leading-relaxed whitespace-pre">
                      {s.code}
                    </pre>
                  </div>

                  {/* 3D */}
                  <div className={`relative h-[260px] lg:h-[300px] ${isLeft ? '' : '[direction:ltr]'}`}>
                    <s.Geo className="w-full h-full" />
                    {/* Center dot on timeline */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
