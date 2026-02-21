# 3D Agent Environment System - Complete Guide

## 🎯 Overview

The **3D Agent Memory Palace** is a live, reactive 360° environment that visualizes AI agent transactions and activity in real-time. Unlike traditional static visualizations, this system **evolves dynamically** based on agent behavior using Skybox AI's remix capabilities.

## 🌟 Key Features

### 1. **Live Transaction Monitoring**
- Polls agent transaction API every 5 seconds
- Detects new X402 payments between agents
- Tracks up to 10 most recent transactions
- Shows transaction status: `pending` → `processing` → `confirmed`

### 2. **Dynamic Environment Generation**
- **Initial Generation**: Creates base environment from agent capabilities
- **Remix on Activity**: When new transactions occur, the environment **remixes** (evolves) using Skybox AI
- **Agent-Specific Zones**: Different visual zones for each agent tech stack:
  - 🔒 **TEE Zone**: Transparent isolation chambers with verification shields
  - 💰 **X402 Hub**: Flowing KITE token streams with holographic confirmations
  - 🔐 **FHE Sphere**: Encrypted data matrices in crystalline structures
  - 💾 **0G Network**: Massive storage nodes reaching skyward
  - 🧠 **Standard Center**: Neural network coordination pathways

### 3. **Environment Remixing**
The system uses Skybox's `remix_imagine_id` feature to **evolve environments** rather than regenerating from scratch:

```typescript
// When new transaction detected:
if (newTxCount > transactionCount) {
  console.log('🔄 New transactions detected - triggering remix');
  setShouldRemix(true);
}

// Remix uses previous skybox as base:
await generateSkybox({
  prompt: updatedPrompt,
  remix_imagine_id: currentSkyboxId, // Evolve from current state
  enhance_prompt: true
});
```

**Why Remix?**
- ✅ Faster generation (builds on existing environment)
- ✅ Maintains visual continuity (smooth transitions)
- ✅ Better represents "evolution" of agent activity
- ✅ More cost-effective than full regeneration

### 4. **Active Agent Zones**
Visual indicators showing which agents are currently transacting:
- **Glowing badges** for agents with recent transactions
- **Pulse animations** on active zones
- **Color-coded** by transaction status

### 5. **Prompt Generation Based on Agent Tech Stacks**

The system generates environment descriptions dynamically:

```typescript
// Example for Agent '02' (TEE + X402):
"An interconnected AI agent citadel featuring a secure TEE zone with 
transparent isolation chambers and glowing verification shields, an X402 
payment hub with flowing streams of KITE tokens between agent nodes, 
with 3 active agent zones glowing with real-time transaction activity, 
cyberpunk megastructure, neon pink and cyan holographic interfaces..."
```

## 🔧 How It Works

### Architecture Flow

```
Agent Transactions (X402) 
    ↓
Autonomous Agent Mode triggers payment
    ↓
Transaction API (/api/agent-transactions)
    ↓
3D Page polls every 5 seconds
    ↓
Detects new transactions → Sets shouldRemix = true
    ↓
Triggers handleAutoGenerate(true) with remix
    ↓
Generates prompt from:
  - Agent tech stacks (TEE, FHE, X402, 0G)
  - Recent transaction purposes
  - Active agent zones
    ↓
Calls Skybox API with remix_imagine_id
    ↓
Environment evolves to reflect new activity
    ↓
User sees live changes in 360° viewer
```

### State Management

```typescript
// Key state variables:
const [currentSkyboxId, setCurrentSkyboxId] = useState<string | null>(null);
const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
const [activeAgentZones, setActiveAgentZones] = useState<Map<string, string>>(new Map());
const [transactionCount, setTransactionCount] = useState(0);
const [shouldRemix, setShouldRemix] = useState(false);
```

### Transaction Detection Logic

```typescript
// In fetchAgentStatus():
const newTxCount = txData.transactions.length;

if (newTxCount > transactionCount && transactionCount > 0) {
  console.log('🔄 New transactions detected');
  setShouldRemix(true); // Trigger remix
}

// Update active zones from recent transactions:
const zones = new Map<string, string>();
txData.transactions.slice(0, 5).forEach((tx: any) => {
  if (tx.status === 'confirmed' || tx.status === 'processing') {
    zones.set(tx.fromAgentId, tx.purpose);
    zones.set(tx.toAgentId, tx.purpose);
  }
});
setActiveAgentZones(zones);
```

## 🎨 Visual Design Philosophy

### Cyberpunk AI Aesthetic
- **Neon Pink & Cyan**: Primary accent colors for holographic interfaces
- **Volumetric Lighting**: Creates depth and atmosphere
- **Floating Data Streams**: Visual representation of transactions
- **Megastructure Architecture**: Conveys scale and interconnection

### Zone-Based Layout
Each agent capability gets a distinct visual area:
- Agents can "see" their zone when active
- Zones glow brighter during transactions
- Visual cohesion maintained through consistent color palette

## 🚀 Usage Guide

### For Developers

1. **Start the system:**
```bash
cd frontend
npm run dev
```

2. **Navigate to 3D page:**
```
http://localhost:3000/3d
```

3. **Enable Autonomous Mode** on any agent page:
```
/demo/agent/02
```

4. **Watch the magic:**
- Autonomous mode triggers X402 transactions every 15 seconds
- 3D environment detects transactions within 5 seconds
- Environment remixes automatically to reflect new activity
- Recent transactions panel updates in real-time

### For Presentations

**Demo Flow:**
1. Open `/3d` page → Show initial environment
2. Navigate to `/demo/agent/02` → Enable Autonomous Mode
3. Return to `/3d` page → Watch environment remix as transactions occur
4. Point out:
   - Recent Transactions panel updating
   - Active Agent Zones indicators
   - Environment remixing notification
   - Live agent activity feed

## 🔑 Environment Variables

```env
# Required for Skybox AI generation
NEXT_PUBLIC_BLOCKADE_API_KEY=your_api_key_here

# Backend API for agent data
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Get Skybox API Key:** https://www.blockadelabs.com/

**Fallback Mode:** If API key invalid, system uses demo environments automatically.

## 📊 Agent Capabilities → Environment Mapping

| Agent | Tech Stack | Visual Representation |
|-------|-----------|----------------------|
| **01** Neural Core | Standard | Neural pathways, coordination center |
| **02** Quantum Mind | TEE + X402 | Isolation chambers + payment streams |
| **03** Cyber Vision | FHE Compute | Encrypted matrices in crystals |
| **04** Data Nexus | TEE + 0G Chain | Storage nodes + verification shields |
| **05** Synapse AI | Full Stack | Combined zones with all capabilities |

## 🎯 Transaction Scenarios & Visual Impact

Each transaction type influences the environment generation:

| Transaction Purpose | Visual Effect |
|-------------------|---------------|
| **TEE Attestation Service** | Verification shields intensify |
| **FHE Model Inference** | Crystalline structures process data |
| **Data Storage on 0G Chain** | Storage nodes pulse with activity |
| **X402 Payment Gateway** | Token streams flow between zones |
| **Reputation Score Update** | Trust indicators glow |
| **Multi-party Computation** | Multiple zones synchronize |

## 🔄 Remix vs. Regenerate

### Remix (Automatic)
- **Triggered by:** New transactions
- **Uses:** `remix_imagine_id` parameter
- **Effect:** Environment evolves from current state
- **Visual:** Smooth transformation
- **Message:** "🔄 Detecting new transactions - remixing environment..."

### Regenerate (Manual)
- **Triggered by:** User clicks "Regenerate" button
- **Uses:** Fresh generation without remix
- **Effect:** Completely new environment
- **Visual:** Full replacement
- **Message:** "Initializing Skybox AI generation..."

## 🐛 Troubleshooting

### Issue: Environment not remixing
**Check:**
1. Are transactions actually occurring? (Check Recent Transactions panel)
2. Is Auto-Refresh enabled? (Toggle in UI)
3. Is Autonomous Mode running? (Navigate to /demo/agent/02)
4. Check console for "🔄 New transactions detected" log

### Issue: Skybox API 403 error
**Solution:** API key invalid → System automatically uses demo mode
- Get new key from https://www.blockadelabs.com/
- Update `NEXT_PUBLIC_BLOCKADE_API_KEY` in `.env.local`
- Restart dev server: `npm run dev`

### Issue: Demo mode instead of real environments
**Cause:** API key not configured or invalid
**Fix:** Add valid Blockade Labs API key to `.env.local`

## 🎨 Customization

### Adjust Remix Sensitivity
```typescript
// Change polling interval (currently 5 seconds):
setInterval(() => {
  fetchAgentStatus();
}, 5000); // <- Adjust this value
```

### Modify Environment Prompts
Edit `generatePromptFromAgents()` in `/frontend/src/app/3d/page.tsx`:
```typescript
if (hasTEE) {
  zones.push("YOUR CUSTOM TEE DESCRIPTION");
}
```

### Change Skybox Style
```typescript
skybox_style_id: 67, // M3 Photoreal (default)
// Other options: 42 (Advanced Fantasy), 53 (Anime Art), etc.
```

## 📈 Performance Optimization

- **Polling:** Every 5 seconds (configurable)
- **Auto-regenerate:** Every 120 seconds if no activity
- **Transaction limit:** Shows last 10 transactions
- **Agent zones:** Tracks up to 5 most active agents
- **Fallback:** Demo environments if API unavailable

## 🌐 Integration with X402 Payment System

The 3D environment is fully integrated with the X402 payment protocol:

1. **Autonomous Agent Mode** (`/components/ui/autonomous-agent-mode.tsx`)
   - Executes transactions every 15 seconds
   - Random agent-to-agent payments
   - 6 transaction scenarios

2. **Transaction API** (`/api/agent-transactions`)
   - Creates agent transactions
   - Tracks status (pending → processing → confirmed)
   - Stores HCS proofs

3. **3D Visualization** (`/app/3d/page.tsx`)
   - Polls transaction API
   - Detects new activity
   - Triggers environment remix
   - Shows live status

## 🎓 Best Practices

1. **For Bounties/Demos:**
   - Enable Autonomous Mode before showing 3D page
   - Wait 15-30 seconds for first remix to occur
   - Highlight the automatic remix notification

2. **For Development:**
   - Use demo mode initially (faster)
   - Add real Skybox key for final presentation
   - Test with different agent combinations

3. **For Production:**
   - Implement rate limiting on Skybox API calls
   - Cache generated environments
   - Add user controls for manual remix triggers

## 🔮 Future Enhancements

- [ ] Save environment history (timeline view)
- [ ] User-controlled camera positions in specific zones
- [ ] Real-time overlay text showing active transactions
- [ ] AR/VR support for immersive viewing
- [ ] Multi-environment comparison view
- [ ] Export/share generated environments
- [ ] Custom zone creation based on new agent types

## 📚 Related Files

- **Main Component:** `/frontend/src/app/3d/page.tsx`
- **Skybox Service:** `/frontend/src/lib/skybox.ts`
- **Transaction API:** `/frontend/src/app/api/agent-transactions/route.ts`
- **Agent Data:** `/frontend/src/app/api/agents/status/route.ts`
- **Autonomous Mode:** `/frontend/src/components/ui/autonomous-agent-mode.tsx`
- **360° Viewer:** `/frontend/src/components/ui/skybox-viewer-360.tsx`

---

**Built with:** Next.js 16, React 19, Framer Motion, Blockade Labs Skybox AI, X402 Payment Protocol
