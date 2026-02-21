'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Database, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ZeroGDashboardOverview } from '@/components/ui/zerog-dashboard-overview';

export default function ZeroGPage() {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: 'Verifiable Identity',
      description: 'Each agent gets a unique ERC-721 NFT on 0G Chain representing their on-chain identity',
      status: 'Active',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Database,
      title: 'Action History',
      description: 'Every agent action is logged on-chain with cryptographic hashes for full auditability',
      status: 'Active',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: CheckCircle,
      title: 'Reputation System',
      description: 'Dynamic reputation scores (0-100) based on successful tool executions and payments',
      status: 'Active',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Clock,
      title: 'TEE Integration',
      description: 'Optional Trusted Execution Environment flag for hardware-isolated agent execution',
      status: 'Ready',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm text-white/60">0G Chain Integration</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono text-emerald-400">0G Newton Testnet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-white">
            Agent Identity Layer
          </h1>
          
          <p className="text-lg text-white/60 max-w-3xl mx-auto mb-8">
            Leveraging 0G Chain's iNFT primitives to create verifiable, on-chain identities for autonomous AI agents 
            with reputation tracking, action logging, and composability features.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a
              href="https://explorer-testnet.0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-all text-emerald-400 hover:text-emerald-300"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="font-mono text-sm">View on 0G Explorer</span>
            </a>
            <a
              href="https://faucet.0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <span className="font-mono text-sm text-white/70 hover:text-white">Get Testnet Tokens</span>
            </a>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-white/80">
            Why 0G Chain for Agent Identity?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 shadow-lg group-hover:shadow-emerald-500/50 transition-shadow`}>
                        <Icon className="w-full h-full text-white" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                        {feature.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-300 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Agent NFT Status Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <ZeroGDashboardOverview apiBaseUrl="http://localhost:3000" />
        </motion.div>

        {/* Technical Details */}
        <motion.div
          className="mt-20 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              Integration Architecture
            </h2>
            
            <div className="space-y-4 text-white/70 leading-relaxed">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-mono">
                  1
                </div>
                <div>
                  <strong className="text-white">Smart Contract:</strong> AgentINFT.sol deployed on 0G Newton Testnet 
                  implements ERC-721 with custom metadata for agent profiles, capabilities, and action logs.
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-mono">
                  2
                </div>
                <div>
                  <strong className="text-white">Backend Service:</strong> Node.js service (zg-identity.ts) handles NFT minting, 
                  action recording, and reputation updates using viem for blockchain interaction.
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-mono">
                  3
                </div>
                <div>
                  <strong className="text-white">Relayer Pattern:</strong> Single funded wallet pays gas for all agent operations, 
                  enabling seamless UX without requiring agents to hold tokens.
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-mono">
                  4
                </div>
                <div>
                  <strong className="text-white">Multi-Chain Strategy:</strong> 0G for identity, Kite AI for payments, 
                  Hedera for attestations, Base for settlements - leveraging each chain's strengths.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {[
            { label: 'Chain ID', value: '16602' },
            { label: 'Block Time', value: '~3s' },
            { label: 'Gas Cost', value: '~0.02 A0GI' },
            { label: 'Confirmation', value: '2 blocks' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
            >
              <div className="text-2xl font-black text-emerald-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-white/50 font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
