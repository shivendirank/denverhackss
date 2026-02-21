"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  ArrowLeft,
  Users,
  MapPin,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
  Globe,
  Lock,
  MessageSquare,
  Activity,
  Clock,
  Shuffle,
  Eye,
  Navigation
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SkyboxViewer360 } from "@/components/ui/skybox-viewer-360";
import { generateAgentHome, remixSkybox, MEMORY_PALACE_PROMPTS, SkyboxStatus } from "@/lib/skybox";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  position: { x: number; y: number; z: number };
  isActive: boolean;
}

interface Waypoint {
  id: string;
  label: string;
  position: { x: number; y: number };
  memory: string;
  timestamp: number;
  agentId: string;
}

interface CollaborationEvent {
  id: string;
  type: "join" | "action" | "memory" | "message";
  agentId: string;
  content: string;
  timestamp: number;
}

const AGENT_ROSTER = [
  { id: "trader", name: "Quantum Trader", role: "Market Analyst Agent", icon: "📈", color: "from-emerald-400 to-teal-500" },
  { id: "analyst", name: "Data Oracle", role: "Data Analyst Agent", icon: "📚", color: "from-amber-400 to-orange-500" },
  { id: "curator", name: "NFT Maestro", role: "NFT Curator Agent", icon: "🎨", color: "from-purple-400 to-pink-500" },
  { id: "sentinel", name: "Cyber Guardian", role: "Security Sentinel", icon: "🛡️", color: "from-red-400 to-pink-500" },
  { id: "synapse", name: "Synapse AI", role: "Full Stack Agent", icon: "⚡", color: "from-blue-400 to-cyan-500" },
];

export default function TEE3DPage() {
  const router = useRouter();
  const [currentEnvironment, setCurrentEnvironment] = useState<string | null>(null);
  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [showX402, setShowX402] = useState(false);
  const [environmentAge, setEnvironmentAge] = useState(0); // seconds
  const [trustScore, setTrustScore] = useState(75);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Environment evolution timer
  useEffect(() => {
    if (currentEnvironment) {
      const timer = setInterval(() => {
        setEnvironmentAge(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentEnvironment]);

  const handleGenerateEnvironment = async (agentRole: string) => {
    setIsGenerating(true);
    setGenerationProgress("Initializing spatial environment...");
    setShowX402(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress("X402 Payment confirmed (0.0025 KITE)");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowX402(false);
      setGenerationProgress("Generating 360° memory palace...");

      const url = await generateAgentHome(
        agentRole,
        (status: SkyboxStatus) => {
          if (status.status === 'processing') {
            setGenerationProgress(`Rendering environment... ${status.progress || 0}%`);
          }
        }
      );

      setCurrentEnvironment(url);
      setEnvironmentId(Date.now().toString());
      setGenerationProgress("Environment deployed!");
      
      // Initialize first agent
      const firstAgent = AGENT_ROSTER.find(a => a.role === agentRole);
      if (firstAgent) {
        addAgent(firstAgent);
      }
      
      setEnvironmentAge(0);
    } catch (error) {
      console.error("Generation failed:", error);
      setGenerationProgress("Failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addAgent = (agentData: typeof AGENT_ROSTER[0]) => {
    const newAgent: Agent = {
      ...agentData,
      position: { 
        x: Math.random() * 100 - 50, 
        y: 0, 
        z: Math.random() * 100 - 50 
      },
      isActive: true,
    };
    
    setActiveAgents(prev => [...prev, newAgent]);
    
    const event: CollaborationEvent = {
      id: Date.now().toString(),
      type: "join",
      agentId: newAgent.id,
      content: `${newAgent.name} entered the memory palace`,
      timestamp: Date.now(),
    };
    setCollaborationEvents(prev => [event, ...prev].slice(0, 20));
  };

  const addWaypoint = (agentId: string) => {
    const agent = activeAgents.find(a => a.id === agentId);
    if (!agent) return;

    const waypoint: Waypoint = {
      id: Date.now().toString(),
      label: `Memory Point ${waypoints.length + 1}`,
      position: { x: Math.random() * 360, y: Math.random() * 180 - 90 },
      memory: `Spatial context stored by ${agent.name}`,
      timestamp: Date.now(),
      agentId: agent.id,
    };

    setWaypoints(prev => [...prev, waypoint]);

    const event: CollaborationEvent = {
      id: Date.now().toString(),
      type: "memory",
      agentId: agent.id,
      content: `placed memory at coordinates (${waypoint.position.x.toFixed(0)}°, ${waypoint.position.y.toFixed(0)}°)`,
      timestamp: Date.now(),
    };
    setCollaborationEvents(prev => [event, ...prev].slice(0, 20));
  };

  const handleRemixEnvironment = async () => {
    if (!environmentId) return;
    
    setIsGenerating(true);
    setGenerationProgress("Remixing environment based on agent activity...");
    setShowX402(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowX402(false);
      
      // Simulate remix
      setGenerationProgress("Generating evolved environment...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In production, use: await remixSkybox(environmentId, "evolved environment prompt");
      
      setTrustScore(prev => Math.min(100, prev + 5));
      setGenerationProgress("Environment evolved!");
      
      const event: CollaborationEvent = {
        id: Date.now().toString(),
        type: "action",
        agentId: "system",
        content: "Environment evolved based on collective agent activity",
        timestamp: Date.now(),
      };
      setCollaborationEvents(prev => [event, ...prev].slice(0, 20));
    } catch (error) {
      console.error("Remix failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAgentAction = (agentId: string, action: string) => {
    const event: CollaborationEvent = {
      id: Date.now().toString(),
      type: "action",
      agentId,
      content: action,
      timestamp: Date.now(),
    };
    setCollaborationEvents(prev => [event, ...prev].slice(0, 20));
    setTrustScore(prev => Math.min(100, prev + 1));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-pink-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/tee")}
              className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-mono text-sm">Back to TEE</span>
            </button>
            <div className="h-6 w-px bg-pink-500/20" />
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-pink-400" />
              <span className="font-mono text-sm text-white">3D Memory Palace</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-sm text-white/60">
                {activeAgents.length} Agent{activeAgents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-sm text-white/60">
                {waypoints.length} Waypoint{waypoints.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span className="font-mono text-sm text-white/60">
                Trust: {trustScore}%
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* No Environment State - Initial Selection */}
        {!currentEnvironment && !isGenerating && (
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-mono text-pink-300">Multi-Agent Spatial Dashboard</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">
                  Agent Memory Palace
                </span>
              </h1>

              <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                Create a persistent 360° spatial environment where AI agents can collaborate, 
                navigate, and develop spatial awareness together.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Users, title: "Multi-Agent Collab", desc: "Multiple agents in shared space" },
                { icon: Navigation, title: "Spatial Navigation", desc: "Waypoints & memory markers" },
                { icon: Shuffle, title: "Environment Evolution", desc: "Worlds adapt to agent activity" },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Icon className="w-8 h-8 text-pink-400 mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Agent Selection */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-pink-400" />
                Select First Agent to Generate Environment
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {AGENT_ROSTER.map((agent, index) => (
                  <motion.button
                    key={agent.id}
                    onClick={() => handleGenerateEnvironment(agent.role)}
                    className="group relative bg-zinc-800/50 rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-5xl mb-3">{agent.icon}</div>
                    <h3 className="text-sm font-bold text-white mb-1">{agent.name}</h3>
                    <p className="text-xs text-white/50">{agent.role}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* X402 Payment Indicator */}
        <AnimatePresence>
          {showX402 && (
            <motion.div
              className="fixed top-24 right-6 bg-zinc-900/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/50 shadow-2xl z-50"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-white">X402 Payment</p>
                  <p className="text-xs text-white/60">0.0025 KITE</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation Progress */}
        {isGenerating && (
          <motion.div
            className="max-w-3xl mx-auto bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 border border-pink-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
              <div>
                <h4 className="text-lg font-bold text-white">Generating Memory Palace</h4>
                <p className="text-sm text-white/60">{generationProgress}</p>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}

        {/* Main 3D Dashboard */}
        {currentEnvironment && !isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - 360° Viewer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 border border-pink-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-pink-400" />
                    360° Spatial Environment
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-mono text-white/40">
                      {Math.floor(environmentAge / 60)}:{(environmentAge % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                
                <div className="h-[500px] rounded-xl overflow-hidden relative">
                  <SkyboxViewer360 imageUrl={currentEnvironment} />
                  
                  {/* Waypoint Overlays */}
                  {waypoints.map((waypoint, index) => (
                    <motion.div
                                              key={waypoint.id}
                      className="absolute w-8 h-8 rounded-full bg-pink-500/80 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-125 transition-transform"
                      style={{
                        left: `${(waypoint.position.x / 360) * 100}%`,
                        top: `${((waypoint.position.y + 90) / 180) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      title={waypoint.memory}
                    >
                      {index + 1}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Environment Controls */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleRemixEnvironment}
                  disabled={isGenerating || environmentAge < 30}
                  className="group bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-5 h-5 text-pink-400 group-hover:rotate-180 transition-transform duration-500" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Evolve Environment</p>
                      <p className="text-xs text-white/50">Adapt space to agent activity</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => selectedAgent && addWaypoint(selectedAgent)}
                  disabled={!selectedAgent}
                  className="group bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Place Waypoint</p>
                      <p className="text-xs text-white/50">Mark spatial memory</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Panel - Agent Management & Activity */}
            <div className="space-y-4">
              {/* Active Agents */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Active Agents ({activeAgents.length})
                </h3>
                
                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                  {activeAgents.map((agent) => (
                    <motion.div
                      key={agent.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAgent === agent.id 
                          ? 'bg-pink-500/20 border-pink-500/50' 
                          : 'bg-zinc-800/50 border-pink-500/10 hover:border-pink-500/30'
                      }`}
                      onClick={() => setSelectedAgent(agent.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="text-2xl">{agent.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{agent.name}</p>
                        <p className="text-xs text-white/50">Position: ({agent.position.x.toFixed(0)}, {agent.position.z.toFixed(0)})</p>
                      </div>
                      {agent.isActive && (
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {activeAgents.length < AGENT_ROSTER.length && (
                  <div className="pt-4 border-t border-pink-500/10">
                    <p className="text-xs text-white/50 mb-3">Add more agents:</p>
                    <div className="flex gap-2 flex-wrap">
                      {AGENT_ROSTER.filter(a => !activeAgents.find(aa => aa.id === a.id)).map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => addAgent(agent)}
                          className="text-2xl hover:scale-125 transition-transform"
                          title={agent.name}
                        >
                          {agent.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Environment Stats */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-400" />
                  Environment Stats
                </h3>
                
                <div className="space-y-3">
                  {[
                    { label: "Trust Score", value: `${trustScore}%`, icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Active Agents", value: activeAgents.length, icon: Users, color: "text-blue-400" },
                    { label: "Waypoints", value: waypoints.length, icon: MapPin, color: "text-amber-400" },
                    { label: "Uptime", value: `${Math.floor(environmentAge / 60)}:${(environmentAge % 60).toString().padStart(2, '0')}`, icon: Clock, color: "text-purple-400" },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                          <span className="text-sm text-white/60">{stat.label}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-white">{stat.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                  Collaboration Feed
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {collaborationEvents.map((event, index) => {
                    const agent = activeAgents.find(a => a.id === event.agentId);
                    return (
                      <motion.div
                        key={event.id}
                        className="text-xs p-2 rounded bg-zinc-800/50 border border-pink-500/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start gap-2">
                          {agent && <span className="text-lg">{agent.icon}</span>}
                          <div className="flex-1">
                            <p className="text-white/80">
                              {agent ? <span className="font-bold text-pink-400">{agent.name}</span> : <span className="text-amber-400">System</span>}
                              {' '}{event.content}
                            </p>
                            <p className="text-white/40 text-[10px] mt-1">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {collaborationEvents.length === 0 && (
                    <p className="text-xs text-white/40 text-center py-4">
                      No activity yet. Agents will collaborate here.
                    </p>
                  )}
                </div>
              </div>

              {/* Agent Actions */}
              {selectedAgent && (
                <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-400" />
                    Agent Actions
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => simulateAgentAction(selectedAgent, "analyzed market data")}
                      className="px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-pink-500/20 hover:border-pink-500/50 rounded-lg text-xs font-medium text-white transition-all"
                    >
                      Analyze Data
                    </button>
                    <button
                      onClick={() => simulateAgentAction(selectedAgent, "performed security scan")}
                      className="px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-pink-500/20 hover:border-pink-500/50 rounded-lg text-xs font-medium text-white transition-all"
                    >
                      Security Scan
                    </button>
                    <button
                      onClick={() => simulateAgentAction(selectedAgent, "updated knowledge base")}
                      className="px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-pink-500/20 hover:border-pink-500/50 rounded-lg text-xs font-medium text-white transition-all"
                    >
                      Update KB
                    </button>
                    <button
                      onClick={() => simulateAgentAction(selectedAgent, "optimized pathfinding")}
                      className="px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-pink-500/20 hover:border-pink-500/50 rounded-lg text-xs font-medium text-white transition-all"
                    >
                      Optimize Path
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
