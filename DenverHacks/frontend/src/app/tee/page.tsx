"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Server, Cpu, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import TextBlockAnimation from "@/components/ui/text-block-animation";
import { AgentMemoryPalace } from "@/components/ui/agent-memory-palace";

export default function TEEPage() {
  const router = useRouter();

  const features = [
    {
      icon: Shield,
      title: "Hardware Isolation",
      description: "Secure enclaves provide isolated execution environments protected from the host OS and other processes.",
      status: "Active",
    },
    {
      icon: Lock,
      title: "Memory Encryption",
      description: "All data in the enclave is encrypted in memory, protecting against physical memory attacks.",
      status: "Active",
    },
    {
      icon: Server,
      title: "Remote Attestation",
      description: "Cryptographic proof that code is running in a genuine TEE with expected measurements.",
      status: "Active",
    },
    {
      icon: Cpu,
      title: "Sealed Storage",
      description: "Data is encrypted and bound to the specific enclave, preventing unauthorized access.",
      status: "Ready",
    },
  ];

  const specs = [
    { label: "Intel SGX", supported: true },
    { label: "AMD SEV", supported: true },
    { label: "ARM TrustZone", supported: true },
    { label: "AWS Nitro Enclaves", supported: true },
    { label: "Azure Confidential Computing", supported: true },
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
            <span className="font-mono text-sm text-white/60">TEE Attestation</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <div className="mb-20">
          <TextBlockAnimation
            blockColor="#FFB6D9"
            animateOnScroll={false}
            delay={0.3}
            duration={0.8}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tight">
              <span className="text-white">Trusted</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600">
                Execution
              </span>
              <br />
              <span className="text-white/80">Environment</span>
            </h1>
          </TextBlockAnimation>

          <motion.p
            className="text-xl md:text-2xl text-white/60 max-w-3xl mt-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Hardware-enforced isolation that provides cryptographic proof of code integrity and execution environment.
            TEE ensures your AI agents run in a secure, verifiable sandbox.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <button
              onClick={() => router.push("/3d")}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                🌐 Launch 3D Memory Palace
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => router.push("/demo")}
              className="group relative px-8 py-4 bg-zinc-800/50 border-2 border-pink-500/30 rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:border-pink-500/60 hover:bg-zinc-800"
            >
              <span className="relative z-10 flex items-center gap-3 text-pink-300">
                View 2D Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <motion.h2
            className="text-3xl font-black mb-12 text-pink-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Core Capabilities
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-3 shadow-lg group-hover:shadow-pink-500/50 transition-shadow">
                        <Icon className="w-full h-full text-white" strokeWidth={2} />
                      </div>
                      <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
                        {feature.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-pink-300 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Platform Support */}
        <div className="mb-20">
          <motion.h2
            className="text-3xl font-black mb-12 text-pink-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Platform Support
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specs.map((spec, index) => (
              <motion.div
                key={spec.label}
                className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {spec.supported ? (
                  <CheckCircle2 className="w-5 h-5 text-pink-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                )}
                <span className="text-white font-medium">{spec.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Agent Memory Palace Demo - Skybox AI Integration */}
        <div className="mb-20">
          <AgentMemoryPalace />
        </div>

        {/* Technical Overview */}
        <motion.div
          className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-black mb-6 text-pink-300">How It Works</h2>
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              <strong className="text-white">1. Enclave Creation:</strong> The AI agent code is loaded into a hardware-protected enclave with isolated memory.
            </p>
            <p>
              <strong className="text-white">2. Measurement:</strong> The enclave contents are cryptographically measured (hashed) during initialization.
            </p>
            <p>
              <strong className="text-white">3. Attestation:</strong> A signed quote containing the measurement is generated, proving the enclave's integrity.
            </p>
            <p>
              <strong className="text-white">4. Verification:</strong> Remote parties verify the quote against expected measurements before trusting the agent.
            </p>
            <p>
              <strong className="text-white">5. Sealed Execution:</strong> All computation happens in encrypted memory, invisible to the host OS.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: "Attestations/Day", value: "12.4K" },
            { label: "Uptime", value: "99.97%" },
            { label: "Avg Latency", value: "45ms" },
            { label: "Security Level", value: "EAL4+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
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
