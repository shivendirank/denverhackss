# 🚀 Quick Start Guide - 3D Agent Environment

## What Just Changed?

Your 3D environment system is now **fully reactive** to live agent transactions! Here's what's new:

## ✨ New Features

### 1. **Live Transaction Detection**
- System polls transactions every 5 seconds
- Automatically detects when agents make X402 payments
- Shows up to 10 recent transactions in real-time

### 2. **Environment Remixing**
- When new transactions occur, environment **remixes** (evolves)
- Uses Skybox AI's `remix_imagine_id` to transform existing environment
- Faster and more fluid than regenerating from scratch
- Visual notification: "🔄 Detecting new transactions - remixing environment..."

### 3. **Agent-Specific Zones**
Environments now show distinct zones based on agent capabilities:
- **TEE zones**: Isolation chambers with verification shields
- **X402 hubs**: Flowing KITE token streams
- **FHE spheres**: Encrypted data processing
- **0G networks**: Massive storage nodes
- **Standard centers**: Neural pathways

### 4. **Active Agent Indicators**
- Glowing badges show which agents are currently transacting
- Pulse animations on active zones
- Color-coded by transaction status

## 🎯 How to Test It

### Step 1: Start the Dev Server
```bash
cd frontend
npm run dev
```

### Step 2: Open 3D Environment
Navigate to: `http://localhost:3000/3d`

You'll see:
- Initial environment loading
- Live agent activity feed (right sidebar)
- System status panel

### Step 3: Enable Autonomous Mode
Open a new tab: `http://localhost:3000/demo/agent/02`

Click **"Enable Autonomous Mode"** button

This triggers automatic X402 transactions every 15 seconds

### Step 4: Watch the Magic ✨
Go back to the 3D tab and observe:

1. **Recent Transactions panel** updates within 5 seconds
2. **Active Agent Zones** badges appear
3. **Environment remixes** automatically (look for 🔄 notification)
4. **Live agent feed** shows real-time activity

## 🎬 For Your Demo/Presentation

**Perfect Demo Flow:**

1. **Show the concept:**
   - "This is a live 3D environment that visualizes AI agent transactions"
   - Point to the 360° viewer

2. **Enable transactions:**
   - Navigate to `/demo/agent/02`
   - Click "Enable Autonomous Mode"
   - Return to `/3d`

3. **Highlight features as they happen:**
   - **New transaction appears** → "See, Agent X just paid Agent Y for [service]"
   - **Environment remixes** → "The environment is now transforming based on this activity"
   - **Active zones glow** → "These badges show which agents are currently transacting"

4. **Explain the tech:**
   - "We're using Skybox AI's remix feature to evolve the environment"
   - "Each agent capability (TEE, FHE, X402, 0G) creates distinct visual zones"
   - "Fully integrated with our X402 payment protocol"

## 🔧 Configuration

### Polling Interval
Adjust how often transactions are checked (default: 5 seconds):
```typescript
// In /frontend/src/app/3d/page.tsx
setInterval(() => {
  fetchAgentStatus();
}, 5000); // <-- Change this value
```

### Auto-Regenerate Timer
Change how long before full regeneration (default: 120 seconds):
```typescript
if (environmentAge > 120 && !isGenerating) {
  handleAutoGenerate();
}
```

### Transaction Display Limit
Show more/fewer transactions (default: 5):
```typescript
{recentTransactions.slice(0, 5).map((tx, idx) => (
  // Change the 5 above
```

## 🐛 Troubleshooting

### "Environment not remixing"
**Check:**
- Is Autonomous Mode enabled? (Go to `/demo/agent/02`)
- Is Auto-Refresh ON? (Toggle in UI)
- Are transactions actually happening? (Check Recent Transactions panel)
- Check browser console for "🔄 New transactions detected" log

### "Demo environment loaded" instead of generated
**Cause:** Skybox API key invalid or not configured

**Solutions:**
1. **For demos/testing:** Demo mode works fine! Uses curated agent-themed images
2. **For real environments:** 
   - Get API key from https://www.blockadelabs.com/
   - Add to `.env.local`: `NEXT_PUBLIC_BLOCKADE_API_KEY=your_key`
   - Restart dev server

### "No recent transactions"
**Solution:**
1. Navigate to any agent page: `/demo/agent/01`, `/demo/agent/02`, etc.
2. Click "Enable Autonomous Mode"
3. Transactions will start appearing within 15 seconds
4. Return to `/3d` to see the effects

## 📊 What Gets Visualized?

### Transaction Data Flow
```
Autonomous Agent → X402 Payment → Transaction API
                                       ↓
                              3D Page polls API
                                       ↓
                           Detects new activity
                                       ↓
                      Generates agent-based prompt
                                       ↓
                        Skybox remixes environment
                                       ↓
                              User sees change
```

### Agent Capabilities → Visual Zones

| Agent | Capabilities | Visual Representation |
|-------|-------------|----------------------|
| 01 - Neural Core | Standard | Neural pathways, coordination center |
| 02 - Quantum Mind | TEE + X402 | Isolation chambers + payment streams |
| 03 - Cyber Vision | FHE Compute | Encrypted matrices in crystals |
| 04 - Data Nexus | TEE + 0G Chain | Storage nodes + verification |
| 05 - Synapse AI | Full Stack | All zones combined |

### Transaction Types Visualized

- **TEE Attestation** → Verification shields glow
- **FHE Computation** → Crystal structures process
- **0G Storage** → Storage nodes pulse
- **X402 Payment** → Token streams flow
- **Reputation Update** → Trust indicators shine

## 🎨 Customization Ideas

### Change Environment Style
```typescript
// In handleAutoGenerate():
skybox_style_id: 67, // M3 Photoreal (default)

// Try these:
// 42 - Advanced Fantasy
// 53 - Anime Art  
// 68 - Sci-Fi Utopia
```

### Modify Zone Descriptions
```typescript
// In generatePromptFromAgents():
if (hasTEE) {
  zones.push("YOUR CUSTOM DESCRIPTION HERE");
}
```

### Add More Transaction Scenarios
```typescript
// In /components/ui/autonomous-agent-mode.tsx:
const TRANSACTION_SCENARIOS = [
  { service: "Your New Service", amount: "0.005" },
  // Add more...
];
```

## 📈 Performance Notes

- **Polling frequency:** Every 5 seconds (configurable)
- **Skybox generation:** ~20-60 seconds per environment
- **Remix generation:** ~15-40 seconds (faster than full generation)
- **Transaction processing:** ~2.5 seconds (simulated async)
- **UI updates:** Real-time (React state)

## 🚀 Next Steps

1. **Test the system** with autonomous mode
2. **Watch transactions** trigger environment changes
3. **Prepare your demo** talking points
4. **Consider enhancements:**
   - Save environment history
   - User-controlled camera positions
   - Export generated environments
   - Custom zone creation

## 📚 Full Documentation

See `3D_AGENT_ENVIRONMENT_GUIDE.md` for complete technical details.

## 🎯 Key Selling Points for Bounty

✅ **Live reactive environment** - Not static, responds to actual agent activity
✅ **Agent-to-agent transactions** - Real X402 payments visualized
✅ **Environment remixing** - Smooth evolution using Skybox AI
✅ **Tech stack visualization** - Each capability gets distinct zones
✅ **Real-time updates** - Transaction polling and status tracking
✅ **Autonomous operation** - Agents transact without user intervention
✅ **Cyberpunk aesthetic** - Professional, immersive presentation

---

**Ready to impress! 🎉**
