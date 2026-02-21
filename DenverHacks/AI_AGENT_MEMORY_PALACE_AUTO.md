# AI Agent Memory Palace - Auto-Generation System

## Overview

The new `/3d` route features an **auto-generating 360° Memory Palace** that monitors real AI agent activity and dynamically generates Skybox environments based on what your agents are doing in real-time.

## Key Features

### 🤖 Real-Time Agent Monitoring
- Polls `/api/agents/status` every 5 seconds
- Displays live agent activity, metrics, and last actions
- Shows system-wide metrics (transactions, trust score, network latency)

### 🎨 Auto-Generation Based on Agent Activity
- **No preset templates** - environments generate from real agent behavior
- Analyzes agent activities to create dynamic prompts
- Auto-regenerates every 2 minutes when agents are active
- Converts agent operations into visual elements:
  - **Payments** → Glowing payment streams
  - **Encryption** → Holographic security layers
  - **Storage** → Distributed data flows
  - **Computation** → Quantum processing cores
  - **Proofs** → Geometric verification patterns

### 🌐 Enhanced UX
- Clean, aesthetic glassmorphism design
- Smooth animations with Framer Motion
- Real-time progress indicators
- Interactive 360° viewer with drag/zoom
- Auto-refresh toggle for manual control

## Architecture

```
Landing Page (/)
    ↓ Click "Trust Visualization" 3D folder
   /3d
    ↓ Auto-fetches on mount
/api/agents/status
    ↓ Returns agent data
Generate Skybox Prompt
    ↓ Based on activities
Blockade Labs Skybox AI
    ↓ Renders 360° environment
360° Viewer Display
    ↓ Auto-refresh every 5s
Continuous Updates
```

## Files Changed

### Created Files
- `frontend/src/app/3d/page.tsx` - New auto-generating memory palace
- `frontend/src/app/api/agents/status/route.ts` - Agent monitoring endpoint

### Modified Files
- `frontend/src/components/sections/explore-section.tsx` - Route: `/tee/3d` → `/3d`
- `frontend/src/lib/skybox.ts` - Enhanced error handling with detailed logging

## Backend Integration

### Current Status (Mock Data)
The `/api/agents/status` endpoint currently returns **mock data** for demonstration. 

### How to Connect Your Real Backend

Edit `frontend/src/app/api/agents/status/route.ts`:

```typescript
export async function GET() {
  try {
    // Connect to your actual backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/agents/status`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Agent status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    );
  }
}
```

### Expected Backend Response Format

Your backend at `http://localhost:3000/agents/status` should return:

```json
{
  "agents": [
    {
      "id": "01",
      "name": "Neural Core",
      "role": "TEE + FHE + 0G Storage",
      "status": "active",
      "currentActivity": "Processing encrypted transaction batch",
      "metrics": {
        "transactionsProcessed": 1247,
        "storageUsed": "2.4 GB",
        "cpuUsage": 45,
        "memoryUsage": 62
      },
      "lastAction": {
        "type": "storage_write",
        "timestamp": 1708478234000,
        "description": "Stored encrypted data to 0G Chain"
      }
    }
  ],
  "systemMetrics": {
    "totalAgents": 5,
    "activeAgents": 5,
    "totalTransactions": 4523,
    "averageTrustScore": 94.2,
    "networkLatency": "34ms"
  },
  "timestamp": 1708478234000
}
```

## Prompt Generation Logic

The system analyzes agent activities and generates prompts dynamically:

```typescript
// Example prompt generation
const activities = agents.map(a => a.currentActivity);

if (hasPayments) → "glowing payment streams flowing through crystalline channels"
if (hasEncryption) → "encrypted data matrices with holographic security layers"
if (hasStorage) → "massive distributed storage nodes with pulsing data flows"
if (hasCompute) → "quantum computing cores processing complex calculations"
if (hasProof) → "zero-knowledge proof verification systems with geometric patterns"
```

**Result**: Each environment is unique based on what your agents are actually doing!

## Usage

### 1. Navigate to Memory Palace
- Go to `http://localhost:3001`
- Scroll to "Explore Trust Components"
- Click the 3D folder "Trust Visualization"
- You'll be taken to `/3d`

### 2. Auto-Generation Flow
1. Page loads → Fetches agent status from API
2. Analyzes agent activities
3. Generates custom Skybox prompt
4. Calls Blockade Labs API
5. Displays 360° environment
6. Polls every 5s for updates
7. Auto-regenerates every 2 minutes

### 3. Manual Controls
- **Regenerate Environment** - Force immediate regeneration
- **Auto-Refresh Toggle** - Turn off polling if needed

## Environment Variables

Ensure these are set in `frontend/.env.local`:

```env
NEXT_PUBLIC_BLOCKADE_API_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Blockade Labs API

- **Endpoint**: `https://backend.blockadelabs.com/api/v1/skybox`
- **Style**: M3 Photoreal (ID: 67) - 2026 flagship model
- **Features**: 
  - Prompt enhancement
  - 360° equirectangular panoramas
  - High-resolution outputs (4K+)

Get your API key: https://skybox.blockadelabs.com/plans
Use promo code: **ETHDEN26** (if available)

## Troubleshooting

### Skybox API Error
If you see "Skybox API error" in console:

1. **Check API key**: Verify `NEXT_PUBLIC_BLOCKADE_API_KEY` in `.env.local`
2. **Check credits**: Ensure your Blockade Labs account has credits
3. **Check logs**: Look in browser console for detailed error messages
4. **Test API**: Try the API directly with curl:

```bash
curl -X POST https://backend.blockadelabs.com/api/v1/skybox \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test environment", "skybox_style_id": 67}'
```

### Agent Status Not Loading
1. **Check backend**: Ensure your backend at `http://localhost:3000` is running
2. **Check CORS**: Backend must allow requests from `http://localhost:3001`
3. **Check response format**: Verify it matches the expected JSON structure

### 360° Viewer Not Working
1. **Check Three.js**: Ensure `@react-three/fiber` and `@react-three/drei` are installed
2. **Check image URL**: Verify the Skybox URL is valid and accessible
3. **Check WebGL**: Ensure your browser supports WebGL

## Next Steps

1. **Connect Real Backend**: Replace mock data with actual agent monitoring
2. **Enhance Prompts**: Add more sophisticated activity-to-visual mappings
3. **Add Waypoints**: Implement spatial memory markers for agent actions
4. **Multi-Environment**: Support multiple concurrent agent environments
5. **Historical View**: Show past environment versions and agent history

## Performance

- **Initial Load**: ~2-3 seconds (fetch + generate)
- **Polling Interval**: 5 seconds
- **Auto-Regeneration**: Every 2 minutes (when active)
- **Generation Time**: ~15-30 seconds per environment (Blockade Labs)

## Customization

### Change Polling Interval

Edit `frontend/src/app/3d/page.tsx`:

```typescript
const interval = setInterval(() => {
  fetchAgentStatus();
}, 5000); // Change to desired milliseconds
```

### Change Auto-Regeneration Timer

```typescript
if (environmentAge > 120 && !isGenerating) { // 120 seconds = 2 minutes
  handleAutoGenerate();
}
```

### Customize Prompt Generation

Edit the `generatePromptFromAgents` function to add your own activity mappings.

---

**Built for DenverHacks 2026**  
**Blockade Labs Skybox AI Integration**  
**Real-Time AI Agent Visualization**
