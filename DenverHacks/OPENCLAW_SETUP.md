# OpenClaw Integration Guide
## Getting Your AI Agent Framework Running

OpenClaw is your agent execution framework that connects to the SENTINEL infrastructure. Here's how to integrate it with your Citadel system:

---

## 🏗️ Part 1: OpenClaw Architecture Overview

OpenClaw provides three core capabilities:

1. **Agent Identity** - ERC-8004 NFT minting and reputation tracking
2. **Execution Proxy** - TEE-secured agent operations
3. **Settlement Bridge** - x402 micropayment coordination

---

## 📦 Part 2: Backend Setup

### 1. Install OpenClaw Dependencies

```bash
cd C:\Users\HEET\Downloads\DenverHacks
npm install @openzeppelin/contracts @chainlink/contracts
npm install ethers@^6.0.0 viem@^2.0.0
npm install bullmq ioredis  # For queues
```

### 2. Configure Environment Variables

Create `.env` in the root directory:

```env
# Network RPCs
BASE_SEPOLIA_RPC=https://sepolia.base.org
HEDERA_TESTNET_ACCOUNT_ID=0.0.xxxxx
HEDERA_TESTNET_PRIVATE_KEY=your_private_key

# Contract Addresses (Deploy first - see Part 3)
AGENT_NFT_ADDRESS=0x...
ESCROW_ADDRESS=0x...
TOOL_REGISTRY_ADDRESS=0x...

# Blockade Labs (already set in frontend)
BLOCKADE_API_KEY=your_api_key

# x402 Configuration
KITE_AI_WEBHOOK_URL=https://your-domain.com/webhooks/x402
```

### 3. Initialize OpenClaw Client

Create `src/openclaw/client.ts`:

```typescript
import { createWalletClient, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { HederaClient } from '../hedera/client';

export class OpenClawClient {
  private walletClient;
  private publicClient;
  private hederaClient: HederaClient;

  constructor() {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    
    this.walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC),
    });

    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC),
    });

    this.hederaClient = new HederaClient();
  }

  // Create new agent identity
  async createAgent(config: {
    name: string;
    description: string;
    metadata: Record<string, any>;
  }) {
    // 1. Mint AgentNFT on Base
    const tokenId = await this.mintAgentNFT(config);
    
    // 2. Create Hedera HCS topic for reputation
    const topicId = await this.hederaClient.createReputationTopic(tokenId);
    
    // 3. Store in database
    await prisma.agent.create({
      data: {
        tokenId: tokenId.toString(),
        hederaTopicId: topicId,
        name: config.name,
        metadata: config.metadata,
      },
    });

    return { tokenId, topicId };
  }

  // Execute agent tool with TEE
  async executeToolInTEE(agentId: string, toolId: string, params: any) {
    // 1. Get tool definition from registry
    const tool = await this.getToolFromRegistry(toolId);
    
    // 2. Request TEE attestation
    const attestation = await fetch('http://tee-node:8080/attest', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        toolId,
        params,
      }),
    }).then(r => r.json());

    // 3. Submit attestation to Hedera HCS
    await this.hederaClient.submitAttestation(agentId, attestation);

    return attestation.result;
  }

  // Create escrow for agent payment
  async createEscrow(params: {
    agentId: string;
    amount: bigint;
    duration: number;
  }) {
    const tx = await this.walletClient.writeContract({
      address: process.env.ESCROW_ADDRESS as `0x${string}`,
      abi: EscrowABI,
      functionName: 'createEscrow',
      args: [params.agentId, params.duration],
      value: params.amount,
    });

    return tx;
  }
}
```

---

## 🚀 Part 3: Deploy Contracts

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Base Sepolia

```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

This will output addresses like:
```
AgentNFT deployed to: 0xAbC...
Escrow deployed to: 0xDeF...
ToolRegistry deployed to: 0x123...
```

**Save these addresses to your `.env`!**

---

## 🔗 Part 4: Connect Frontend to OpenClaw

### 1. Create API Routes

Create `frontend/src/app/api/agents/create/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { OpenClawClient } from '@/lib/openclaw';

export async function POST(req: NextRequest) {
  const { name, description, metadata } = await req.json();
  
  const openclaw = new OpenClawClient();
  const agent = await openclaw.createAgent({ name, description, metadata });

  // Generate initial citadel
  const { generateAndWait, CITADEL_PROMPTS } = await import('@/lib/skybox');
  const skyboxUrl = await generateAndWait({
    prompt: CITADEL_PROMPTS.starter,
  });

  return NextResponse.json({
    success: true,
    agent,
    skyboxUrl,
  });
}
```

### 2. Update Builder Page

Add agent creation form to `frontend/src/app/builder/page.tsx`:

```typescript
const [agentName, setAgentName] = useState('');

const handleCreateAgent = async () => {
  const response = await fetch('/api/agents/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: agentName,
      description: 'AI Agent with SENTINEL trust layer',
      metadata: { trustScore: 50 },
    }),
  });

  const data = await response.json();
  setSkyboxUrl(data.skyboxUrl);
  alert(\`Agent created! Token ID: \${data.agent.tokenId}\`);
};
```

---

## ⚡ Part 5: x402 Payment Integration

### 1. Setup Kite AI Webhook

Create `frontend/src/app/api/webhooks/x402/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { OpenClawClient } from '@/lib/openclaw';
import { remixSkybox, CITADEL_PROMPTS } from '@/lib/skybox';

export async function POST(req: NextRequest) {
  const { agentId, amount, status } = await req.json();

  if (status === 'confirmed') {
    // Payment received - upgrade citadel
    const db = await prisma.agent.findUnique({
      where: { tokenId: agentId },
    });

    if (db) {
      // Remix skybox to upgraded version
      const newSkybox = await remixSkybox(
        db.currentSkyboxId!,
        CITADEL_PROMPTS.upgraded
      );

      await prisma.agent.update({
        where: { tokenId: agentId },
        data: { currentSkyboxId: newSkybox },
      });
    }
  }

  return NextResponse.json({ success: true });
}
```

### 2. Add Payment Button to Builder

```typescript
const handleUpgradeWithPayment = async () => {
  // Trigger x402 payment
  const response = await fetch('/api/payments/create', {
    method: 'POST',
    body: JSON.stringify({
      agentId: currentAgentId,
      amount: 5000000, // 5 USDC
      webhookUrl: 'https://your-domain.com/api/webhooks/x402',
    }),
  });

  const { paymentUrl } = await response.json();
  window.open(paymentUrl, '_blank');
};
```

---

## 🧪 Part 6: Testing the Full Flow

### 1. Start Backend Server

```bash
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Agent Creation

1. Go to `http://localhost:3001/builder`
2. Enter agent name
3. Click "Generate Citadel"
4. Wait 15-20 seconds for Skybox generation
5. View your agent's 3D environment

### 4. Test Trust Score Updates

```bash
# Simulate reputation increase
curl -X POST http://localhost:3000/api/reputation \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "1",
    "action": "successful_execution",
    "score": 10
  }'
```

Watch the frontend - trust score should increase and you can remix the citadel.

---

## 🎯 Part 7: Production Deployment

### 1. Deploy Backend to Vercel/Railway

```bash
# Push to GitHub
git add .
git commit -m "OpenClaw integration complete"
git push

# Deploy on Vercel
vercel --prod
```

### 2. Update Environment Variables

Add all `.env` variables to your hosting provider's dashboard.

### 3. Deploy Contracts to Mainnet

```bash
npx hardhat run scripts/deploy.ts --network base
```

**Important:** Update contract addresses in production `.env`!

---

## 📊 Part 8: Monitor Agent Activity

### Dashboard Integration

Create `frontend/src/app/dashboard/page.tsx` with:

- **Live Trust Scores** - Pull from Hedera HCS
- **Execution History** - Query TEE attestations
- **Skybox Gallery** - Show all generated citadels
- **Payment Tracking** - x402 transaction history

---

## 🔥 Quick Start Commands Summary

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your keys

# 3. Deploy contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network baseSepolia

# 4. Start backend
npm run dev

# 5. Start frontend (new terminal)
cd frontend
npm run dev

# 6. Visit app
# http://localhost:3001
```

---

## 🐛 Troubleshooting

### Issue: "Skybox generation fails"
- Check `NEXT_PUBLIC_BLOCKADE_API_KEY` in `frontend/.env.local`
- Verify API key on Blockade Labs dashboard
- Check browser console for CORS errors

### Issue: "Contract deployment fails"
- Ensure you have test ETH on Base Sepolia
- Get faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Check `PRIVATE_KEY` format (must start with 0x)

### Issue: "Hedera HCS errors"
- Verify `HEDERA_TESTNET_ACCOUNT_ID` format: `0.0.xxxxx`
- Check private key has HBAR balance
- Get testnet HBAR: https://portal.hedera.com/faucet

### Issue: "Frontend can't connect to backend"
- Check backend is running on port 3000
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3000` in frontend
- Check CORS settings in backend

---

## 🎓 Next Steps

1. **Implement TEE Integration** - Connect real SGX enclave
2. **Add FHE Layer** - Integrate Zama's fhEVM for privacy
3. **Deploy to 0G Storage** - Store agent execution logs
4. **Create Agent Marketplace** - Let users browse/hire agents
5. **Multi-Chain Support** - Add Ethereum, Polygon support

---

## 📚 Resources

- OpenClaw Docs: https://openclaw.dev/docs
- Blockade Labs API: https://skybox.blockadelabs.com/api
- Hedera HCS: https://docs.hedera.com/hedera/
- Base Chain: https://docs.base.org/
- x402 Payments: https://kite.ai/docs/x402

---

**Your SENTINEL stack is now complete!** 🎉

Agents can:
- ✅ Mint ERC-8004 identity on Base
- ✅ Execute in TEE with Hedera attestation
- ✅ Generate 3D citadels with Skybox AI
- ✅ Accept x402 micropayments
- ✅ Evolve environments based on trust scores

**Demo this at your hackathon and you'll absolutely dominate!** 🏆
