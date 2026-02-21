# 🤖 3D Talking Agent with ElevenLabs Integration Guide

## Overview
This guide will help you create a fully animated 3D AI agent with:
- **Realistic 3D character model** (head/face)
- **Lip-sync mouth animations** synced to ElevenLabs audio
- **Context-aware conversations** using AI
- **Real-time audio-driven animation**

---

## 📦 Step 1: Install Required Dependencies

```bash
cd C:\Users\HEET\Downloads\DenverHacks-jag\DenverHacks-jag

# Core 3D and animation
npm install three @react-three/fiber @react-three/drei

# ElevenLabs SDK
npm install elevenlabs

# WebSocket for real-time streaming
npm install @11labs/client

# Audio analysis for lip-sync
npm install web-audio-api

# AI conversation (OpenAI)
npm install openai

# Additional utilities
npm install zustand
```

---

## 🔑 Step 2: Setup Environment Variables

Create or update `.env.local`:

```env
# ElevenLabs API
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel voice (or choose your own)

# OpenAI for conversation
OPENAI_API_KEY=your_openai_api_key_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Get ElevenLabs API Key:**
1. Go to https://elevenlabs.io/
2. Sign up / Log in
3. Visit https://elevenlabs.io/app/settings/api-keys
4. Generate new API key
5. Choose a voice ID from https://elevenlabs.io/app/voice-library

---

## 🎭 Step 3: Create the 3D Talking Head Component

Create `components/ui/talking-agent-3d.tsx`:

```typescript
'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface TalkingAgent3DProps {
  isPlaying: boolean;
  audioData: Uint8Array | null;
  agentName: string;
}

// Simple 3D head model with mouth animation
function AnimatedHead({ isPlaying, audioData }: { isPlaying: boolean; audioData: Uint8Array | null }) {
  const meshRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  
  // Mouth parameters
  const [mouthOpen, setMouthOpen] = useState(0);

  // Animate based on audio data
  useEffect(() => {
    if (!audioData || !isPlaying) {
      setMouthOpen(0);
      return;
    }

    // Calculate average volume from audio data
    const sum = audioData.reduce((acc, val) => acc + val, 0);
    const average = sum / audioData.length;
    
    // Map volume (0-255) to mouth open amount (0-1)
    const normalized = Math.min(average / 128, 1);
    setMouthOpen(normalized);
  }, [audioData, isPlaying]);

  // Idle animation when not talking
  useFrame((state) => {
    if (meshRef.current && !isPlaying) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    // Animate mouth
    if (mouthRef.current) {
      const targetScale = 1 + mouthOpen * 0.3;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(
        mouthRef.current.scale.y,
        targetScale,
        0.3
      );
    }
  });

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#ffdbac" 
          roughness={0.8} 
          metalness={0.2} 
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.3, 0.8]}>
        <capsuleGeometry args={[0.2, 0.3, 8, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 1]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
    </group>
  );
}

export default function TalkingAgent3D({ isPlaying, audioData, agentName }: TalkingAgent3DProps) {
  return (
    <div className="relative w-full h-[400px] bg-black/20 rounded-2xl overflow-hidden border border-red-500/20">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />
        
        <Suspense fallback={null}>
          <AnimatedHead isPlaying={isPlaying} audioData={audioData} />
        </Suspense>
      </Canvas>

      {/* Agent name badge */}
      <div className="absolute bottom-4 left-4 px-4 py-2 bg-red-950/80 border border-red-500/30 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-white text-sm font-mono">{agentName}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎤 Step 4: Create ElevenLabs Integration Service

Create `lib/elevenlabs-service.ts`:

```typescript
import { ElevenLabsClient } from 'elevenlabs';

export class ElevenLabsService {
  private client: ElevenLabsClient;
  private voiceId: string;

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
    });
    this.voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  }

  /**
   * Generate speech from text with streaming
   */
  async *textToSpeechStream(text: string) {
    try {
      const audioStream = await this.client.generate({
        voice: this.voiceId,
        text,
        model_id: 'eleven_turbo_v2_5', // Fast, low-latency model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      });

      for await (const chunk of audioStream) {
        yield chunk;
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Generate speech and return as blob
   */
  async textToSpeech(text: string): Promise<Blob> {
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of this.textToSpeechStream(text)) {
      chunks.push(chunk);
    }

    return new Blob(chunks, { type: 'audio/mpeg' });
  }

  /**
   * List available voices
   */
  async getVoices() {
    return await this.client.voices.getAll();
  }
}

// Singleton instance
let elevenLabsInstance: ElevenLabsService | null = null;

export function getElevenLabsService(): ElevenLabsService {
  if (!elevenLabsInstance) {
    elevenLabsInstance = new ElevenLabsService();
  }
  return elevenLabsInstance;
}
```

---

## 🧠 Step 5: Create AI Conversation Handler

Create `lib/agent-conversation.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AgentContext {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
}

export class AgentConversationManager {
  private context: AgentContext;
  private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(context: AgentContext) {
    this.context = context;
    
    // Initialize with system prompt
    this.conversationHistory.push({
      role: 'system',
      content: \`You are \${context.name}, a \${context.role}. 
      
Description: \${context.description}

Your capabilities include:
\${context.capabilities.map(c => \`- \${c}\`).join('\\n')}

Respond naturally and concisely (2-3 sentences max). Stay in character and reference your specific capabilities when relevant. Be helpful and engaging.\`,
    });
  }

  async chat(userMessage: string): Promise<string> {
    // Add user message
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: this.conversationHistory,
        temperature: 0.8,
        max_tokens: 150,
      });

      const assistantMessage = response.choices[0].message.content || '';

      // Add to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      // Keep history limited to last 10 messages
      if (this.conversationHistory.length > 11) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-10),
        ];
      }

      return assistantMessage;
    } catch (error) {
      console.error('OpenAI chat error:', error);
      return "I'm having trouble processing that right now. Please try again.";
    }
  }

  reset() {
    this.conversationHistory = [this.conversationHistory[0]];
  }
}
```

---

## 🎯 Step 6: Create the Interactive Agent Page

Create `components/ui/interactive-agent-view.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, VolumeX } from 'lucide-react';
import TalkingAgent3D from './talking-agent-3d';
import { getElevenLabsService } from '@/lib/elevenlabs-service';
import { AgentConversationManager, type AgentContext } from '@/lib/agent-conversation';

interface InteractiveAgentViewProps {
  agent: {
    id: string;
    name: string;
    role: string;
    description: string;
    capabilities: string[];
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
  const conversationManagerRef = useRef<AgentConversationManager | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize conversation manager
  useEffect(() => {
    conversationManagerRef.current = new AgentConversationManager({
      name: agent.name,
      role: agent.role,
      description: agent.description,
      capabilities: agent.capabilities,
    });

    // Add welcome message
    setConversationHistory([
      {
        role: 'agent',
        text: \`Hi! I'm \${agent.name}, your \${agent.role}. Ask me anything!\`,
      },
    ]);
  }, [agent]);

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
      // Get AI response
      const response = await conversationManagerRef.current!.chat(userMessage);

      // Add agent response to history
      setConversationHistory(prev => [...prev, { role: 'agent', text: response }]);

      // Generate speech
      const elevenLabs = getElevenLabsService();
      const audioBlob = await elevenLabs.textToSpeech(response);
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
        { role: 'agent', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: 3D Agent */}
      <div className="space-y-4">
        <TalkingAgent3D 
          isPlaying={isPlaying} 
          audioData={audioData} 
          agentName={agent.name} 
        />

        {/* Agent Info */}
        <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
          <p className="text-red-400/80 text-sm mb-4">{agent.role}</p>
          <p className="text-gray-300 text-sm">{agent.description}</p>
        </div>
      </div>

      {/* Right: Chat Interface */}
      <div className="flex flex-col h-[600px] bg-black/40 border border-red-500/20 rounded-xl overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {conversationHistory.map((msg, i) => (
            <div
              key={i}
              className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div
                className={\`max-w-[80%] px-4 py-3 rounded-lg \${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-950/40 border border-red-500/30 text-gray-200'
                }\`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-red-950/40 border border-red-500/30 px-4 py-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-red-500/20 bg-black/60">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder=\`Ask \${agent.name} anything...\`
              className="flex-1 bg-red-950/20 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              disabled={isProcessing}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !message.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={18} />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="px-4 py-3 bg-red-950/40 border border-red-500/30 hover:bg-red-950/60 text-white rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Step 7: Update the Agent Page

Update `app/demo/agent/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { getAgentDetailById } from '@/lib/agents';
import InteractiveAgentView from '@/components/ui/interactive-agent-view';

interface PageProps {
  params: { id: string };
}

export default function AgentPage({ params }: PageProps) {
  const agent = getAgentDetailById(params.id);
  if (!agent) notFound();
  
  return (
    <div className="min-h-screen bg-[#020202] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <InteractiveAgentView agent={agent} />
      </div>
    </div>
  );
}
```

---

## 🎨 Step 8: (Optional) Use Advanced 3D Model

For more realistic head models, you can use Ready Player Me or custom GLB files:

```typescript
// In talking-agent-3d.tsx
import { useGLTF } from '@react-three/drei';

function RealisticHead({ isPlaying, audioData }: { isPlaying: boolean; audioData: Uint8Array | null }) {
  const { scene, animations } = useGLTF('/models/agent-head.glb');
  const mixer = useRef<THREE.AnimationMixer>();
  const mouthShape = useRef(0);

  useEffect(() => {
    if (scene && animations.length) {
      mixer.current = new THREE.AnimationMixer(scene);
      // Setup morph target animations for mouth
    }
  }, [scene, animations]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
    
    // Update mouth blend shapes based on audio
    if (audioData && scene) {
      const avg = audioData.reduce((a, b) => a + b) / audioData.length;
      mouthShape.current = Math.min(avg / 128, 1);
      
      // Apply to morph targets (if available)
      scene.traverse((child) => {
        if (child.morphTargetInfluences) {
          child.morphTargetInfluences[0] = mouthShape.current; // Jaw open
        }
      });
    }
  });

  return <primitive object={scene} scale={2} />;
}
```

---

## 🚀 Step 9: Run and Test

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Test the agent:**
   - Navigate to `http://localhost:3002/demo`
   - Click on any agent
   - Type a message and hit send
   - Watch the 3D head animate as it speaks!

---

## 🎯 Usage Flow

1. **User types message** → Send button
2. **OpenAI processes** → Generates contextual response
3. **ElevenLabs generates audio** → Realistic voice
4. **Audio analyzer** → Extracts frequency data
5. **3D head animates** → Mouth moves with audio
6. **Response displayed** → In chat interface

---

## 🔧 Advanced Features

### 1. **Voice Input (Speech-to-Text)**
```typescript
// Add to interactive-agent-view.tsx
const [isListening, setIsListening] = useState(false);
const recognitionRef = useRef<SpeechRecognition | null>(null);

const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognitionRef.current = new SpeechRecognition();
  
  recognitionRef.current.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setMessage(transcript);
  };
  
  recognitionRef.current.start();
  setIsListening(true);
};
```

### 2. **Emotion-Based Animations**
```typescript
// Detect sentiment and adjust facial expression
const analyzeSentiment = (text: string) => {
  // Use sentiment analysis library
  // Adjust eyebrow position, eye shape, etc.
};
```

### 3. **Real-Time Streaming**
```typescript
// Use ElevenLabs WebSocket API for faster response
import { stream } from 'elevenlabs/api';

const streamResponse = async (text: string) => {
  const audioStream = await stream(client.textToSpeech.stream(voiceId, {
    text,
    model_id: "eleven_turbo_v2_5"
  }));
  
  // Play audio chunks as they arrive
};
```

---

## 📊 Performance Tips

1. **Lazy load 3D models** - Use React Suspense
2. **Cache audio responses** - Store frequently asked questions
3. **Optimize audio bitrate** - Use lower quality for faster streaming
4. **Debounce user input** - Prevent spam requests
5. **Use Web Workers** - For audio processing

---

## 🎓 Resources

- **ElevenLabs Docs**: https://elevenlabs.io/docs
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **OpenAI API**: https://platform.openai.com/docs
- **Ready Player Me**: https://readyplayer.me/ (for realistic avatars)
- **Mixamo**: https://www.mixamo.com/ (for animations)

---

## 🐛 Troubleshooting

**Issue: Audio not playing**
- Check browser audio permissions
- Verify ElevenLabs API key
- Check console for CORS errors

**Issue: Mouth not moving**
- Ensure audio context is connected
- Check analyser node setup
- Verify audioData is updating

**Issue: Slow responses**
- Use `eleven_turbo_v2_5` model (fastest)
- Implement response streaming
- Cache common responses

---

## ✅ Quick Checklist

- [ ] Install all dependencies
- [ ] Add ElevenLabs API key to `.env.local`
- [ ] Add OpenAI API key to `.env.local`
- [ ] Create `talking-agent-3d.tsx` component
- [ ] Create `elevenlabs-service.ts` service
- [ ] Create `agent-conversation.ts` manager
- [ ] Create `interactive-agent-view.tsx` page
- [ ] Update agent detail page
- [ ] Test with sample conversation
- [ ] Verify audio + animation sync

---

**Your 3D talking agent is now ready! Each agent will have a unique personality based on their role and capabilities, with realistic voice responses and mouth animations synced to ElevenLabs audio.** 🎉🤖
