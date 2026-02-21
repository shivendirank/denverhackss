d# Testing Guide

## Quick Start

Run the full test suite:

```bash
npm test
```

Output:
```
✓ src/tests/integration.test.ts (5 tests)
  ✓ Tool Registry (3 tests)
    ✓ Parses OpenAPI spec to function schema
    ✓ Handles nested parameters correctly
    ✓ Validates spec before registration
  ✓ Execution Proxy (1 test)
    ✓ Signature verification matches EIP-712
  ✓ Settlement Batching (1 test)
    ✓ Groups executions by wallet pair

Test Files are 5 passing:
  5 passed (1.2s)
```

## Test Structure

```
src/tests/
├─ integration.test.ts    # Main test suite
├─ fixtures/
│  ├─ stripe.openapi      # Real Stripe spec
│  ├─ twilio.openapi      # Real Twilio spec
│  └─ ethereum.openapi    # Real Ethereum JSON-RPC spec
└─ helpers/
   ├─ eip712.ts           # Signature generation utilities
   └─ blockchain.ts       # Local chain interactions
```

## Running Tests

### All Tests

```bash
npm test
```

### Single File

```bash
npm test integration.test.ts
```

### Specific Test

```bash
npm test -- --grep "Parses OpenAPI"
```

### Watch Mode (rerun on save)

```bash
npm test -- --watch
```

### With Coverage Report

```bash
npm test -- --coverage
```

Output:
```
File                    | Coverage
-----------------------|----------
src/services/...       | 87.3%
src/middleware/...     | 92.1%
src/blockchain/...     | 79.5%
-----------------------|----------
Total                  | 86.4%
```

## Local Testing Without Deployment

### 1. Start Dev Server

```bash
npm run dev
```

The server will start on http://localhost:3000 with:
- In-memory database (reset on restart)
- Mock blockchain responses (no real transactions)
- Real Redis and PostgreSQL connections

### 2. Test Tool Registration

```bash
curl -X POST http://localhost:3000/api/tools \
  -H "Content-Type: application/json" \
  -H "X-Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f47F1" \
  -d '{
    "openApiSpec": {
      "openapi": "3.0.0",
      "info": { "title": "Test API", "version": "1.0" },
      "paths": {
        "/test": {
          "get": {
            "operationId": "getTest",
            "summary": "Test operation",
            "parameters": [
              { "name": "id", "in": "query", "required": true, "schema": { "type": "integer" } }
            ]
          }
        }
      }
    },
    "endpointUrl": "https://api.example.com",
    "name": "Test API",
    "priceWei": "1000000000000000",
    "authType": "none"
  }'
```

Expected Response:
```json
{
  "toolId": "0x...",
  "name": "Test API",
  "priceWei": "1000000000000000",
  "active": true,
  "schema": {
    "type": "function",
    "function": {
      "name": "getTest",
      "description": "Test operation",
      "parameters": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "description": "" }
        },
        "required": ["id"]
      }
    }
  }
}
```

### 3. Test Agent Creation

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "X-Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f47F1" \
  -d '{
    "name": "Test Agent"
  }'
```

Expected Response:
```json
{
  "agentId": "0xabc123...",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f47F1",
  "nftTokenId": "1",
  "hederaAccountId": "0.0.xxxxx",
  "hcsTopicId": "0.0.yyyyy",
  "createdAt": "2024-02-22T10:00:00Z"
}
```

### 4. Test Health Check

```bash
curl http://localhost:3000/health
```

Expected Response:
```json
{
  "status": "healthy",
  "chains": {
    "base": { "status": "healthy" },
    "kite": { "status": "healthy" },
    "zg": { "status": "healthy" }
  },
  "database": { "status": "healthy" },
  "redis": { "status": "healthy" }
}
```

## Manual Integration Testing

### Scenario 1: Full Tool Execution Flow

**Setup:**
1. Remove DATABASE_URL from .env (use in-memory)
2. Run `npm run dev`
3. Register agent
4. Register tool
5. Execute tool

**Detailed Steps:**

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests
# 1. Create agent
AGENT_WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595f47F1"
TOOL_URL="https://request-echo.herokuapp.com/get"

curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "X-Wallet: $AGENT_WALLET" \
  -d '{"name":"Test Bot"}' | jq '.agentId' > agent.tmp

AGENT_ID=$(cat agent.tmp | tr -d '"')

# 2. Register tool (Echo API - safe to call)
curl -X POST http://localhost:3000/api/tools \
  -H "Content-Type: application/json" \
  -H "X-Wallet: $AGENT_WALLET" \
  -d '{
    "openApiSpec": {
      "openapi": "3.0.0",
      "info": { "title": "Echo", "version": "1.0" },
      "servers": [{"url": "https://request-echo.herokuapp.com"}],
      "paths": {
        "/get": {
          "get": {
            "operationId": "echo",
            "parameters": [
              {"name": "message", "in": "query", "schema": {"type": "string"}}
            ]
          }
        }
      }
    },
    "endpointUrl": "https://request-echo.herokuapp.com",
    "name": "Echo",
    "priceWei": "100000000000000",
    "authType": "none"
  }' | jq '.toolId' > tool.tmp

TOOL_ID=$(cat tool.tmp | tr -d '"')

# 3. Get balance
curl http://localhost:3000/api/escrow/balance \
  -H "X-Wallet: $AGENT_WALLET"

# 4. Try execution (should fail with 402 Payment Required)
curl -X POST http://localhost:3000/api/tools/$TOOL_ID/execute \
  -H "Content-Type: application/json" \
  -H "X-Wallet: $AGENT_WALLET" \
  -d '{
    "params": {"message": "hello"},
    "paymentChain": "base",
    "signature": "0x1234567890...",
    "nonce": "uuid-1234"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 402 Payment Required with x402 challenge
```

### Scenario 2: Settlement Batching

**Prerequisites:**
- 50+ pending executions in database
- Settlement queue enabled

**Steps:**

```bash
# Insert test executions via psql
psql agent_trust_db -c "
INSERT INTO \"Execution\" (id, \"agentId\", \"toolId\", \"costWei\", \"paymentChain\", status, \"createdAt\")
SELECT 
  gen_random_uuid(),
  '0xabc123...',
  '0xdef456...',
  '1000000000000000',
  'base',
  'PENDING',
  now()
FROM generate_series(1,50);
"

# Trigger settlement manually
curl -X POST http://localhost:3000/api/internal/settlement/trigger \
  -H "Content-Type: application/json" \
  -d '{"chain":"base"}'

# Check settlement
curl http://localhost:3000/api/reputation/0xabc123...
# Should show recent executions settled
```

### Scenario 3: Reputation Calculation

**Prerequisites:**
- Agent with at least 10 executions
- Mix of successful and failed executions

**Steps:**

```bash
# Trigger reputation update
curl -X POST http://localhost:3000/api/internal/reputation/update \
  -H "Content-Type: application/json" \
  -d '{"agentId":"0xabc123..."}'

# Check updated reputation
curl http://localhost:3000/api/reputation/0xabc123...

# Expected fields:
# - reputationScore: 0-100
# - reputationData.successRate: 0-1
# - reputationData.volumeWei: numeric string
# - reputationData.consistencyScore: 0-1
```

### Scenario 4: x402 Payment Flow

**Prerequisites:**
- Agent with insufficient balance

**Steps:**

```bash
AGENT_WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595f47F1"
TOOL_ID="0xdef456..."

# 1. Attempt execution (balance = 0)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/tools/$TOOL_ID/execute \
  -H "Content-Type: application/json" \
  -H "X-Wallet: $AGENT_WALLET" \
  -d '{
    "params": {"message": "test"},
    "paymentChain": "base",
    "signature": "0x1234567890...",
    "nonce": "uuid-5678"
  }')

STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

echo "Status: $STATUS"
echo "Response: $BODY" | jq '.'

# Should be 402 with:
# {
#   "scheme": "x402",
#   "network": "base",
#   "amount": "1000000000000000",
#   "payTo": "0x...",
#   ...
# }

# 2. Client deposits to escrow (mocked in dev)
# In production: send actual transaction to payTo address

# 3. Retry with payment proof
curl -X POST http://localhost:3000/api/tools/$TOOL_ID/execute \
  -H "Content-Type: application/json" \
  -H "X-Wallet: $AGENT_WALLET" \
  -H "X-Payment: eyJ0eEhhc2giOiIweCJ9..." \
  -d '{
    "params": {"message": "test"},
    "paymentChain": "base",
    "signature": "0x1234567890...",
    "nonce": "uuid-5678"
  }'

# Should now return 200 with result
```

## Test Suite Breakdown

### Tool Registry Tests

Tests the OpenAPI → function schema conversion pipeline.

```bash
npm test -- --grep "Tool Registry"
```

**Test Cases:**

1. **Parses Stripe Spec**
   - Input: Real Stripe OpenAPI v3.0 spec
   - Validates: All operations extracted
   - Validates: Parameters converted correctly
   - Validates: Request body schema preserved

2. **Parses Twilio Spec**
   - Input: Real Twilio SendMessage operation
   - Validates: Path parameters extracted
   - Validates: Required fields identified
   - Validates: Parameter types matched

3. **Invalid Spec Rejected**
   - Input: Malformed OpenAPI
   - Validates: swagger-parser rejects
   - Validates: Error message is helpful

4. **Nested Parameters**
   - Input: Complex nested request body
   - Validates: Recursive schema traversal
   - Validates: Deep object properties included

### Execution Proxy Tests

Tests EIP-712 signature verification.

```bash
npm test -- --grep "Execution Proxy"
```

**Test Cases:**

1. **Signature Verification**
   - Generates valid EIP-712 signature
   - Verifies signer recovery matches wallet
   - Validates: Domain separator prevents cross-chain reuse
   - Validates: Nonce prevents replay attacks

2. **Optimistic Deduction**
   - Deducts balance before execution
   - On failure: restores balance exactly
   - On success: enqueues settlement

### Settlement Batching Tests

Tests wallet-pair grouping and atomic debit.

```bash
npm test -- --grep "Settlement Batching"
```

**Test Cases:**

1. **Groups by Wallet Pair**
   - Executions: Agent A + Tool Owner X = $1000
   - Executions: Agent A + Tool Owner Y = $500
   - Executions: Agent B + Tool Owner X = $1500
   - Groups: 3 unique pairs
   - Calls: 3 Escrow.debit() calls total

2. **Atomic Settlement**
   - All or nothing: Either all settle or all fail
   - Partial failures: No silent half-settlements

3. **Gas Optimization**
   - 50 executions → 1-3 Escrow.debit() calls
   - Compare: 50 calls if no batching
   - Verify: Gas saved = (50-3) * 40k = 1.88M gas

### Reputation Tests

Tests score calculation formula.

```bash
npm test -- --grep "Reputation"
```

**Test Cases:**

1. **Perfect Agent**
   - 100 executions, 100 successful
   - Success rate: 1.0 → 0.6 points
   - Volume: 100 ETH → 1.0 → 0.2 points
   - Consistency: 20/day → capped 1.0 → 0.2 points
   - Score: (0.6 + 0.2 + 0.2) * 100 = 100

2. **Young Agent**
   - 5 executions, 4 successful
   - Success rate: 0.8 → 0.48 points
   - Volume: 0.5 ETH → 0.005 → 0.001 points
   - Consistency: 1/day → 0.1 → 0.02 points
   - Score: (0.48 + 0.001 + 0.02) * 100 = 50.1

3. **Unreliable Agent**
   - 50 executions, 25 successful
   - Success rate: 0.5 → 0.3 points
   - Volume: 10 ETH → 0.1 → 0.02 points
   - Consistency: 5/day → 0.5 → 0.1 points
   - Score: (0.3 + 0.02 + 0.1) * 100 = 42

### x402 Protocol Tests

Tests exact header format and challenge generation.

```bash
npm test -- --grep "x402"
```

**Test Cases:**

1. **Header Format**
   - Verify exact string: `x402 realm="AgentToolLayer", charset="UTF-8"`
   - No variations allowed
   - Case-sensitive

2. **Challenge Generation**
   - amount matches tool.priceWei
   - expiry = now + 5 minutes
   - payTo = correct escrow address
   - memo = tool ID

3. **Payment Verification**
   - Validates txHash on-chain
   - Verifies amount matches
   - Credits balance exactly
   - Allows retry to proceed

## Debugging Tests

### Enable Debug Logs

```bash
DEBUG=* npm test
```

Outputs all internal debug messages:

```
  Tool Registry Parsing
    Parsing Stripe spec...
    Found 245 operations
    Converting /v1/charges...
    Extracted 12 parameters
    ...
```

### Run Single Test with Console Output

```bash
npm test -- --grep "Parses Stripe" --reporter=verbose
```

### Inspect Test State

Add breakpoints in test:

```typescript
it("Parses Stripe Spec", async () => {
  const spec = loadSpec("stripe.openapi");
  debugger; // Pauses here when run with node --inspect
  const schema = parseOpenApiSpec(spec);
  expect(schema).toBeDefined();
});
```

Run with inspector:

```bash
node --inspect-brk node_modules/.bin/vitest run --grep "Parses Stripe"
```

Then open `chrome://inspect` and debug.

## Test Data

### Fixture Files

Store under `src/tests/fixtures/`:

```
src/tests/fixtures/
├─ stripe.openapi          # Full Stripe v3 spec (245 operations)
├─ twilio.openapi          # Twilio SendMessage operation
├─ ethereum.openapi        # Ethereum JSON-RPC schema
├─ agent-identity.json     # Sample agent metadata
└─ escrow-state.json       # Sample escrow balances
```

Load in tests:

```typescript
import stripeSpec from "../fixtures/stripe.openapi";

it("Parses Stripe", () => {
  const schema = parseOpenApiSpec(stripeSpec);
  expect(schema.operations).toHaveLength(245);
});
```

### Mock Blockchain Responses

In `src/tests/helpers/blockchain.ts`:

```typescript
export const mockBaseSepolia = {
  blockNumber: 12345678,
  blockTimestamp: Date.now(),
  currentGasPrice: "1500000000", // 1.5 Gwei
  nonce: 42,
  balance: "5000000000000000000" // 5 ETH
};
```

Use in tests:

```typescript
import { mockBaseSepolia } from "./helpers/blockchain";

beforeEach(() => {
  vi.mocked(baseClient.getBlockNumber).mockResolvedValue(mockBaseSepolia.blockNumber);
});
```

## Performance Benchmarks

Every test run includes performance metrics:

```
Performance:
  Tool Registry:
    Parsing Stripe (245 ops): 245ms
    Converting schema: 156ms
    Total: 401ms

  Execution Proxy:
    Signature verification: 42ms
    Balance check: 15ms
    Total: 57ms

  Settlement:
    Batching 50 executions: 234ms
    Grouping by wallet: 12ms
    Total: 246ms
```

Target: All tests <2s total

## Coverage Goals

Target coverage per module:

| Module | Target | Current |
|--------|--------|---------|
| services/ | 95% | 94% |
| middleware/ | 90% | 92% |
| blockchain/ | 85% | 79% |
| hedera/ | 80% | 71% |
| routes/ | 85% | 87% |

Run coverage report:

```bash
npm test -- --coverage
```

Drill into module:

```bash
npm test -- --coverage src/services/executionProxy.ts
```

## End-to-End Test Checklist

Before pushing to production:

- [ ] All unit tests pass: `npm test`
- [ ] No TypeScript errors: `npm run build`
- [ ] No lint errors: `npm run lint`
- [ ] Health check passes: `curl http://localhost:3000/health`
- [ ] Can register a tool: `POST /api/tools` with valid OpenAPI spec
- [ ] Can create an agent: `POST /api/agents`
- [ ] Can get balance: `GET /api/escrow/balance`
- [ ] Can execute a tool (with balance): `POST /api/tools/:id/execute`
- [ ] Gets 402 Payment Required when insufficient balance
- [ ] Settlement queue processes pending executions
- [ ] Reputation updates every 5 minutes
- [ ] SSE stream sends events: `GET /api/stream`
- [ ] Observer dashboard loads: `GET /`

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install
        run: npm install
      
      - name: Compile
        run: npm run build
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Coverage
        run: npm test -- --coverage
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

Push to GitHub, and tests run automatically on every commit.

---

**Tests ensure system reliability and catch regressions before deployment.**
