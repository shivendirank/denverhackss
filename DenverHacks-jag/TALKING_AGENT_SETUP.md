# 🤖 3D Talking AI Agent - Quick Setup

## ✅ Installation Complete!

All dependencies have been installed:
- ✅ Three.js v0.160.0
- ✅ @react-three/fiber v8.17.10 (React 18 compatible)
- ✅ @react-three/drei v9.114.3
- ✅ @elevenlabs/elevenlabs-js
- ✅ OpenAI v4.77.0

## 🔑 Get Your API Keys (Required)

### 1. ElevenLabs API Key (for voice synthesis)
1. Go to https://elevenlabs.io/
2. Sign up or log in
3. Visit https://elevenlabs.io/app/settings/api-keys
4. Click "Generate API Key"
5. Copy your API key

### 2. OpenAI API Key (for conversations - Optional)
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Visit https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy your API key

**Note:** If you don't provide an OpenAI key, the agent will use fallback keyword-based responses.

## ⚙️ Configuration

Open `.env.local` and add your keys:

```env
# Required for voice
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional for AI conversations (uses fallback if not provided)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional - choose a different voice
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### Available Voices
Visit https://elevenlabs.io/app/voice-library to choose a voice:
- **21m00Tcm4TlvDq8ikWAM** - Rachel (professional female)
- **pNInz6obpgDQGcFmaJgB** - Adam (deep male)
- **EXAVITQu4vr4xnSDxMaL** - Bella (soft female)

## 🚀 Start the Server

The dev server should already be running on port 3002. If not:

```bash
cd C:\Users\HEET\Downloads\DenverHacks-jag\DenverHacks-jag
npm run dev
```

## 🎯 Test the 3D Talking Agent

1. Open http://localhost:3002/demo
2. Click on any agent (Neural Core, Quantum Mind, etc.)
3. You'll see a 3D animated head
4. Type a message in the chat: "Hello, what can you do?"
5. Press Enter or click Send
6. Watch the agent's mouth move as it speaks!

## 🎭 Features

### Without API Keys
- ✅ 3D animated head with blinking eyes
- ✅ Interactive chat interface
- ✅ Keyword-based responses
- ⚠️ No voice synthesis

### With ElevenLabs API Key
- ✅ Realistic voice synthesis
- ✅ Mouth animations synced to audio
- ✅ Audio visualizer
- ✅ Mute/unmute controls

### With Both API Keys
- ✅ All above features
- ✅ Context-aware AI conversations
- ✅ Agent personality based on role
- ✅ Memory of conversation history

## 🔧 What Was Created

### New Components
1. **talking-agent-3d.tsx** - 3D head with mouth animations
2. **interactive-agent-view.tsx** - Full chat interface
3. **elevenlabs-service.ts** - Voice synthesis service
4. **agent-conversation.ts** - AI conversation manager

### Updated Files
1. **app/demo/agent/[id]/page.tsx** - Now uses InteractiveAgentView
2. **lib/agents.ts** - Added capabilities and descriptions

## 🎨 How It Works

```
User types message
    ↓
Agent processes with OpenAI (or fallback)
    ↓
Response sent to ElevenLabs TTS
    ↓
Audio analyzed in real-time
    ↓
3D mouth animates based on audio frequency
    ↓
User hears agent speaking with synced visuals
```

## 💡 Pro Tips

1. **Better Responses:** Add OpenAI API key for intelligent conversations
2. **Custom Voice:** Change NEXT_PUBLIC_ELEVENLABS_VOICE_ID in .env.local
3. **Volume:** Use the speaker icon to mute/unmute
4. **Rotation:** The 3D head auto-rotates when idle, drag to rotate manually

## 🐛 Troubleshooting

### "ElevenLabs API key not configured"
- Add NEXT_PUBLIC_ELEVENLABS_API_KEY to .env.local
- Restart the dev server

### No audio playing
- Check browser permissions for audio
- Unmute using the speaker button
- Check browser console for errors

### Responses are generic
- Add OPENAI_API_KEY for AI-powered responses
- Without it, agents use simple keyword matching

### 3D head not visible
- Check browser WebGL support
- Clear cache and refresh (Ctrl+Shift+R)

## 📊 Agent Personalities

Each agent has unique capabilities:

- **Neural Core** - AI architecture design expert
- **Quantum Mind** - ML model training specialist  
- **Cyber Vision** - Computer vision expert
- **Data Nexus** - Data science professional
- **Synapse AI** - Neural research innovator

Try asking them about their specific skills!

## 🎓 Next Steps

Want to enhance further?

1. **Advanced 3D Models** - Replace simple head with Ready Player Me avatars
2. **Emotion Detection** - Add facial expressions based on sentiment
3. **Voice Input** - Add speech-to-text for voice conversations
4. **Streaming Responses** - Use WebSocket for real-time audio streaming
5. **Multiple Languages** - ElevenLabs supports 29+ languages

See TALKING_AGENT_GUIDE.md for advanced features.

---

**Ready to test?** Add your API keys to `.env.local` and visit http://localhost:3002/demo! 🚀
