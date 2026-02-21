'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Volume2, VolumeX, Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import TalkingAgent3D from './talking-agent-3d';
import AgentZeroGNFT from './agent-zerog-nft';
import { AgentWalletBalance } from './agent-wallet-balance';
import { OnChainActivityFeed } from './on-chain-activity-feed';
import { PerToolUsageBilling } from './per-tool-usage-billing';
import { PaymentInflowOutflowChart } from './payment-inflow-outflow-chart';
import { ScopesAndLimits } from './scopes-and-limits';
import { AgentIdentityCard } from './agent-identity-card';
import type { AgentDetail } from '@/lib/agents';

interface InteractiveAgentViewProps {
  agent: AgentDetail;
}

export default function InteractiveAgentView({ agent }: InteractiveAgentViewProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message on mount
  useEffect(() => {
    setConversationHistory([
      {
        role: 'agent',
        text: `Hi! I'm ${agent.name}, your ${agent.role}. Ask me anything about my capabilities or how I can help you!`,
      },
    ]);
  }, [agent]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Setup audio analysis
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Audio visualization loop
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(new Uint8Array(dataArray));
        requestAnimationFrame(updateAudioData);
      }
    };

    updateAudioData();
  }, [isPlaying]);

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    const userMessage = message.trim();
    setMessage('');
    setIsProcessing(true);

    // Add user message to history
    setConversationHistory(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      // Get AI response from API route
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          agentContext: {
            name: agent.name,
            role: agent.role,
            description: agent.description,
            capabilities: agent.capabilities,
          },
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get response');
      }

      const { response } = await chatResponse.json();

      // Add agent response to history
      setConversationHistory(prev => [...prev, { role: 'agent', text: response }]);

      // Check if ElevenLabs API key is configured
      if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
        console.warn('ElevenLabs API key not configured. Showing text-only response.');
        setIsProcessing(false);
        return;
      }

      // Generate speech via API route
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: response }),
      });

      if (!ttsResponse.ok) {
        console.error('TTS failed, showing text-only response');
        setIsProcessing(false);
        return;
      }

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      if (!isMuted && audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setAudioData(null);
        URL.revokeObjectURL(audioUrl);
      };

      if (!isMuted) {
        await audio.play();
      } else {
        // Still show animation even when muted
        setIsPlaying(true);
        setTimeout(() => {
          setIsPlaying(false);
          setAudioData(null);
        }, response.length * 50); // Approximate duration
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setConversationHistory(prev => [
        ...prev,
        { role: 'agent', text: 'Sorry, I encountered an error. Please make sure your API keys are configured correctly.' },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] px-4 py-8 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/demo')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all border border-zinc-700"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {agent.name}
              <span className="ml-3 text-sm font-normal text-emerald-400">#{agent.id}</span>
            </h1>
            <p className="text-gray-400">{agent.role}</p>
          </div>
          
          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg"
          >
            <MessageSquare size={18} />
            <span className="hidden md:inline">{showChat ? 'Hide Chat' : 'Open Chat'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Chat Overlay (when open) */}
        {showChat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-[600px] bg-gradient-to-br from-black to-red-950/20 border border-red-500/30 rounded-xl overflow-hidden shadow-2xl flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-red-500/20 bg-black/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Chat with {agent.name}</h2>
                  <p className="text-xs text-gray-400 mt-1">Real-time AI conversation</p>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'bg-red-950/50 border border-red-500/30 text-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-red-950/50 border border-red-500/30 px-4 py-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-red-500/20 bg-black/60">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${agent.name} anything...`}
                    className="flex-1 bg-red-950/20 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    disabled={isProcessing}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !message.trim()}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/20"
                  >
                    {isProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="px-4 py-3 bg-red-950/40 border border-red-500/30 hover:bg-red-950/60 text-white rounded-lg transition-all"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Row - Identity & Core Info */}
          <div className="lg:col-span-1">
            <AgentIdentityCard 
              name={agent.name}
              walletAddress={agent.walletAddress || ''}
              verified={agent.verified}
            />
          </div>
          
          <div className="lg:col-span-1">
            <AgentZeroGNFT agentId={agent.id} />
          </div>
          
          {agent.wallet && (
            <div className="lg:col-span-1">
              <AgentWalletBalance wallet={agent.wallet} />
            </div>
          )}

          {/* Middle Row - Activity & Usage */}
          {agent.onChainHistory && agent.onChainHistory.length > 0 && (
            <div className="lg:col-span-2">
              <OnChainActivityFeed entries={agent.onChainHistory} />
            </div>
          )}
          
          {agent.toolUsage && agent.toolUsage.length > 0 && (
            <div className="lg:col-span-1">
              <PerToolUsageBilling usage={agent.toolUsage} />
            </div>
          )}

          {/* Bottom Row - Payments & Limits */}
          {agent.paymentTransactions && agent.paymentTransactions.length > 0 && (
            <div className="lg:col-span-2">
              <PaymentInflowOutflowChart transactions={agent.paymentTransactions} />
            </div>
          )}
          
          {agent.scopesAndLimits && (
            <div className="lg:col-span-1">
              <ScopesAndLimits scopes={agent.scopesAndLimits} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
