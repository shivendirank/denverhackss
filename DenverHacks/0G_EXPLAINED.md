# 0G Chain Integration: Verifiable On-Chain Agent Identity

## 🎯 What is 0G Chain?

**0G (Zero Gravity)** is a high-performance blockchain network specifically designed for data-intensive and AI applications. For our AI Agent Dashboard, 0G provides the **on-chain identity layer** that makes our agents trustworthy and verifiable.

### Why 0G?

1. **High throughput**: Can handle frequent agent actions without congestion
2. **Low costs**: Minimal gas fees for NFT operations
3. **Data availability**: Optimized for storing agent metadata and action logs
4. **AI-focused**: Built specifically for decentralized AI applications

---

## 🏗️ What is an iNFT (Intelligent NFT)?

An **iNFT** is more than a regular NFT - it's a **verifiable on-chain identity** for an autonomous AI agent.

### Traditional NFT vs iNFT

| Traditional NFT | iNFT (0G) |
|----------------|-----------|
| Static metadata (image, name) | Dynamic metadata (reputation, actions) |
| Collectible/art | Agent identity |
| No state changes | State updates on-chain |
| Not composable | Query permissions & capabilities |

### What Our iNFT Contains

Each agent gets a unique iNFT with:

```solidity
struct AgentProfile {
    string name;              // "Market Analyzer"
    string specialization;    // "finance", "code", "data"
    address agentWallet;      // Agent's wallet address
    bool hasTEE;             // Citadel TEE attestation
    uint256 createdAt;       // When agent was created
    bool active;             // Is agent operational
}

struct AgentCapabilities {
    string[] allowedTools;        // Which tools agent can use
    uint256 dailySpendLimitWei;   // Spending limit per day
    uint256 rateLimitPerMinute;   // Max actions per minute
    bool requiresApproval;        // Manual approval for actions
}
```

---

## 🔄 How Does It Work?

### 1. Agent Creation Flow

```
User creates agent → Backend mints iNFT on 0G → NFT links to agent wallet
```

**Code:**
```typescript
// Backend: src/services/zg-identity.ts
const result = await mintAgentNFT(agent);
// Returns: { tokenId, txHash, explorerUrl }
```

**What happens on-chain:**
- New ERC-721 NFT is minted
- Agent profile is stored on 0G Chain
- Wallet → Token ID mapping is created
- `AgentMinted` event is emitted

### 2. Action Logging Flow

```
Agent executes tool → Backend records action on 0G → Action appears in history
```

**Code:**
```typescript
// After tool execution
await recordAgentAction(
  agent.wallet,
  "TOOL_EXECUTION",
  {
    toolId: "weather_api",
    executionId: "exec-123",
    costWei: "1000000000000000"
  }
);
```

**What happens on-chain:**
- Action hash is computed (keccak256)
- Action is logged in contract storage
- Timestamp and type are recorded
- `ActionRecorded` event is emitted

### 3. Reputation Updates

```
Agent completes executions → Reputation increases → Score updates on-chain
```

**Code:**
```typescript
// Periodic reputation sync
await updateAgentReputation(
  agent.wallet,
  newScore,      // 100 → 150
  totalExecutions // 50 executions
);
```

**What happens on-chain:**
- Reputation score is updated
- Execution count is synced
- `ReputationUpdated` event is emitted

---

## 🧱 Smart Contract Architecture

### AgentINFT.sol (Enhanced ERC-7857)

Our contract extends standard ERC-721 with agent-specific features:

```solidity
// Main functions:

mintAgent(address to, address wallet, string name, ...)
→ Creates new agent identity

recordAgentAction(uint256 tokenId, string actionType, bytes32 hash)
→ Logs action on-chain (called by backend relayer)

canUseTools(uint256 tokenId, string toolId)
→ Query if agent can use specific tool (composability)

getAgentActions(uint256 tokenId)
→ Returns full action history

updateReputation(uint256 tokenId, uint256 score, uint256 executions)
→ Syncs reputation with execution count
```

### Key Features

**✅ One NFT per Wallet**
- `walletToTokenId` mapping prevents duplicates
- Each agent has unique identity

**✅ Action History**
- All tool executions logged on-chain
- Cryptographic proof via action hash
- Timestamps for audit trail

**✅ Composability**
- Other contracts can query `canUseTools()`
- Permission system for inter-agent tools
- Reputation-based access control

**✅ Upgradeable Metadata**
- Reputation updates dynamically
- Action count auto-increments
- Profile changes reflected on-chain

---

## 🌐 Multi-Chain Architecture

Our system uses **multiple chains** for specialized purposes:

```
┌─────────────────────────────────────────────────────────┐
│                  AI Agent Dashboard                      │
└─────────────────────────────────────────────────────────┘
                          |
        ┌─────────────────┼─────────────────┐
        |                 |                  |
     0G Chain         Kite AI           Hedera
    (Identity)       (Payments)      (Attestations)
        |                 |                  |
   Agent iNFTs      x402 Protocol      HCS Topics
   Reputation       Tool Payments      DID Registry
   Action Logs      Escrow System      Verification
```

### Why Multi-Chain?

| Chain | Purpose | Why This Chain? |
|-------|---------|----------------|
| **0G** | Identity & History | AI-optimized, high throughput, data availability |
| **Kite AI** | Payments | x402 protocol, usage-based billing, tool marketplace |
| **Hedera** | Attestations | HCS for communication, DID for verification |

---

## 📊 Frontend Integration

### Component: Agent NFT Card

**Location:** `frontend/src/components/ui/agent-zerog-nft-card.tsx`

Shows individual agent's iNFT data:

```tsx
<AgentZeroGNFTCard agentId="agent-01" />
```

**Displays:**
- Token ID
- Reputation score (color-coded)
- Action count
- Link to 0G Explorer

### Component: Action Feed

**Location:** `frontend/src/components/ui/zerog-action-feed.tsx`

Shows chronological action history:

```tsx
<ZeroGActionFeed actions={agentActions} />
```

**Displays:**
- Action type (TOOL_EXECUTION, PAYMENT, UPDATE)
- Timestamp (relative: "2h ago")
- Approval status
- Transaction links

### Component: Dashboard Overview

**Location:** `frontend/src/components/ui/zerog-dashboard-overview.tsx`

Shows system-wide 0G status:

```tsx
<ZeroGDashboardOverview />
```

**Displays:**
- Total agents / Minted NFTs / Pending
- Minting progress bar
- List of all agents with NFT status
- Per-agent reputation & action count

---

## 🔐 Security & Trust

### How Users Can Verify Agents

1. **View on 0G Explorer**
   - Every NFT has public explorer link
   - See all actions and reputation on-chain
   - Verify authenticity independently

2. **Query Smart Contract**
   ```typescript
   // Anyone can call:
   const canUse = await contract.canUseTools(tokenId, "sensitive_api");
   const reputation = await contract.agentReputation(tokenId);
   const actions = await contract.getAgentActions(tokenId);
   ```

3. **Verify Action Hashes**
   - Each action has cryptographic hash
   - Backend can prove action data matches hash
   - Tamper-proof audit trail

### Permission System

Agents can be restricted via on-chain capabilities:

```solidity
// Example: Restrict agent to specific tools
AgentCapabilities {
    allowedTools: ["weather_api", "news_api"],    // Only these tools
    dailySpendLimitWei: 0.1 ether,                // Max 0.1 tokens/day
    rateLimitPerMinute: 10,                       // Max 10 calls/min
    requiresApproval: true                         // Manual approval needed
}
```

**Who can update?**
- Owner (deployer) can update capabilities
- Relayer can log actions after execution
- Agent itself cannot modify its NFT

---

## 💡 Real-World Use Cases

### 1. Trustless Agent Marketplace

**Problem:** User wants to hire an agent but doesn't know if it's reliable.

**Solution:** Check agent's iNFT on 0G:
- View reputation score (earned from successful executions)
- See action history (what has it done?)
- Query capabilities (what can it do?)

### 2. Agent-to-Agent Tool Calls

**Problem:** Agent A wants to use Agent B's proprietary tool.

**Solution:** Agent B's tool checks 0G:
```solidity
// Tool contract checks:
bool canUse = AgentNFT.canUseTools(agentATokenId, "agent_b_tool");
require(canUse, "Not authorized");
```

### 3. Regulatory Compliance

**Problem:** Need audit trail for AI agent actions.

**Solution:** Query 0G Chain for complete history:
- When did agent execute?
- What tools were used?
- What was the cost?
- All timestamped and immutable

### 4. Reputation-Based Pricing

**Problem:** Good agents should get discounts, bad agents should pay more.

**Solution:** Tool pricing based on reputation:
```solidity
uint256 basePrice = 1000;
uint256 reputation = AgentNFT.agentReputation(tokenId);

// Discount for high reputation
if (reputation >= 150) {
    price = basePrice * 80 / 100; // 20% off
}
```

---

## 🎮 Demo Flow for Judges

### Live Demo Steps

1. **Show Dashboard**
   - Point out 5 agents running
   - Display 0G Dashboard Overview showing minting status

2. **Trigger Agent Action**
   - Click "Execute Tool" on Market Analyzer
   - Tool runs (weather API call)

3. **Show On-Chain Verification**
   - Open agent NFT card
   - Show action count increased
   - Click "View on 0G Explorer"
   - Show transaction on explorer with action logged

4. **Query Composability**
   - Open browser console
   - Call `canUseTools(1, "weather_api")`
   - Show returns `true`

5. **Explain Value Prop**
   - "Real use case: agents need identity for trustless payments"
   - "Multi-chain strategy: 0G identity + Kite payments + Hedera attestations"
   - "Fully composable: other agents/contracts can query permissions"

---

## 📈 Bounty Alignment (0G $7K Prize)

### Required Features ✅

| Requirement | Our Implementation |
|------------|-------------------|
| **On-chain identity** | ✅ ERC-721 iNFT with AgentProfile struct |
| **Meaningful actions** | ✅ recordAgentAction() logs every tool execution |
| **Composability** | ✅ canUseTools() allows external queries |
| **Verifiable history** | ✅ getAgentActions() returns full timeline |

### Competitive Advantages

1. **Real Use Case**: Not just a demo - agents actually use payments and need identity
2. **Multi-Chain**: Shows understanding of chain specialization (0G identity, Kite payments)
3. **Production-Ready**: Error handling, degraded mode, retry logic
4. **Rich Metadata**: Not just basic NFT - includes capabilities, reputation, actions
5. **Extensible**: Easy to add new action types, capabilities, reputation rules

---

## 🔧 Technical Stack

### Backend

- **Language**: TypeScript + Node.js
- **Framework**: Express.js
- **Blockchain Library**: viem (modern alternative to ethers.js)
- **Smart Contract**: Solidity 0.8.24 with OpenZeppelin

**Key Files:**
```
src/
  services/
    zg-identity.ts       # Mint NFTs, record actions, query data
  blockchain/
    zg-client.ts         # 0G Chain client configuration
  routes/
    zg.ts                # API endpoints for 0G data
contracts/
  AgentINFT.sol          # Enhanced ERC-7857 iNFT contract
```

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Fetch API with polling (30s intervals)

**Key Files:**
```
frontend/src/components/ui/
  agent-zerog-nft-card.tsx       # Individual NFT display
  zerog-action-feed.tsx          # Action timeline
  zerog-dashboard-overview.tsx   # System-wide status
```

---

## 🚀 Deployment Guide

### Quick Deploy

```bash
# 1. Get 0G testnet tokens
Visit: https://faucet.0g.ai

# 2. Configure .env
RELAYER_PRIVATE_KEY=0xYourKey
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_CHAIN_ID=16600

# 3. Compile & deploy
npm run contracts:build
npm run 0g:deploy

# 4. Update .env with contract address (from output)
ZG_AGENT_NFT_CONTRACT=0xDeployedAddress

# 5. Restart backend
npm run dev

# 6. Mint NFTs for all agents
npm run 0g:mint-all
```

### Verify Deployment

1. Backend logs show: "✅ 0G Chain connected"
2. API endpoint works: `curl http://localhost:3000/api/zg/agents/status`
3. Frontend shows NFT cards with data
4. 0G Explorer shows contract: `https://explorer-testnet.0g.ai/address/0x...`

---

## 🎯 Key Takeaways

### For Judges

**What problem does this solve?**
- Autonomous agents need **verifiable identity** to operate in trustless environments
- Users need to **verify agent behavior** before trusting them with resources
- Agent-to-agent interactions need **permission systems** on-chain

**Why 0G specifically?**
- **High throughput**: Frequent agent actions don't congest network
- **AI-optimized**: Built for data-intensive AI applications
- **Low cost**: Affordable to log every agent action

**What makes this special?**
- **Real use case**: Not just NFT art - actual identity for payment-capable agents
- **Multi-chain architecture**: Leverages specialized chains for each purpose
- **Production-ready**: Error handling, fallbacks, comprehensive logging
- **Extensible**: Easy to add new features (new action types, DAO governance, etc.)

### For Developers

**How to extend this?**

1. **Add new action types**
   ```solidity
   // In AgentINFT.sol, recordAgentAction() accepts any actionType string
   recordAgentAction(tokenId, "DATA_QUERY", dataHash);
   ```

2. **Implement DAO governance**
   ```solidity
   // Community can vote on agent capabilities
   function voteToApprove(uint256 tokenId) external { ... }
   ```

3. **Cross-chain identity**
   ```typescript
   // Bridge agent identity to other chains
   await bridgeAgentToEthereum(tokenId);
   ```

4. **Reputation algorithms**
   ```solidity
   // Calculate reputation based on multiple factors
   reputation = baseScore + successRate * 100 - failureCount * 10;
   ```

---

## 📚 Additional Resources

- **0G Documentation**: https://docs.0g.ai
- **0G Faucet**: https://faucet.0g.ai
- **0G Explorer**: https://explorer-testnet.0g.ai
- **ERC-7857 Spec**: [iNFT standard proposal]
- **Kite AI x402**: [Payment protocol docs]
- **Our GitHub**: [Project repository]

---

## ❓ FAQ

**Q: Why not just store agent data in a database?**
A: Database can be tampered with. On-chain data is immutable and publicly verifiable.

**Q: Isn't logging every action expensive?**
A: 0G Chain is optimized for high throughput with low costs. Each action log costs ~0.0001 OG.

**Q: Can agents modify their own NFTs?**
A: No. Only the owner (deployer) and authorized relayer can update. Agents can't cheat reputation.

**Q: What if 0G Chain goes down?**
A: Backend has degraded mode - simulates NFTs in-memory so agents keep working.

**Q: How do I add my own agents?**
A: Call `POST /api/agents` to create agent, then `POST /api/zg/agents/:id/mint` to mint NFT.

**Q: Can I use this on 0G mainnet?**
A: Yes! Just change `ZG_RPC_URL` and `ZG_CHAIN_ID` in .env to mainnet values.

---

**Built for ETHDenver 2026** | **Powered by 0G Chain** | **Part of Multi-Chain AI Agent Trust Layer**
