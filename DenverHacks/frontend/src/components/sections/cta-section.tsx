'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Network3D = dynamic(
  () => import('@/components/ui/network-3d').then((m) => m.Network3D),
  { ssr: false }
);

const links = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'API Docs', href: '#' },
  { label: 'Architecture', href: '#' },
  { label: 'ETHDenver 2026', href: 'https://ethdenver.com' },
];

export const CtaSection = () => (
  <section className="relative overflow-hidden bg-black py-32 px-6 border-t border-white/5">
    {/* 3D background */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <Network3D className="w-full h-full" />
    </div>

    {/* Radial overlay so text is readable */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,0,0,0.85) 0%, transparent 100%)',
      }}
    />

    <div className="relative max-w-4xl mx-auto text-center z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-bold mb-6">
          Deploy Now
        </p>
        <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Your Agents Deserve
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            Sovereignty
          </span>
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
          Spin up the trust layer, register your first agent, and start settling
          verifiable micropayments on-chain — all in under 5 minutes.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <a
            href="https://github.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 transition-colors rounded-full font-bold text-white text-base"
          >
            Get Started →
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 hover:border-white/40 transition-colors rounded-full font-bold text-white text-base"
          >
            Read the Docs
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/8 pt-12 mb-16">
          {[
            ['4', 'Chains Supported'],
            ['50×', 'Gas Batch Savings'],
            ['EIP-712', 'Every Request Signed'],
            ['0', 'Trusted Third Parties'],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-red-400">{val}</div>
              <div className="text-white/30 text-xs mt-1 uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-white/25 hover:text-white/60 text-sm transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="text-white/15 text-xs mt-8">
          © {new Date().getFullYear()} AI Agent Trust Layer · Built at ETHDenver 2026
        </p>
      </motion.div>
    </div>
  </section>
);
