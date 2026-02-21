"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Brain, 
  Lock, 
  Zap, 
  Globe, 
  Sparkles, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { SkyboxViewer360 } from "./skybox-viewer-360";
import { generateAgentHome, MEMORY_PALACE_PROMPTS, SkyboxStatus } from "@/lib/skybox";

interface AgentOption {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
}

const AGENT_OPTIONS: AgentOption[] = [
  {
    id: "trader",
    name: "Market Analyst",
    role: "Market Analyst Agent",
    icon: "📈",
    color: "from-emerald-400 to-teal-500",
    description: "Trading floor with live market data streams",
  },
  {
    id: "analyst",
    name: "Data Analyst",
    role: "Data Analyst Agent",
    icon: "📚",
    color: "from-amber-400 to-orange-500",
    description: "Knowledge library with floating data orbs",
  },
  {
    id: "curator",
    name: "NFT Curator",
    role: "NFT Curator Agent",
    icon: "🎨",
    color: "from-purple-400 to-pink-500",
    description: "Digital art gallery with NFT collections",
  },
  {
    id: "sentinel",
    name: "Security Sentinel",
    role: "Security Sentinel",
    icon: "🛡️",
    color: "from-red-400 to-pink-500",
    description: "Security command center with threat monitoring",
  },
  {
    id: "oracle",
    name: "Oracle",
    role: "Oracle Agent",
    icon: "🔮",
    color: "from-violet-400 to-purple-500",
    description: "Prediction chamber with future scenario visualization",
  },
  {
    id: "explorer",
    name: "Explorer",
    role: "Explorer Agent",
    icon: "🗺️",
    color: "from-blue-400 to-cyan-500",
    description: "Expedition base with uncharted territory maps",
  },
];

interface MemoryPoint {
  id: string;
  label: string;
  data: string;
  timestamp: number;
}

export function AgentMemoryPalace() {
  const [selectedAgent, setSelectedAgent] = useState<AgentOption | null>(null);
  const [skyboxUrl, setSkyboxUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("Initializing...");
  const [memories, setMemories] = useState<MemoryPoint[]>([]);
  const [generationCost] = useState("0.0025 KITE"); // X402 payment cost
  const [showX402, setShowX402] = useState(false);

  const handleGenerateEnvironment = async (agent: AgentOption) => {
    setSelectedAgent(agent);
    setIsGenerating(true);
    setGenerationProgress("Initiating X402 payment...");
    setSkyboxUrl(null);
    setMemories([]);

    try {
      // Simulate X402 payment flow
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowX402(true);
      setGenerationProgress("Payment confirmed! Generating environment...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowX402(false);

      // Generate the actual skybox
      const url = await generateAgentHome(
        agent.role,
        (status: SkyboxStatus) => {
          if (status.status === 'processing') {
            setGenerationProgress(`Rendering Memory Palace... ${status.progress || 0}%`);
          }
        }
      );

      setSkyboxUrl(url);
      setGenerationProgress("Complete!");
      
      // Add initial memory points
      setMemories([
        {
          id: "1",
          label: "Agent Genesis",
          data: `${agent.name} initialized in secure TEE enclave`,
          timestamp: Date.now(),
        },
        {
          id: "2",
          label: "Environment Deployed",
          data: "360° spatial memory palace generated via Skybox AI",
          timestamp: Date.now() + 100,
        },
      ]);
    } catch (error) {
      console.error("Generation failed:", error);
      setGenerationProgress("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addMemory = () => {
    const newMemory: MemoryPoint = {
      id: Date.now().toString(),
      label: `Memory #${memories.length + 1}`,
      data: `Spatial data point stored at ${new Date().toLocaleTimeString()}`,
      timestamp: Date.now(),
    };
    setMemories([...memories, newMemory]);
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div>
        <motion.div
          className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Home className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-mono text-pink-300">Spatial AI Demo</span>
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-black mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-white">Agent </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">
            Memory Palaces
          </span>
        </motion.h2>

        <motion.p
          className="text-lg text-white/60 max-w-3xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Every AI agent gets a persistent 360° spatial environment as their "home" — a place to store memories,
          navigate context, and develop spatial awareness. Powered by Skybox AI + TEE security + x402 micropayments.
        </motion.p>
      </div>

      {/* Core Benefits Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          {
            icon: Brain,
            title: "Spatial Memory",
            description: "Agents remember places and contextual relationships",
          },
          {
            icon: Lock,
            title: "TEE Security",
            description: "Memories encrypted and protected in hardware enclaves",
          },
          {
            icon: Zap,
            title: "X402 Payments",
            description: "Instant micropayments for environment generation",
          },
        ].map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20"
            >
              <Icon className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-white/60">{benefit.description}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Agent Selection */}
      <div>
        <motion.h3
          className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <Globe className="w-6 h-6 text-pink-400" />
          Choose an Agent to Generate Their Home
        </motion.h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {AGENT_OPTIONS.map((agent, index) => (
            <motion.button
              key={agent.id}
              onClick={() => handleGenerateEnvironment(agent)}
              disabled={isGenerating}
              className={`group relative bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                selectedAgent?.id === agent.id
                  ? "border-pink-500 shadow-lg shadow-pink-500/20"
                  : "border-pink-500/20 hover:border-pink-500/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: isGenerating ? 1 : 1.05 }}
              whileTap={{ scale: isGenerating ? 1 : 0.95 }}
            >
              <div className="text-4xl mb-3">{agent.icon}</div>
              <h4 className="text-sm font-bold text-white mb-1">{agent.name}</h4>
              <p className="text-xs text-white/50 line-clamp-2">{agent.description}</p>
              
              {selectedAgent?.id === agent.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent rounded-xl"
                  layoutId="selectedAgent"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* X402 Payment Indicator */}
      <AnimatePresence>
        {showX402 && (
          <motion.div
            className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1">
                  X402 Payment Required
                </h4>
                <p className="text-sm text-white/60">
                  Cost: {generationCost} • Status: <span className="text-emerald-400">Confirmed</span>
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Status */}
      {isGenerating && (
        <motion.div
          className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-pink-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                Generating Memory Palace...
              </h4>
              <p className="text-sm text-white/60">{generationProgress}</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* 360° Viewer */}
      {skyboxUrl && !isGenerating && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-pink-400" />
              {selectedAgent?.name}'s Memory Palace
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Secured by TEE</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 border border-pink-500/20">
            <div className="h-[500px] rounded-xl overflow-hidden">
              <SkyboxViewer360 imageUrl={skyboxUrl} />
            </div>
          </div>

          {/* Memory Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stored Memories */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-400" />
                Spatial Memories ({memories.length})
              </h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {memories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    className="bg-zinc-800/50 rounded-lg p-3 border border-pink-500/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-mono text-pink-300">{memory.label}</span>
                      <span className="text-xs text-white/40">
                        {new Date(memory.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">{memory.data}</p>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={addMemory}
                className="w-full mt-4 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-sm font-medium text-pink-300 transition-all"
              >
                + Add Spatial Memory
              </button>
            </div>

            {/* Stats */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
              <h4 className="text-lg font-bold text-white mb-4">Environment Stats</h4>
              <div className="space-y-3">
                {[
                  { label: "Agent Type", value: selectedAgent?.name },
                  { label: "Environment", value: "360° Skybox AI" },
                  { label: "Security", value: "TEE Encrypted" },
                  { label: "Generation Cost", value: generationCost },
                  { label: "Memories Stored", value: memories.length.toString() },
                  { label: "Storage", value: "0G Chain" },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-sm text-white/60">{stat.label}</span>
                    <span className="text-sm font-mono text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* How It Works */}
      {!skyboxUrl && !isGenerating && (
        <motion.div
          className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-pink-500/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Select Agent",
                description: "Choose an agent type with specific spatial needs",
              },
              {
                step: "2",
                title: "X402 Payment",
                description: `Instant micropayment (${generationCost}) for Skybox AI generation`,
              },
              {
                step: "3",
                title: "Generate World",
                description: "Skybox AI creates a tailored 360° memory palace",
              },
              {
                step: "4",
                title: "Store Memories",
                description: "Agent places data spatially in TEE-secured environment",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-black text-xl mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
