'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Volume2, VolumeX, Loader2 } from 'lucide-react';
import TalkingAgent3D from './talking-agent-3d';

interface InteractiveAgentViewProps {
  agent: {
    id: string;
    name: string;
    role: string;
    description: string;
    capabilities?: string[];
    image: string;
  };
}

export default function InteractiveAgentView({ agent }: InteractiveAgentViewProps) {
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
    <div className="min-h-screen bg-[#020202] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: 3D Agent */}
          <div className="space-y-4">
            <TalkingAgent3D 
              isPlaying={isPlaying} 
              audioData={audioData} 
              agentName={agent.name} 
            />

            {/* Agent Info Card */}
            <div className="bg-gradient-to-br from-red-950/30 to-black/60 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-2">{agent.name}</h3>
              <p className="text-red-400/90 text-sm font-semibold mb-4">{agent.role}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{agent.description}</p>
              
              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-500/20">
                  <h4 className="text-xs font-semibold text-red-400 mb-2">CAPABILITIES</h4>
                  <ul className="space-y-1">
                    {agent.capabilities.slice(0, 3).map((cap, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* API Status Indicator */}
            <div className="bg-black/40 border border-red-500/10 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ElevenLabs TTS</span>
                <div className={`flex items-center gap-1 ${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'text-green-500' : 'text-yellow-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>{process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? 'Active' : 'Not Configured'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Chat Interface */}
          <div className="flex flex-col h-[600px] bg-gradient-to-br from-black/60 to-red-950/20 border border-red-500/20 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-red-500/20 bg-black/40">
              <h2 className="text-lg font-bold text-white">Chat with {agent.name}</h2>
              <p className="text-xs text-gray-400 mt-1">Real-time AI conversation</p>
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
      </div>
    </div>
  );
}
