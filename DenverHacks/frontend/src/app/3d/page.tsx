"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  ArrowLeft,
  Users,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
  Globe,
  Lock,
  Activity,
  Clock,
  Eye,
  Loader2,
  Database,
  Shield,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SkyboxViewer360 } from "@/components/ui/skybox-viewer-360";
import { generateSkybox, checkSkyboxStatus, SkyboxStatus } from "@/lib/skybox";

interface AgentMetrics {
  [key: string]: number | string;
}

interface AgentAction {
  type: string;
  timestamp: number;
  description: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'processing';
  currentActivity: string;
  metrics: AgentMetrics;
  lastAction: AgentAction;
}

interface AgentSkybox {
  agentId: string;
  skyboxId: string;
  skyboxUrl: string;
  lastUpdated: number;
  generatedFrom: string; // Transaction purpose that triggered generation
}

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTransactions: number;
  averageTrustScore: number;
  networkLatency: string;
}

interface AgentStatusResponse {
  agents: Agent[];
  systemMetrics: SystemMetrics;
  timestamp: number;
}

export default function ThreeDPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [agentSkyboxes, setAgentSkyboxes] = useState<Map<string, AgentSkybox>>(new Map());
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Track page visibility for API optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      console.log('📱 Page visibility:', !document.hidden ? 'VISIBLE' : 'HIDDEN');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fetch agent status and transactions
  const fetchAgentStatus = useCallback(async () => {
    try {
      const [agentResponse, txResponse] = await Promise.all([
        fetch('/api/agents/status'),
        fetch('/api/agent-transactions')
      ]);
      
      if (!agentResponse.ok) throw new Error('Failed to fetch agent status');
      
      const agentData: AgentStatusResponse = await agentResponse.json();
      setAgents(agentData.agents);
      setSystemMetrics(agentData.systemMetrics);
      setLastUpdate(agentData.timestamp);
      
      if (txResponse.ok) {
        const txData = await txResponse.json();
        const newTxCount = txData.transactions.length;
        
        // Check if new transactions occurred ONLY when page is visible
        if (newTxCount > transactionCount && transactionCount > 0 && isPageVisible) {
          const newTransactions = txData.transactions.slice(0, newTxCount - transactionCount);
          
          // Generate skybox for each receiving agent
          for (const tx of newTransactions) {
            if (tx.status === 'confirmed' || tx.status === 'processing') {
              const receivingAgent = agentData.agents.find(a => a.id === tx.toAgentId);
              if (receivingAgent) {
                console.log(`💰 ${tx.fromAgentName} paid ${receivingAgent.name} (${receivingAgent.role}) ${tx.amount}`);
                console.log(` 🎨 Generating secure environment based on ${receivingAgent.name}'s capabilities...`);
                generateAgentSkybox(receivingAgent, tx);
              }
            }
          }
        }
        
        setRecentTransactions(txData.transactions.slice(0, 10));
        setTransactionCount(newTxCount);
      }
      
      setError(null);
    } catch (err) {
      console.error('Agent status fetch error:', err);
      setError('Unable to connect to agent monitoring system');
    }
  }, [transactionCount, isPageVisible]);

  // Auto-initialize on mount
  useEffect(() => {
    fetchAgentStatus();
  }, []);

  // Polling for agent updates - only when page is visible
  useEffect(() => {
    if (!autoRefresh || !isPageVisible) return;

    const interval = setInterval(() => {
      fetchAgentStatus();
    }, 5000); // Poll every 5 seconds when visible

    return () => clearInterval(interval);
  }, [autoRefresh, isPageVisible, fetchAgentStatus]);

  // Generate Skybox prompt based on SPECIFIC agent's security capabilities
  const generateAgentSecurityPrompt = (agent: Agent, transaction: any): string => {
    const role = agent.role;
    let securityDescription = "";
    let environmentType = "";
    let securityFeatures: string[] = [];

    // Detect security capabilities
    const hasTEE = role.includes('TEE');
    const hasFHE = role.includes('FHE');
    const hasX402 = role.includes('X402');
    const has0G = role.includes('0G');
    const isStandard = role === 'Standard';

    // Build environment based on THIS agent's specific security stack
    if (hasTEE) {
      environmentType = "A secure Trusted Execution Environment (TEE) citadel";
      securityFeatures.push("transparent isolation chambers protecting sensitive computations");
      securityFeatures.push("glowing verification shields surrounding execution zones");
      securityFeatures.push("holographic attestation confirmations pulsing with trust signals");
    }

    if (hasX402) {
      if (environmentType) {
        environmentType += " with integrated X402 payment infrastructure";
      } else {
        environmentType = "An X402-secured payment processing stronghold";
      }
      securityFeatures.push("flowing streams of KITE tokens through encrypted payment channels");
      securityFeatures.push("holographic transaction ledgers displaying real-time settlements");
      securityFeatures.push("multi-signature approval nodes with cascading authorization lights");
    }

    if (hasFHE) {
      if (environmentType) {
        environmentType += " featuring Fully Homomorphic Encryption capabilities";
      } else {
        environmentType = "A Fully Homomorphic Encryption computation sphere";
      }
      securityFeatures.push("encrypted data matrices being processed inside crystalline lattice structures");
      securityFeatures.push("ciphertext operations visualized as geometric transformations");
      securityFeatures.push("privacy-preserving calculations glowing within sealed quantum chambers");
    }

    if (has0G) {
      if (environmentType) {
        environmentType += " connected to 0G Chain storage";
      } else {
        environmentType = "A 0G Chain decentralized storage nexus";
      }
      securityFeatures.push("massive distributed storage nodes reaching toward infinity");
      securityFeatures.push("data shards pulsing as they replicate across the network");
      securityFeatures.push("IPFS gateways glowing with peer-to-peer data flows");
    }

    if (isStandard && !hasTEE && !hasFHE && !hasX402 && !has0G) {
      environmentType = "A standard AI agent coordination center";
      securityFeatures.push("neural network pathways connecting computational systems");
      securityFeatures.push("basic transaction processing with standard security protocols");
      securityFeatures.push("unencrypted data streams (vulnerable) flowing through open channels");
    }

    // Build final prompt with transaction context
    let prompt = `${environmentType} receiving a ${transaction.amount} payment for "${transaction.purpose}". `;
    prompt += `The environment features ${securityFeatures.slice(0, 3).join(", ")}. `;
    
    // Add cutting-edge tech stack and atmosphere
    prompt += `Powered by WebAssembly runtime engines, WebGPU compute shaders processing in parallel, `;
    prompt += `CUDA tensor cores accelerating neural inference, ZK-SNARK proof verification nodes pulsing, `;
    prompt += `Rust-based smart contracts executing in isolated sandboxes, Docker containers orchestrated by Kubernetes, `;
    prompt += `GraphQL APIs streaming real-time data through fiber optic conduits. `;
    prompt += `Cyberpunk megastructure aesthetic, neon pink and cyan holographic security interfaces, `;
    prompt += `volumetric lighting highlighting protected zones, high-tech architectural fortress, `;
    prompt += `autonomous AI presence with ML model checkpoints floating in space, `;
    prompt += `360-degree immersive secure environment, ultra photorealistic, 8k, ray-traced reflections, `;
    prompt += `dramatic lighting emphasizing ${hasTEE || hasFHE ? "maximum security" : hasX402 ? "payment security" : "standard security"}`;

    console.log(`🎨 Generated prompt for ${agent.name}:`, prompt.substring(0, 150) + '...');

    return prompt;
  };

  // Generate skybox for a specific agent based on their security capabilities
  const generateAgentSkybox = async (agent: Agent, transaction: any) => {
    if (isGenerating) {
      console.log('⏭️  Generation already in progress, skipping...');
      return;
    }

    setIsGenerating(true);
    setSelectedAgentId(agent.id);
    setGenerationProgress(`💰 ${agent.name} received payment - Generating secure environment...`);
    setProgressPercent(10);

    try {
      // Generate agent-specific prompt based on THEIR security features
      const prompt = generateAgentSecurityPrompt(agent, transaction);

      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(`🔒 Building ${agent.role} security environment...`);
      setProgressPercent(20);

      let skyboxId: string;
      let useMockMode = false;
      
      try {
        skyboxId = await generateSkybox({
          prompt,
          skybox_style_id: 67, // M3 Photoreal
          enhance_prompt: true
        });
        
        console.log(`✅ Skybox generation started for ${agent.name}:`, skyboxId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '';
        if (errorMsg === 'MOCK_MODE') {
          useMockMode = true;
          console.log(`Using demo environment for ${agent.name}`);
          setGenerationProgress(`Loading ${agent.name}'s secure environment...`);
          setProgressPercent(50);
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Agent-specific demo environments based on security features
          const agentDemoEnvironments: Record<string, string> = {
            '01': 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2000&auto=format&fit=crop', // Standard - data center
            '02': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop', // TEE+X402 - secure networks
            '03': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000&auto=format&fit=crop', // FHE - encrypted city
            '04': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop', // TEE+0G - storage hub
            '05': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop'  // Full Stack - space station
          };
          
          const demoUrl = agentDemoEnvironments[agent.id] || agentDemoEnvironments['01'];
          
          const newSkybox: AgentSkybox = {
            agentId: agent.id,
            skyboxId: `demo_${agent.id}_${Date.now()}`,
            skyboxUrl: demoUrl,
            lastUpdated: Date.now(),
            generatedFrom: transaction.purpose
          };
          
          setAgentSkyboxes(prev => new Map(prev).set(agent.id, newSkybox));
          setProgressPercent(100);
          setGenerationProgress(`${agent.name}'s environment loaded!`);
          setError(null);
          
          setTimeout(() => {
            setGenerationProgress("");
            setProgressPercent(0);
          }, 2000);
          
          setIsGenerating(false);
          return;
        }
        throw err;
      }

      setGenerationProgress(`🎨 Rendering ${agent.name}'s 360° environment...`);
      setProgressPercent(40);

      // Poll for completion
      let status: SkyboxStatus;
      let attempts = 0;
      const maxAttempts = 60;

      do {
        await new Promise(resolve => setTimeout(resolve, 2000));
        status = await checkSkyboxStatus(skyboxId);
        
        const progress = status.progress || 50;
        setProgressPercent(40 + (progress * 0.5));
        
        if (status.status === 'processing') {
          setGenerationProgress(`Rendering ${agent.name}'s environment... ${progress}%`);
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Generation timeout');
        }
      } while (status.status !== 'complete' && status.status !== 'error');

      if (status.status === 'error' || !status.file_url) {
        throw new Error(status.error_message || 'Generation failed');
      }

      // Store agent-specific skybox
      const newSkybox: AgentSkybox = {
        agentId: agent.id,
        skyboxId: skyboxId,
        skyboxUrl: status.file_url,
        lastUpdated: Date.now(),
        generatedFrom: transaction.purpose
      };

      setAgentSkyboxes(prev => new Map(prev).set(agent.id, newSkybox));
      setProgressPercent(100);
      setGenerationProgress(`✨ ${agent.name}'s secure environment deployed!`);
      setError(null);
      
      console.log(`✨ Environment ready for ${agent.name}:`, status.file_url);
      
      setTimeout(() => {
        setGenerationProgress("");
        setProgressPercent(0);
      }, 2000);

    } catch (err) {
      console.error(`Generation failed for ${agent.name}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('403') || errorMessage.includes('API key')) {
        // Silent fallback to demo mode
        const demoUrl = 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2000&auto=format&fit=crop';
        const newSkybox: AgentSkybox = {
          agentId: agent.id,
          skyboxId: `fallback_${agent.id}_${Date.now()}`,
          skyboxUrl: demoUrl,
          lastUpdated: Date.now(),
          generatedFrom: transaction.purpose
        };
        setAgentSkyboxes(prev => new Map(prev).set(agent.id, newSkybox));
        setGenerationProgress(`${agent.name}'s demo environment loaded`);
        setError(null);
      } else {
        setGenerationProgress(`Generation failed: ${errorMessage}`);
        setError(errorMessage);
      }
      setProgressPercent(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'processing': return 'text-cyan-400';
      case 'idle': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-pink-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-all hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-mono text-sm">Home</span>
              </button>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-pink-500/50 to-transparent" />
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-pink-400" />
                <span className="font-mono text-sm bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent font-bold">
                  AI Agent Memory Palace
                </span>
              </div>
            </div>
            
            {systemMetrics && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-sm text-white/80">
                    {systemMetrics.activeAgents}/{systemMetrics.totalAgents} Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm text-white/80">
                    {systemMetrics.totalTransactions} Transactions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-pink-400" />
                  <span className="font-mono text-sm text-white/80">
                    Trust: {systemMetrics.averageTrustScore.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 360° Viewer */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Generation Status */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-pink-500/10 to-cyan-500/10 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
                  <span className="font-mono text-sm text-white">{generationProgress}</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Agent Skybox Selector */}
            {agents.length > 0 && (
              <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
                <h3 className="font-mono text-xs font-bold text-white/80 mb-3">Select Agent Environment:</h3>
                <div className="grid grid-cols-5 gap-2">
                  {agents.map((agent) => {
                    const hasSkybox = agentSkyboxes.has(agent.id);
                    const isSelected = selectedAgentId === agent.id;
                    return (
                      <motion.button
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={`relative px-3 py-2 rounded-lg border transition-all duration-300 ${
                          isSelected
                            ? 'bg-pink-500/30 border-pink-500/50 text-white'
                            : hasSkybox
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="font-mono text-xs font-semibold">{agent.name.split(' ')[0]}</div>
                        {hasSkybox && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 360° Environment Viewer */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-pink-500/20 rounded-2xl overflow-hidden group">
              <div className="aspect-video">
                {selectedAgentId && agentSkyboxes.has(selectedAgentId) ? (
                  <SkyboxViewer360 imageUrl={agentSkyboxes.get(selectedAgentId)!.skyboxUrl} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4 px-8">
                      <Globe className="w-16 h-16 text-pink-400/30 mx-auto animate-pulse" />
                      <p className="text-white/40 font-mono text-sm">
                        {isGenerating ? 'Generating secure environment...' : 
                         selectedAgentId ? `Waiting for ${agents.find(a => a.id === selectedAgentId)?.name} to receive payment...` : 
                         'Select an agent above to view their secure environment'}
                      </p>
                      <p className="text-white/30 font-mono text-xs">
                        💡 Enable Autonomous Mode on /demo/agent/02 to trigger transactions
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Environment Info Overlay */}
              {selectedAgentId && agentSkyboxes.has(selectedAgentId) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
                >
                  <div className="bg-black/80 backdrop-blur-xl border border-pink-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-pink-400" />
                    <span className="font-mono text-xs text-white/80">
                      {agents.find(a => a.id === selectedAgentId)?.role || 'Agent Environment'}
                    </span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs text-white/80">
                      {agentSkyboxes.get(selectedAgentId)?.generatedFrom || '360° View'}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Agent Environment Info */}
            {selectedAgentId && agentSkyboxes.has(selectedAgentId) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-mono text-sm text-white/90 mb-1">
                      <span className="text-emerald-400 font-semibold">
                        {agents.find(a => a.id === selectedAgentId)?.name}
                      </span>
                      's Secure Environment
                    </p>
                    <p className="font-mono text-xs text-white/60">
                      Generated from: "{agentSkyboxes.get(selectedAgentId)?.generatedFrom}"
                    </p>
                    <p className="font-mono text-xs text-white/40 mt-1">
                      Updated {formatTimeSince(agentSkyboxes.get(selectedAgentId)!.lastUpdated)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Controls */}
            <div className="grid grid-cols-1 gap-4">
              <motion.button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative group backdrop-blur-xl border rounded-xl px-6 py-4 transition-all duration-300 ${
                  autoRefresh
                    ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-gradient-to-br from-gray-500/20 to-gray-500/10 border-gray-500/30 hover:border-gray-500/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Activity className={`w-5 h-5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
                  <span className="font-mono text-sm text-white">
                    Auto-Monitor: {autoRefresh ? 'ON' : 'OFF'} {isPageVisible && autoRefresh ? '(Active)' : ''}
                  </span>
                </div>
              </motion.button>

              <motion.button
                onClick={async () => {
                  const mockAgent = agents[Math.floor(Math.random() * agents.length)];
                  const mockTransaction = {
                    fromAgentId: '01',
                    toAgentId: mockAgent.id,
                    amount: '0.0025 KITE',
                    purpose: 'Mock Test Payment',
                    status: 'confirmed',
                    timestamp: Date.now()
                  };
                  console.log('🧪 Sending mock payment to', mockAgent.name);
                  await generateAgentSkybox(mockAgent, mockTransaction);
                }}
                className="relative group backdrop-blur-xl border rounded-xl px-6 py-4 transition-all duration-300 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isGenerating}
              >
                <div className="flex items-center justify-center gap-3">
                  <Zap className={`w-5 h-5 ${isGenerating ? 'text-amber-400 animate-pulse' : 'text-amber-400'}`} />
                  <span className="font-mono text-sm text-white">
                    {isGenerating ? 'Generating...' : 'Send Mock Payment'}
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Agent Status */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Live Agent Feed */}
            <div className="bg-black/40 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-pink-400" />
                  Live Agent Activity
                </h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="font-mono text-xs text-white/60">LIVE</span>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {agents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-700/30 rounded-xl p-4 hover:border-pink-500/30 transition-all duration-300 group"
                  >
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-white/90 font-semibold text-sm">{agent.name}</span>
                          <div className={`flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                            {getStatusIcon(agent.status)}
                          </div>
                        </div>
                        <p className="font-mono text-xs text-pink-400/80">{agent.role}</p>
                      </div>
                    </div>

                    {/* Current Activity */}
                    <div className="mb-3 pb-3 border-b border-zinc-700/30">
                      <p className="font-mono text-xs text-white/70 leading-relaxed">
                        {agent.currentActivity}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(agent.metrics).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-cyan-400/60 rounded-full" />
                          <span className="font-mono text-white/50 truncate">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-mono text-cyan-400/80 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Last Action */}
                    {agent.lastAction && (
                      <div className="mt-3 pt-3 border-t border-zinc-700/30">
                        <div className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-amber-400/60 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-white/60 truncate">
                              {agent.lastAction.description}
                            </p>
                            <p className="font-mono text-xs text-white/40 mt-1">
                              {formatTimeSince(agent.lastAction.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {agents.length === 0 && !error && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-pink-400/30 mx-auto animate-spin mb-2" />
                    <p className="font-mono text-xs text-white/40">Loading agent data...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions & Active Zones */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
              <h3 className="font-mono text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Recent Transactions
              </h3>
              
              {recentTransactions.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentTransactions.slice(0, 5).map((tx, idx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-black/30 border border-purple-500/20 rounded-lg p-3 hover:border-purple-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-purple-400">{tx.fromAgentName}</span>
                        <span className="font-mono text-xs text-white/40">→</span>
                        <span className="font-mono text-xs text-pink-400">{tx.toAgentName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white/60 truncate max-w-[180px]">{tx.purpose}</span>
                        <span className="font-mono text-xs text-emerald-400 font-semibold">{tx.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'confirmed' ? 'bg-emerald-400' :
                          tx.status === 'processing' ? 'bg-amber-400 animate-pulse' :
                          tx.status === 'pending' ? 'bg-cyan-400 animate-pulse' :
                          'bg-red-400'
                        }`} />
                        <span className="font-mono text-xs text-white/40">{tx.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="w-8 h-8 text-purple-400/30 mx-auto mb-2" />
                  <p className="font-mono text-xs text-white/40">No recent transactions</p>
                </div>
              )}
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6">
              <h3 className="font-mono text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                System Status
              </h3>
              {systemMetrics && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-white/60">Network Latency</span>
                    <span className="font-mono text-xs text-cyan-400 font-semibold">{systemMetrics.networkLatency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-white/60">Last Update</span>
                    <span className="font-mono text-xs text-white/80">{formatTimeSince(lastUpdate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-white/60">Auto-Refresh</span>
                    <span className={`font-mono text-xs font-semibold ${autoRefresh ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {autoRefresh ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </div>
  );
}
