'use client';

import { useState, useEffect } from 'react';
import { apiClient, type Agent } from '@/lib/api-client';
import { Loader2, Plus, User, Wallet, Trophy, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', wallet: '' });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listAgents();
      setAgents(response.agents);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.wallet) return;

    try {
      await apiClient.createAgent(newAgent);
      setNewAgent({ name: '', wallet: '' });
      setShowCreateForm(false);
      loadAgents();
    } catch (err: any) {
      alert('Failed to create agent: ' + err.message);
    }
  };

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
            <span className="font-mono text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm text-white/60">Agent Registry</span>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 pt-32 pb-20">
        {/* Title */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white">
            🦅 AI Agents
          </h1>
          <p className="text-lg text-white/60">
            Sovereign agents with on-chain identity and reputation
          </p>
        </motion.div>

        {/* Create Agent Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl transition-all font-semibold shadow-lg shadow-pink-500/50"
          >
            <Plus size={20} />
            Create New Agent
          </button>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            className="mb-12 p-8 bg-zinc-900/50 backdrop-blur-sm border border-pink-500/20 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-pink-400">Create New Agent</h2>
            <form onSubmit={handleCreateAgent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Agent Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="e.g., AI Trading Bot Alpha"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Wallet Address</label>
                <input
                  type="text"
                  value={newAgent.wallet}
                  onChange={(e) => setNewAgent({ ...newAgent, wallet: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl focus:outline-none focus:border-pink-500 font-mono text-sm transition-colors"
                  placeholder="0x..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-xl transition-all font-semibold"
                >
                  Create Agent
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-pink-500" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            className="p-6 bg-red-900/20 border border-red-500/50 rounded-2xl mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-400 font-mono">Error: {error}</p>
            <p className="text-white/60 text-sm mt-2">Make sure the backend server is running on port 3000</p>
          </motion.div>
        )}

        {/* Agents Grid */}
        {!loading && !error && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {agents.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="text-white/40 mb-4">
                  <User size={64} className="mx-auto mb-4" />
                  <p className="text-lg">No agents found</p>
                  <p className="text-sm mt-2">Create your first agent to get started!</p>
                </div>
              </div>
            ) : (
              agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  className="group p-6 bg-zinc-900/50 backdrop-blur-sm border border-pink-500/20 hover:border-pink-500/50 rounded-2xl transition-all cursor-pointer overflow-hidden relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-pink-400 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-white/40 font-mono">
                          {agent.agentId}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-pink-500/50 transition-shadow">
                        <User size={24} className="text-white" />
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Wallet size={16} className="text-pink-500" />
                        <span className="font-mono text-white/60 text-xs">
                          {agent.wallet.substring(0, 8)}...{agent.wallet.substring(34)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Trophy size={16} className="text-pink-500" />
                        <span className="text-white/60">
                          Reputation: <span className="text-white font-semibold">{agent.reputationScore.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>

                    {agent.balance && (
                      <div className="mt-4 pt-4 border-t border-pink-500/20">
                        <p className="text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Balances</p>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/60">Base:</span>
                            <span className="font-mono text-pink-400">{agent.balance.baseBalanceWei} wei</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Kite:</span>
                            <span className="font-mono text-pink-400">{agent.balance.kiteBalanceWei} wei</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <span
                        className={`inline-block px-3 py-1.5 text-xs rounded-full font-mono ${
                          agent.active
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {agent.active ? '● ACTIVE' : '○ INACTIVE'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
