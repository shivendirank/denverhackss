'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Cpu, Lock, Zap, ArrowRight } from 'lucide-react';

export default function SolutionPage() {
  const features = [
    {
      icon: Shield,
      title: 'ERC-8004 Trust Layer',
      description: 'On-chain reputation engine powered by Hedera Consensus Service',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Cpu,
      title: 'TEE Execution',
      description: 'Trusted Execution Environments for secure AI agent operations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Lock,
      title: 'FHE Privacy',
      description: 'Fully Homomorphic Encryption for confidential computations',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'x402 Payments',
      description: 'Kite AI integration for autonomous agent micropayments',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwxODIsMjE3LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500 bg-clip-text text-transparent">
              The SENTINEL Protocol
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              A multi-layered trust infrastructure for AI agents operating across Base, Hedera, and 0G networks
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/builder">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-white overflow-hidden hover:scale-105 transition-transform">
                <span className="relative z-10 flex items-center gap-2">
                  Build Your Citadel
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-8 py-4 border-2 border-pink-500/50 rounded-xl font-bold text-white hover:bg-pink-500/10 transition-colors">
                View Dashboard
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Three-layer architecture for trustless AI agent operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Identity Layer', desc: 'ERC-8004 AgentNFT with on-chain reputation on Hedera' },
              { step: '02', title: 'Execution Layer', desc: 'TEE-secured environments with X402 payment integration' },
              { step: '03', title: 'Settlement Layer', desc: 'Cross-chain escrow with x402 micropayments on Base' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8"
              >
                <div className="text-6xl font-black text-pink-500/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
