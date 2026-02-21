"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Zap, Database, Activity, FileCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { ZeroGDashboardOverview } from "@/components/ui/zerog-dashboard-overview";

export default function DashboardPage() {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: "TEE Attestation",
      description: "Hardware-isolated execution with cryptographic verification",
      status: "Active",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Lock,
      title: "X402 Payments",
      description: "Zero-knowledge verification with privacy preservation",
      status: "Active",
      color: "from-pink-400 to-pink-500",
    },
    {
      icon: Zap,
      title: "FHE Compute",
      description: "Fully encrypted computation maintaining data confidentiality",
      status: "Ready",
      color: "from-pink-600 to-pink-700",
    },
    {
      icon: Database,
      title: "On-Chain Storage",
      description: "Immutable attestation records on decentralized ledger",
      status: "Active",
      color: "from-pink-300 to-pink-400",
    },
    {
      icon: Activity,
      title: "Reputation Engine",
      description: "Real-time trust scoring based on execution history",
      status: "Active",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: FileCode,
      title: "Smart Contracts",
      description: "Automated settlement and escrow management",
      status: "Deployed",
      color: "from-pink-400 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-pink-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm">Back to Home</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm text-white/60">AI Trust Layer // Dashboard</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Title */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white">
            Trust Infrastructure
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Production-ready components for building sovereign AI agent execution environments
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 shadow-lg group-hover:shadow-pink-500/50 transition-shadow`}>
                      <Icon className="w-full h-full text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
                      {feature.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-pink-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              </motion.div>
            );
          })}
        </div>

        {/* 0G Agent Identity Section */}
        <motion.div
          className="mt-20 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400">
                0G Agent Identity (iNFT)
              </h2>
              <p className="text-white/60 text-sm max-w-2xl">
                On-chain verifiable identities for autonomous agents with reputation tracking and action history
              </p>
            </div>
            <button
              onClick={() => router.push('/zerog')}
              className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-all text-emerald-400 hover:text-emerald-300 font-mono text-sm"
            >
              View Details →
            </button>
          </div>
          <ZeroGDashboardOverview apiBaseUrl="http://localhost:3000" />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[
            { label: "Active Agents", value: "2,847" },
            { label: "Verified Executions", value: "1.2M" },
            { label: "Total Value Secured", value: "$8.4M" },
            { label: "Network Uptime", value: "99.9%" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
            >
              <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/50 font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
