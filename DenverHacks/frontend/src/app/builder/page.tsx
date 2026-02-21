'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, DollarSign, RefreshCw } from 'lucide-react';
import CitadelViewer from '@/components/ui/citadel-viewer';
import { 
  generateAndWait, 
  remixSkybox, 
  CITADEL_PROMPTS,
  getCitadelPromptByReputation,
  type SkyboxStatus 
} from '@/lib/skybox';

export default function BuilderPage() {
  const [skyboxUrl, setSkyboxUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(CITADEL_PROMPTS.starter);
  const [customPrompt, setCustomPrompt] = useState('');
  const [trustScore, setTrustScore] = useState(50);
  const [generationId, setGenerationId] = useState<string | null>(null);

  // Mock trust score tracker (replace with real ERC-8004 data)
  useEffect(() => {
    const interval = setInterval(() => {
      setTrustScore(prev => Math.min(100, prev + Math.random() * 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const url = await generateAndWait(
        { prompt: customPrompt || currentPrompt },
        (status: SkyboxStatus) => {
          setProgress(status.progress || 0);
          if (status.id) setGenerationId(status.id);
        }
      );
      setSkyboxUrl(url);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate citadel. Check your API key in .env.local');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleRemix = async () => {
    if (!generationId) {
      alert('Generate a citadel first before remixing');
      return;
    }

    setIsGenerating(true);
    try {
      const newPrompt = getCitadelPromptByReputation(trustScore);
      const url = await remixSkybox(generationId, newPrompt);
      setSkyboxUrl(url);
    } catch (error) {
      console.error('Remix failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const hotspots = [
    {
      position: [50, 20, 0] as [number, number, number],
      label: 'Hedera HCS',
      onClick: () => alert('ERC-8004 Trust Score: ' + trustScore.toFixed(2)),
    },
    {
      position: [-50, 20, 0] as [number, number, number],
      label: 'x402 Bridge',
      onClick: () => alert('Kite AI Micropayments Active'),
    },
    {
      position: [0, 50, 0] as [number, number, number],
      label: 'TEE Core',
      onClick: () => alert('Secure Execution Environment Online'),
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
            Citadel Builder
          </h1>
          <p className="text-gray-400">
            Generate your AI Agent's 3D environment powered by Blockade Labs Skybox AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Agent Stats */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-500" />
                Agent Status
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Trust Score</span>
                    <span className="text-pink-400 font-mono">{trustScore.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  ERC-8004 • Hedera HCS
                </div>
              </div>
            </div>

            {/* Prompt Templates */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Templates
              </h3>
              <div className="space-y-2">
                {Object.entries(CITADEL_PROMPTS).map(([key, prompt]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentPrompt(prompt)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      currentPrompt === prompt
                        ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Custom Prompt</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Or write your own SENTINEL prompt..."
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:border-pink-500 focus:outline-none min-h-[100px] font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate Citadel'}
              </button>

              <button
                onClick={handleRemix}
                disabled={isGenerating || !generationId}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Remix Based on Trust Score
              </button>

              <button
                onClick={() => alert('x402 payment integration coming soon')}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Upgrade with x402
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 text-xs text-gray-400">
              <p className="font-bold text-pink-400 mb-2">💡 Pro Tip</p>
              <p>
                Skybox generation takes 15-20 seconds. The remix feature keeps your citadel structure but changes its appearance based on your agent's trust score.
              </p>
            </div>
          </motion.div>

          {/* Right Panel - 3D Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden"
            style={{ height: '800px' }}
          >
            <CitadelViewer
              skyboxUrl={skyboxUrl || undefined}
              isLoading={isGenerating}
              progress={progress}
              hotspots={hotspots}
            />
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/20 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold mb-3 text-pink-400">How the Remix Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <div className="font-bold text-white mb-2">🎨 Evolution</div>
              <p>When your agent earns USDC on Base, remix keeps the structure but transforms materials to gold with brighter lighting.</p>
            </div>
            <div>
              <div className="font-bold text-white mb-2">🔴 Security</div>
              <p>If trust score drops below 30, the citadel enters "Red Alert" mode with warning lights and glitch effects.</p>
            </div>
            <div>
              <div className="font-bold text-white mb-2">⚡ x402 Bridge</div>
              <p>Trigger Kite AI micropayments to upgrade your citadel. The Skybox API sees the payment and generates the luxury world.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
