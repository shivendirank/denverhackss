# Deployment Guide

## Prerequisites

- Node.js 18+ (18.19 LTS recommended)
- PostgreSQL 14+ (create a database for the project)
- Redis 6+ (for nonce locking and pub/sub)
- Solidity compiler (automatically installed with Hardhat)
- Accounts on:
  - Base Sepolia faucet (0.5 ETH for contract deployment + relayer)
  - Kite AI testnet faucet (0.5 ETH for contract deployment)
  - 0G testnet faucet (0.5 ETH for contract deployment)
  - Hedera testnet (faucet provides 1000 HBAR to start)

## 1. Clone & Install

```bash
git clone https://github.com/yourusername/agent-trust-layer.git
cd agent-trust-layer
npm install
```

This installs:
- TypeScript + tsconfig for strict type checking
- Hardhat + plugins for multi-chain compilation
- Viem for EVM interaction
- Prisma for database ORM
- BullMQ + Redis client
- Hedera SDK
- Express
- Zod for validation
- Pino for logging

## 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with actual values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agent_trust_db

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain RPC URLs
BASE_RPC_URL=https://sepolia.base.org
KITE_RPC_URL=https://testnet.kite.com
ZG_RPC_URL=https://testnet-rpc.0g.ai

# Relayer account (same across all chains)
RELAYER_PRIVATE_KEY=0x...

# Contract addresses (will be populated after deployment)
TOOL_REGISTRY_ADDRESS_BASE=0x...
ESCROW_ADDRESS_BASE=0x...
AGENT_NFT_ADDRESS_ZG=0x...
USAGE_LOG_ADDRESS_ZG=0x...
TOOL_REGISTRY_ADDRESS_KITE=0x...
ESCROW_ADDRESS_KITE=0x...

# Hedera
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=...
HEDERA_NETWORK=testnet

# 0G Storage
ZG_STORAGE_API_URL=https://api.0g.ai/storage

# Server
PORT=3000
NODE_ENV=development

# Service urls
BASE_SEPOLIA_BLOCK_EXPLORER=https://sepolia.basescan.org
KITE_BLOCK_EXPLORER=https://explorer.kite.com
ZG_BLOCK_EXPLORER=https://explorer.0g.ai

# Optional: for CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Required Variables Checklist

Run this to validate your setup:

```bash
npm run config:validate
```

The system will exit with a list of missing required variables if any are missing.

## 3. Set Up PostgreSQL

### Option A: Local PostgreSQL

```bash
# macOS with brew
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: download installer
# https://www.postgresql.org/download/windows/
```

Create database:

```bash
createdb agent_trust_db
```

### Option B: Docker

```bash
docker run --name postgres-agent \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=agent_trust_db \
  -p 5432:5432 \
  -d postgres:14
```

Then update DATABASE_URL in .env:
```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/agent_trust_db
```

## 4. Set Up Redis

### Option A: Local Redis

```bash
# macOS with brew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows: WSL2 + Ubuntu, or use Docker
```

### Option B: Docker

```bash
docker run --name redis-agent \
  -p 6379:6379 \
  -d redis:7-alpine
```

## 5. Get Testnet Tokens

### Base Sepolia

1. Go to https://sepolia.baseowl.it/
2. Paste your relayer address (derive from RELAYER_PRIVATE_KEY)
3. Receive 1 Base ETH (enough for ~1000 transactions)

Or use faucet API:

```bash
curl -X POST https://api.sepolia.basescan.io/api?module=account&action=getfaucet&address=0x...
```

### Kite AI Testnet

```bash
# Get testnet tokens from Kite Discord or https://faucet.kite.com
# Paste your relayer address
# Receive ~5 KTE (Kite testnet token)
```

### 0G Testnet

```bash
# Go to https://faucet.0g.ai
# Enter your relayer address
# Receive 10 A0GI (0G token)
```

### Hedera Testnet

```bash
# Go to https://testnet.hedera.com
# Create an operator account (saves ACCOUNT_ID and PRIVATE_KEY)
# You get 1000 HBAR automatically
# Derive a second account for your agents to receive payments
export HEDERA_ACCOUNT_ID=0.0.xxxxx
export HEDERA_PRIVATE_KEY=...
```

## 6. Compile Smart Contracts

```bash
npm run contracts:compile
```

Output:
```
✓ contracts/ToolRegistry.sol
✓ contracts/Escrow.sol
✓ contracts/AgentNFT.sol
✓ contracts/UsageLog.sol

Build complete.
```

## 7. Deploy Smart Contracts

Deploy in order: **Base → Kite → 0G** (same relayer account on all)

### Base Sepolia

```bash
npm run contracts:deploy:base
```

Output:
```
Deploying to Base Sepolia...
ToolRegistry deployed to: 0x...... [save this]
Escrow deployed to: 0x...... [save this]
UsageLog deployed to: 0x......
Deployment saved to ./deployments/baseSepolia.json
```

Update `.env`:
```env
TOOL_REGISTRY_ADDRESS_BASE=0x......
ESCROW_ADDRESS_BASE=0x......
```

### Kite AI Testnet

```bash
npm run contracts:deploy:kite
```

Output:
```
Deploying to Kite AI Testnet...
ToolRegistry deployed to: 0x...... [save this]
Escrow deployed to: 0x...... [save this]
UsageLog deployed to: 0x......
Deployment saved to ./deployments/kiteTestnet.json
```

Update `.env`:
```env
TOOL_REGISTRY_ADDRESS_KITE=0x......
ESCROW_ADDRESS_KITE=0x......
```

### 0G Testnet

```bash
npm run contracts:deploy:zg
```

Output:
```
Deploying to 0G Testnet...
AgentNFT deployed to: 0x...... [save this]
UsageLog deployed to: 0x......
Deployment saved to ./deployments/zgTestnet.json
```

Update `.env`:
```env
AGENT_NFT_ADDRESS_ZG=0x......
```

## 8. Set Up Database Schema

```bash
npm run db:push
```

This creates all tables and enums in PostgreSQL:
- Tool
- Agent
- Execution
- EscrowBalance
- Settlement
- UCPMessage

Output:
```
✓ Created table `Tool`
✓ Created table `Agent`
✓ Created table `Execution`
✓ Created table `EscrowBalance`
✓ Created table `Settlement`
✓ Created table `UCPMessage`
```

### Optional: Inspect Schema in Prisma Studio

```bash
npm run db:studio
```

Opens http://localhost:5555 in your browser. Browse tables, create records manually for testing.

## 9. Build TypeScript

```bash
npm run build
```

Output:
```
✓ dist/index.js
✓ dist/services/**
✓ dist/routes/**
✓ dist/middleware/**
✓ dist/queues/**
... 50+ files compiled
```

## 10. Start Development Server

```bash
npm run dev
```

Output:
```
[timestamp] App listening on port 3000
[timestamp] ✓ Base Sepolia block number: 12345678
[timestamp] ✓ Kite AI block number: 87654321
[timestamp] ✓ 0G block number: 56789012
[timestamp] ✓ Hedera mirror node reachable
[timestamp] ✓ PostgreSQL connected
[timestamp] ✓ Redis connected
[timestamp] ✓ Settlement queue started
[timestamp] ✓ Reputation queue started
```

Server runs on port 3000 (configurable via PORT env var).

Visit http://localhost:3000 to see the observer dashboard.

## 11. Verify Health

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-22T10:00:00Z",
  "chains": {
    "base": { "blockNumber": 12345678, "status": "healthy" },
    "kite": { "blockNumber": 87654321, "status": "healthy" },
    "zg": { "blockNumber": 56789012, "status": "healthy" }
  },
  "hedera": { "status": "healthy" },
  "database": { "status": "healthy" },
  "redis": { "status": "healthy" }
}
```

If any component is unhealthy, check:
- Is PostgreSQL running? `psql agent_trust_db`
- Is Redis running? `redis-cli ping` (should respond PONG)
- Are RPC URLs correct and accessible? `curl $BASE_RPC_URL`
- Are contract addresses deployed? Check `deployments/*.json`

## 12. Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build image:

```bash
docker build -t agent-trust-layer:latest .
```

Run container:

```bash
docker run -d \
  --name agent-trust \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e BASE_RPC_URL=... \
  -e RELAYER_PRIVATE_KEY=... \
  --env-file .env.production \
  -p 3000:3000 \
  agent-trust-layer:latest
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Configure environment
heroku config:set \
  DATABASE_URL=postgresql://... \
  REDIS_URL=redis://... \
  RELAYER_PRIVATE_KEY=... \
  NODE_ENV=production \
  --app your-app-name

# Deploy
git push heroku main
```

### Deploy to AWS EC2

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance.com

# Install Node and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql-client redis-tools

# Clone and install
git clone https://github.com/yourusername/agent-trust-layer.git
cd agent-trust-layer
npm install

# Edit .env with RDS/ElastiCache endpoints
vim .env

# Build and start
npm run build
npm start
```

Configure security group to allow:
- 3000 (API)
- 5432 (PostgreSQL, internal only)
- 6379 (Redis, internal only)

## Troubleshooting

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL is not running.

```bash
# macOS
brew services list | grep postgres
brew services start postgresql@14

# Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql

# Docker
docker ps | grep postgres
# If not listed: docker start postgres-agent
```

### "Error: connect ECONNREFUSED 127.0.0.1:6379"

Redis is not running.

```bash
# macOS
brew services list | grep redis
brew services start redis

# Ubuntu/Debian
sudo systemctl status redis-server
sudo systemctl start redis-server

# Docker
docker ps | grep redis
# If not listed: docker start redis-agent
```

### "Error: RPC endpoint not reachable"

RPC URL is wrong or network is down.

```bash
# Test RPC connectivity
curl -X POST $BASE_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0x...","id":1}
```

Update `.env` with correct RPC_URL.

### "Error: contract address not found"

Contract not deployed yet.

```bash
# Check what's deployed
ls -la deployments/

# Re-deploy
npm run contracts:deploy:base
npm run contracts:deploy:kite
npm run contracts:deploy:zg

# Update .env with addresses from output
```

### "Error: Invalid mnemonic" or "Invalid private key"

RELAYER_PRIVATE_KEY format is wrong.

```bash
# Must be 0x followed by 64 hex characters
echo $RELAYER_PRIVATE_KEY | grep -E "^0x[a-fA-F0-9]{64}$"

# If empty, key is invalid. Regenerate:
openssl rand -hex 32
# Then prepend 0x and update .env
```

### "Error: insufficient funds for gas * price + value"

Relayer account has no ETH on that chain.

```bash
# Get relayer address
node -e "console.log(require('viem').privateKeyToAddress('${RELAYER_PRIVATE_KEY}'))"

# Go to faucet and request tokens for that address
```

### "Error: Hedera Account not initialized"

HEDERA_ACCOUNT_ID is missing or wrong format.

```bash
# Format must be 0.0.xxxxx
# Get your account from https://testnet.hedera.com
export HEDERA_ACCOUNT_ID=0.0.xxxxx
export HEDERA_PRIVATE_KEY=...
```

### Settlement queue not triggering

Check Redis and BullMQ:

```bash
# SSH into server
redis-cli

# List all keys
KEYS *

# Check settlement queue jobs
LLEN bull:settlement:queue

# If empty, ensure /api/tools/execute is being called
```

Also check logs for errors:

```bash
npm run dev 2>&1 | grep -i settlement
```

### Reputation scores not updating

Check reputation queue:

```bash
redis-cli LLEN bull:reputation:queue

# Should have jobs if executions happened in last 5 minutes
```

Also verify Hedera connection:

```bash
# Test HCS topic interaction
curl -X GET "https://testnet-mirror.hedera.com/api/v1/topics/$HEDERA_HCS_TOPIC_ID/messages"
```

## Monitoring in Production

### Logs

Pino logs are output in JSON format via `pino-http`:

```bash
npm start | jq '.msg' | grep -i error
```

Or pipe to a log aggregation service:

```bash
npm start | docker run -i fluent/fluent:v1.12 \
  -c /dev/stdin <<EOF
<source>
  @type stdin
  <parse>
    @type json
  </parse>
</source>
<match **>
  @type datadog
  @id output_datadog
  api_key "#{ENV['DD_API_KEY']}"
  dd_service "agent-trust-layer"
  dd_source "nodejs"
  dd_tags "version:#{ENV['DD_VERSION']}"
  provider gcp
  use_json true
  <buffer>
    @type file
    path /var/log/fluentd-buffers/datadog.log.buffer
    flush_mode interval
    flush_interval 10s
  </buffer>
</match>
EOF
```

### Health Checks

Configure your load balancer to periodically call:

```
GET http://your-api.com/health
```

Should return 200 with all components healthy. If any component is unhealthy, immediately pull instance from load balancer.

### Metrics to Monitor

1. **Settlement Queue Size** - Should stay <50 (not accumulating)
   ```bash
   redis-cli LLEN bull:settlement:queue
   ```

2. **Execution Latency** - Should be <500ms (p99)
   ```bash
   npm start | grep "executionProxy" | jq '.responseTime'
   ```

3. **PostgreSQL Connection Pool** - Monitor idle vs active
   ```bash
   psql agent_trust_db -c "SELECT count(*) FROM pg_stat_activity;"
   ```

4. **Redis Memory** - Should stay <100MB
   ```bash
   redis-cli INFO memory | grep used_memory_human
   ```

5. **Contract Gas Usage** - Track costs
   - Base: Should be ~40k per settlement batch
   - Kite: ~50k per settlement batch
   - 0G: ~100k per agent creation

## Scaling Considerations

### Vertical (bigger machine)

- Each PostgreSQL connection: ~5MB
- Each BullMQ worker: ~10MB
- Each Express worker: ~20MB

With 1GB memory, comfortably handle 10 concurrent agents.

### Horizontal (multiple instances)

1. Share Redis and PostgreSQL across all instances
2. Each instance runs its own BullMQ workers
   - Settlement queue workers: 1-2 per instance
   - Reputation queue workers: 1 per instance
   - Don't duplicate jobs across instances (use locks)
3. Put all instances under a load balancer
4. Use same RELAYER_PRIVATE_KEY across all instances
   - Nonce locking in Redis prevents collisions

### Database Query Optimization

Add indexes for common queries:

```sql
CREATE INDEX idx_execution_agentid ON "Execution"("agentId");
CREATE INDEX idx_execution_status ON "Execution"("status");
CREATE INDEX idx_execution_createdat ON "Execution"("createdAt");
CREATE INDEX idx_settlement_status ON "Settlement"("status");
CREATE INDEX idx_agent_wallet ON "Agent"("wallet");
```

### Caching Layer

Add Redis caching for hot queries:

```typescript
// In reputation.ts
const cached = await redis.get(`reputation:${agentId}`);
if (cached) return JSON.parse(cached);

const score = await calculateReputation(agentId);
await redis.setex(`reputation:${agentId}`, 300, JSON.stringify(score)); // 5min TTL
return score;
```

## Rollback Plan

If deployment breaks production:

```bash
# Stop current container/server
npm run pm2:stop agent-trust-layer
# or
docker stop agent-trust-layer

# Checkout previous stable version
git checkout last-known-good-commit

# Rebuild and restart
npm run build
npm start

# Verify
curl http://localhost:3000/health
```

**Bonus**: Use Blue-Green deployment:
- Blue = currently running
- Green = new version
- Deploy to green, run tests, switch traffic
- If issues, instantly revert to blue

---

**System is now ready for ETHDenver judges to test!**
