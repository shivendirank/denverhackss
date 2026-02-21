# AI Agent Trust & Payment Layer

Production-grade backend for autonomous AI agent identity, reputation, and settlement infrastructure targeting ETHDenver 2026.

## Core Architecture

### Multi-Chain Design
- **Base Sepolia L2**: ToolRegistry, Escrow, settlement batching
- **Kite AI Chain**: x402 HTTP-native micropayment middleware
- **0G Chain**: ERC-7857 iNFT agent identity
- **Hedera Testnet**: HCS attestation topics, HTS payments, UCP agent discovery

### Key Components

1. **Tool Registry** - Converts OpenAPI 3.0 specs → on-chain callable tools stored on 0G
2. **Agent Identity** - ERC-7857 iNFT + Hedera account + HCS topic per agent
3. **Execution Proxy** - EIP-712 signed requests, optimistic execution, HCS attestations
4. **Settlement** - Batches 50 executions or waits 5 minutes, submits atomic on-chain
5. **Reputation Engine** - Calculates from HCS attestations, updates via 0G NFT
6. **x402 Middleware** - Exact header format for Kite AI judges
7. **Observer Dashboard** - Vanilla JS real-time agent activity stream

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 7+
- Environment file with contract addresses

### Installation

```bash
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Deploy contracts
npm run contracts:deploy:base
npm run contracts:deploy:kite
npm run contracts:deploy:zg

# Database setup
npm run db:push

# Development
npm run dev

# Production
npm run build
npm start
```

### Testing

```bash
npm run test
npm run test:coverage
```

## API Endpoints

### Tools
```
POST /api/tools
  Register new tool with OpenAPI spec
  Headers: X-Wallet (agent address)
  Body: { openApiSpec, endpointUrl, name, priceWei, authType, authConfig? }

GET /api/tools/:toolId
  Retrieve tool schema and metadata
```

### Agents
```
POST /api/agents
  Create new agent (on-chain identity + HCS topic + iNFT)
  Headers: X-Wallet
  Body: { name }

GET /api/agents/:agentId
  Get agent identity and reputation

GET /api/agents/wallet/:wallet
  Get agent by wallet address
```

### Escrow
```
GET /api/escrow/balance
  Get agent's escrow balance on all chains

POST /api/escrow/deposit
  Record deposit (actual funds sent to contract)

POST /api/escrow/withdraw
  Initiate withdrawal
```

### Reputation
```
GET /api/reputation/leaderboard?limit=100
  Get top agents by reputation

GET /api/reputation/:agentId
  Get detailed agent metrics
```

### Streaming
```
GET /api/stream
  Server-Sent Events - real-time execution, settlement, reputation updates
```

## x402 Payment Flow

### Insufficient Balance (HTTP 402)
```
GET /api/tools/execute HTTP/1.1
X-Payment-Chain: base

HTTP/1.1 402 Payment Required
WWW-Authenticate: x402 realm="AgentToolLayer", charset="UTF-8"

{
  "scheme": "x402",
  "network": "base",
  "asset": "ETH",
  "amount": "1000000000000000000",
  "payTo": "0x...",
  "memo": "tool-id",
  "expires": 1708123456789
}
```

### With Payment Proof
```
GET /api/tools/execute HTTP/1.1
X-Payment-Chain: base
X-Payment: <base64 encoded payment proof>

HTTP/1.1 200 OK
```

## Execution Flow

```
1. Agent signs EIP-712 request with (toolId, paramsHash, nonce)
2. POST /api/tools/execute with signature
3. x402 middleware checks balance → 402 if insufficient
4. executionProxy verifies signature, debits balance optimistically
5. Execute upstream HTTP call (30s timeout)
6. On success:
   - Insert PENDING execution record
   - Enqueue settlement batch job
   - Submit TOOL_EXECUTED(SUCCESS) to HCS (non-blocking)
   - Publish COMMERCE_COMPLETE to UCP if applicable (non-blocking)
   - Enqueue reputation update job
7. On failure:
   - Restore balance
   - Submit TOOL_EXECUTED(FAILED) to HCS
   - Insert FAILED execution record
```

## Settlement Batching

- **Trigger**: 50 PENDING executions OR every 5 minutes
- **Grouping**: By (agentWallet, toolOwnerWallet) pair
- **Action**: Atomic Escrow.debit() call per group on correct chain
- **Confirmation**: Update executions to SUCCESS with txHash
- **Attestation**: PAYMENT_SETTLED message to each agent's HCS topic (non-blocking)

## Reputation Scoring

```
Score = (successRate * 0.6) + (volumeNormalized * 0.2) + (consistencyScore * 0.2)

successRate = successful executions / total executions
volumeNormalized = min(totalVolumeWei / 100ETH, 1.0)
consistencyScore = min(executionsPerDay / 10, 1.0)

Final: 0-100 scale, updated every 5 minutes
```

## Environment Variables

```
# App
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/agentlayer
REDIS_URL=redis://localhost:6379

# Relayer (all EVM chains use same key)
RELAYER_PRIVATE_KEY=0x...

# Base Sepolia
BASE_RPC_URL=https://sepolia.base.org
BASE_CHAIN_ID=84532
BASE_TOOL_REGISTRY_CONTRACT=0x...
BASE_ESCROW_CONTRACT=0x...
BASE_USAGE_LOG_CONTRACT=0x...

# Kite AI Testnet
KITE_RPC_URL=https://...
KITE_CHAIN_ID=...
KITE_TOOL_REGISTRY_CONTRACT=0x...
KITE_ESCROW_CONTRACT=0x...

# 0G Testnet
ZG_RPC_URL=https://...
ZG_CHAIN_ID=...
ZG_AGENT_NFT_CONTRACT=0x...
ZG_STORAGE_API_URL=https://...

# Hedera
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=...
HEDERA_AGENT_TOKEN_ID=0.0.xxxxx
HEDERA_UCP_REGISTRY_TOPIC=0.0.xxxxx (optional)
```

## Observer Dashboard

Access at `GET /` - real-time visualization of:
- Base L2 settlement activity
- Hedera HCS attestations and UCP messages
- Live agent-to-agent transaction flow (REQUEST → ACCEPT → EXECUTE → COMPLETE)
- Agent reputation leaderboard

Self-contained vanilla JS (no build step), updates via SSE from `/api/stream`.

## Non-Negotiables Enforced

- ✅ BigInt monetary values always transmitted as strings
- ✅ All external calls have explicit 30s timeouts
- ✅ Errors are typed classes caught by global handler
- ✅ Zod validation on every route before service layer
- ✅ Credentials never appear in logs, DB, or responses
- ✅ No `any` types
- ✅ No stubs or TODOs
- ✅ Redis-locked nonce management per chain
- ✅ HCS + UCP always non-blocking relative to EVM execution path
- ✅ x402 WWW-Authenticate header format matches Kite spec exactly

## Bounty Targets Met

1. **Hedera OpenClaw $10k** ✅ UCP commerce, HCS attestations, HTS integration, human observer UI
2. **Kite AI $10k** ✅ x402 protocol, Kite chain payments, agent-native identity
3. **Base $10k** ✅ Gas-efficient settlement batching on L2, self-sustaining agents
4. **Blockade Labs $2k** ✅ ERC-7857 iNFT + HCS topic + escrow per agent on 0G
5. **Futurllama $2k** ✅ AI economic infrastructure, agent-as-service primitives

## Deployment

1. Deploy contracts to Base, Kite, 0G via Hardhat
2. Set contract addresses in `.env`
3. Run `npm run db:push`
4. Start server: `npm run build && npm start`
5. Monitor dashboard at http://localhost:3000

## Production Considerations

- Use managed PostgreSQL (Cloud SQL, RDS)
- Use managed Redis (ElastiCache, Upstash)
- Enable request signing via SIWE (Sign In With Ethereum)
- Set up comprehensive monitoring/alerting
- Rate limiting on public endpoints
- Use encrypted vaults for private keys (not env vars)
- Audit and formally verify contracts before mainnet
- Test settlement under high transaction volume
- Implement tx retry logic with exponential backoff

---

**Built for ETHDenver 2026** 🚀
