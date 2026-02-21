# API Reference

## Base URL

```
http://localhost:3000
```

All endpoints start with `/api/`.

## Authentication

Currently using wallet address authentication:

```
Headers:
X-Wallet: 0x<40 hex characters>
```

Production implementation will use SIWE (Sign In With Ethereum) signatures.

## Endpoints

### Health Check

```
GET /health
```

Returns overall system health across all chains and services.

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-02-22T10:00:00Z",
  "chains": {
    "base": {
      "blockNumber": 12345678,
      "latency": 245,
      "status": "healthy"
    },
    "kite": {
      "blockNumber": 87654321,
      "latency": 312,
      "status": "healthy"
    },
    "zg": {
      "blockNumber": 56789012,
      "latency": 198,
      "status": "healthy"
    }
  },
  "hedera": {
    "status": "healthy",
    "mirrorNodeLatency": 456
  },
  "database": {
    "status": "healthy",
    "poolSize": 5
  },
  "redis": {
    "status": "healthy",
    "memory": "45MB"
  }
}
```

**Status Codes:**
- 200 OK - All systems operational
- 503 Service Unavailable - One or more components down

---

## Tool Registry

### Register Tool

```
POST /api/tools
Content-Type: application/json
X-Wallet: 0x<your wallet>

{
  "openApiSpec": {
    "openapi": "3.0.0",
    "info": { "title": "Stripe API", "version": "1.0" },
    "paths": {
      "/charges": { ... }
    }
  },
  "endpointUrl": "https://api.stripe.com",
  "name": "Stripe Payments",
  "description": "Process credit card payments",
  "priceWei": "1000000000000000",
  "authType": "apikey",
  "authConfig": {
    "headerName": "Authorization",
    "scheme": "Bearer",
    "value": "<encrypted API key>"
  }
}
```

**Request Validation:**
- `openApiSpec`: Valid OpenAPI 3.0 object (required)
- `endpointUrl`: Valid HTTPS URL (required)
- `name`: 1-100 characters (required)
- `priceWei`: Numeric string for wei amount (required)
- `authType`: One of [none, apikey, bearer, oauth2] (required)
- `authConfig`: Object (optional, required if authType !== 'none')

**Response:**
```json
{
  "toolId": "0xabc123def456...",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f47F1",
  "name": "Stripe Payments",
  "description": "Process credit card payments",
  "schema": {
    "type": "function",
    "function": {
      "name": "POST /charges",
      "description": "Create a new charge",
      "parameters": {
        "type": "object",
        "properties": {
          "amount": { "type": "integer", "description": "Amount in cents" },
          "currency": { "type": "string", "description": "ISO 4217 code" },
          "source": { "type": "string", "description": "Token ID or customer ID" }
        },
        "required": ["amount", "currency"]
      }
    }
  },
  "priceWei": "1000000000000000",
  "active": true,
  "zgStorageRef": "zg://0xabcdef123456...",
  "baseToolId": "0xbase123...",
  "kiteTxHash": "0xkite456...",
  "createdAt": "2024-02-22T10:00:00Z"
}
```

**Status Codes:**
- 201 Created - Tool registered successfully
- 400 Bad Request - Invalid OpenAPI spec or missing required fields
- 402 Payment Required - Insufficient escrow balance (see x402 flow)
- 409 Conflict - Tool with same spec already exists
- 502 Bad Gateway - Blockchain unavailable
- 504 Gateway Timeout - Contract write timeout

---

### Get Tool

```
GET /api/tools/:toolId
X-Wallet: 0x<your wallet>
```

Retrieve a tool's metadata and schema.

**Response:**
```json
{
  "toolId": "0xabc123def456...",
  "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f47F1",
  "name": "Stripe Payments",
  "schema": { ... },
  "priceWei": "1000000000000000",
  "active": true,
  "createdAt": "2024-02-22T10:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found - Tool doesn't exist

---

## Agent Management

### Create Agent

```
POST /api/agents
Content-Type: application/json
X-Wallet: 0x<your wallet>

{
  "name": "DeFi Trader Bot"
}
```

Creates a new agent identity across all chains.

**Request Validation:**
- `name`: 1-100 characters (required)

**Response:**
```json
{
  "agentId": "0xabc123def456...",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f47F1",
  "nftTokenId": "1",
  "nftMetadata": {
    "agentId": "0xabc123def456...",
    "name": "DeFi Trader Bot",
    "hcsTopicId": "0.0.1234567",
    "hederaAccountId": "0.0.9876543",
    "reputationScore": 0,
    "totalExecutions": 0,
    "createdAt": "2024-02-22T10:00:00Z"
  },
  "hederaAccountId": "0.0.9876543",
  "hederaPrivateKey": "302e...",
  "hcsTopicId": "0.0.1234567",
  "hcsPublicKey": "302a...",
  "createdAt": "2024-02-22T10:00:00Z"
}
```

**Includes:**
- `agentId`: Unique bytes32 identifier
- `wallet`: The wallet that created the agent
- `nftTokenId`: ERC-721 token on 0G Chain
- `hederaAccountId`: Account for receiving HBAR payments
- `hcsTopicId`: Topic for attestations
- `hederaPrivateKey`: Returned once at creation (save securely!)

**Status Codes:**
- 201 Created - Agent created
- 409 Conflict - Wallet already has an agent
- 502 Bad Gateway - Blockchain unavailable

---

### Get Agent

```
GET /api/agents/:agentId
X-Wallet: 0x<your wallet>
```

Retrieve an agent's identity and current reputation.

**Response:**
```json
{
  "agentId": "0xabc123def456...",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f47F1",
  "name": "DeFi Trader Bot",
  "nftTokenId": "1",
  "hederaAccountId": "0.0.9876543",
  "hcsTopicId": "0.0.1234567",
  "active": true,
  "reputationScore": 87.5,
  "reputationData": {
    "successRate": 0.95,
    "volumeWei": "5000000000000000000",
    "volumeNormalized": 0.05,
    "executionsPerDay": 8.5,
    "consistencyScore": 0.85,
    "totalExecutions": 127,
    "successfulExecutions": 120
  },
  "createdAt": "2024-02-22T10:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found - Agent doesn't exist

---

### Get Agent by Wallet

```
GET /api/agents/wallet/:wallet
```

Retrieve an agent owned by a specific wallet.

**Response:** Same as Get Agent

**Status Codes:**
- 200 OK
- 404 Not Found - No agent for that wallet

---

## Escrow Management

### Get Balance

```
GET /api/escrow/balance
X-Wallet: 0x<agent wallet>
```

Check agent's balance on all chains.

**Response:**
```json
{
  "agentId": "0xabc123def456...",
  "baseBalanceWei": "5000000000000000000",
  "kiteBalanceWei": "3000000000000000000",
  "hbarBalance": "1500",
  "totalValueUsd": 5234.50,
  "lastUpdated": "2024-02-22T10:00:00Z"
}
```

All monetary values are strings (wei or HBAR).

**Status Codes:**
- 200 OK
- 404 Not Found - Agent doesn't exist

---

### Deposit

```
POST /api/escrow/deposit
Content-Type: application/json
X-Wallet: 0x<agent wallet>

{
  "amount": "5000000000000000000",
  "chain": "base|kite|hedera"
}
```

Get instructions to deposit funds to the escrow.

**Request Validation:**
- `amount`: Numeric string for wei/HBAR (required)
- `chain`: One of [base, kite, hedera] (required)

**Response:**
```json
{
  "depositId": "uuid",
  "chain": "base",
  "escrowAddress": "0x...",
  "amount": "5000000000000000000",
  "instructions": {
    "step1": "Send transaction to {{escrowAddress}}",
    "step2": "Call deposit(agentId) with amount",
    "step3": "TX must include function selector 0x1234567",
    "step4": "Minimum gas: 100000",
    "gasPrice": "optimized for Base L2"
  },
  "exampleTx": {
    "to": "0x...",
    "value": "5000000000000000000",
    "data": "0x...",
    "gas": 100000
  },
  "confirmationInstructions": "Wait 2 blocks then call GET /api/escrow/balance"
}
```

**Status Codes:**
- 200 OK - Instructions generated
- 404 Not Found - Agent doesn't exist

---

### Withdraw

```
POST /api/escrow/withdraw
Content-Type: application/json
X-Wallet: 0x<agent wallet>

{
  "amount": "1000000000000000000",
  "chain": "base|kite",
  "destination": "0x..."
}
```

Initiate a withdrawal from escrow.

**Request Validation:**
- `amount`: Numeric string for wei (required)
- `chain`: One of [base, kite] (required)
- `destination`: Valid ethereum address (required)

**Response:**
```json
{
  "withdrawalId": "uuid",
  "agentId": "0xabc123def456...",
  "amount": "1000000000000000000",
  "chain": "base",
  "destination": "0x...",
  "txHash": "0x...",
  "status": "pending",
  "confirmationInstructions": "Wait 12 blocks for finality",
  "createdAt": "2024-02-22T10:00:00Z"
}
```

**Status Codes:**
- 202 Accepted - Withdrawal queued
- 400 Bad Request - Invalid amount or destination
- 402 Payment Required - Insufficient balance
- 404 Not Found - Agent doesn't exist

---

## Tool Execution

### Execute Tool

```
POST /api/tools/:toolId/execute
Content-Type: application/json
X-Wallet: 0x<agent wallet>

{
  "params": {
    "amount": 100.50,
    "currency": "USD"
  },
  "paymentChain": "base",
  "signature": "0x...",
  "nonce": "uuid",
  "ucpNonce": "optional-uuid"
}
```

Execute a tool and deduct from escrow balance.

**Request Validation:**
- `params`: Object matching tool schema (required)
- `paymentChain`: One of [base, kite] (required)
- `signature`: EIP-712 signature (required)
- `nonce`: Prevents replay attacks (required)
- `ucpNonce`: If issued via UCP commerce flow (optional)

**Execution Flow:**
1. Verify signature matches agent wallet
2. Check balance ≥ tool.priceWei on paymentChain
3. **Optimistically deduct** from DB balance
4. Execute HTTP request to tool endpoint (30s timeout)
5. If fails: restore balance, return error
6. If succeeds: enqueue settlement, return response

**Response (Success):**
```json
{
  "executionId": "uuid",
  "toolId": "0xabc123def456...",
  "agentId": "0xabc123def456...",
  "result": {
    "id": "ch_1234567890",
    "object": "charge",
    "amount": 10050,
    "currency": "usd",
    "status": "succeeded"
  },
  "costWei": "1000000000000000",
  "paymentChain": "base",
  "status": "success",
  "settlementStatus": "pending",
  "estimatedSettlementTime": "2024-02-22T10:05:00Z"
}
```

**Response (Insufficient Balance):**

See [x402 Payment Protocol](#x402-payment-protocol) below.

**Response (Signature Error):**
```json
{
  "code": "SIGNATURE_VERIFICATION_ERROR",
  "message": "Signature does not match agent wallet",
  "details": {
    "signerRecovered": "0x...",
    "expectedSigner": "0x..."
  }
}
```

**Response (Upstream Failure):**
```json
{
  "code": "UPSTREAM_EXECUTION_ERROR",
  "message": "Tool endpoint returned 500 Internal Server Error",
  "details": {
    "upstreamStatus": 500,
    "upstreamBody": "Database connection failed",
    "balanceRestored": true
  }
}
```

**Status Codes:**
- 200 OK - Executed successfully
- 400 Bad Request - Invalid parameters
- 401 Unauthorized - Signature verification failed
- 402 Payment Required - Insufficient balance (see x402 flow)
- 404 Not Found - Tool or agent not found
- 502 Bad Gateway - Tool endpoint error
- 504 Gateway Timeout - Execution timeout

---

## x402 Payment Protocol

When balance is insufficient, the middleware returns 402 with a challenge:

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: x402 realm="AgentToolLayer", charset="UTF-8"
Content-Type: application/json

{
  "scheme": "x402",
  "network": "base",
  "asset": "ETH",
  "amount": "1000000000000000",
  "payTo": "0x...",
  "memo": "0xapp_title_here",
  "expires": 1708123456000
}
```

**Client Flow:**

1. **Receive 402 Challenge** from /api/tools/:toolId/execute
2. **Pay to Escrow Address**:
   ```
   sendTransaction({
     to: response.payTo,
     value: response.amount,
     data: encodeAbiParameters(
       ['bytes32', 'address'],
       ['agentId', agentWallet]
     )
   })
   ```
3. **Extract Payment Proof**:
   ```javascript
   const txReceipt = await provider.getTransactionReceipt(txHash);
   const proof = btoa(JSON.stringify({
     txHash,
     blockNumber: txReceipt.blockNumber,
     logIndex: txReceipt.logs[0].logIndex
   }));
   ```
4. **Retry with Proof**:
   ```
   POST /api/tools/:toolId/execute
   X-Payment: <proof>
   ```
5. **Middleware Verifies**:
   - Extracts txHash from proof
   - Calls getTransactionReceipt on chain
   - Verifies amount matches request
   - Credits agent balance
   - Allows request to proceed

---

## Reputation

### Get Leaderboard

```
GET /api/reputation/leaderboard?page=1&limit=100
```

Top agents by reputation score (cached 5 minutes).

**Query Parameters:**
- `page`: 1-based page number (default: 1)
- `limit`: Per-page results (default: 100, max: 1000)

**Response:**
```json
{
  "total": 342,
  "page": 1,
  "limit": 100,
  "agents": [
    {
      "rank": 1,
      "agentId": "0xabc123def456...",
      "name": "DeFi Trader Bot",
      "reputationScore": 98.5,
      "reputationData": {
        "totalExecutions": 1250,
        "successRate": 0.98,
        "volumeWei": "150000000000000000000",
        "executionsPerDay": 25.5,
        "consistencyScore": 0.92
      },
      "createdAt": "2024-01-15T00:00:00Z"
    },
    {
      "rank": 2,
      "agentId": "0xdef456abc123...",
      "name": "Lending Protocol Manager",
      "reputationScore": 96.2,
      ...
    }
  ],
  "cacheAge": "45s"
}
```

**Status Codes:**
- 200 OK

---

### Get Agent Reputation

```
GET /api/reputation/:agentId
```

Detailed reputation metrics and recent executions.

**Response:**
```json
{
  "agentId": "0xabc123def456...",
  "name": "DeFi Trader Bot",
  "reputationScore": 98.5,
  "reputationData": {
    "successRate": 0.98,
    "volumeWei": "150000000000000000000",
    "executionsPerDay": 25.5,
    "consistencyScore": 0.92,
    "totalExecutions": 1250,
    "successfulExecutions": 1225,
    "last7DaysExecutions": 178,
    "last24HourExecutions": 25
  },
  "recentExecutions": [
    {
      "executionId": "uuid",
      "toolId": "0xabc123def456...",
      "toolName": "Stripe Charges",
      "status": "success",
      "costWei": "1000000000000000",
      "createdAt": "2024-02-22T10:00:00Z"
    },
    {
      "executionId": "uuid",
      "toolId": "0xdef456abc123...",
      "toolName": "Uniswap Swap",
      "status": "failed",
      "costWei": "500000000000000",
      "createdAt": "2024-02-22T09:55:00Z"
    }
  ],
  "attestationHistory": [
    {
      "hcsSequence": 1234,
      "attestationType": "TOOL_EXECUTED",
      "status": "SUCCESS",
      "timestamp": "2024-02-22T10:00:00Z"
    }
  ],
  "lastUpdated": "2024-02-22T10:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found - Agent doesn't exist

---

## Real-Time Events

### Subscribe to Events

```
GET /api/stream
Accept: text/event-stream
```

Server-Sent Events stream of all on-chain activity.

**Connection:**
```javascript
const eventSource = new EventSource('/api/stream');

eventSource.addEventListener('error', (e) => {
  if (e.readyState === EventSource.CLOSED) {
    // Reconnect after 5 seconds
    setTimeout(() => location.reload(), 5000);
  }
});
```

**Event Types:**

#### agent_registered
```
event: agent_registered
data: {"agentId":"0xabc123def456...","name":"DeFi Trader Bot","timestamp":"2024-02-22T10:00:00Z"}
```

#### agent_execution
```
event: agent_execution
data: {"executionId":"uuid","agentId":"0xabc123def456...","toolId":"0xdef456abc123...","status":"success","costWei":"1000000000000000","timestamp":"2024-02-22T10:00:00Z"}
```

#### payment_settled
```
event: payment_settled
data: {"settlementId":"uuid","agentId":"0xabc123def456...","totalWei":"50000000000000000","chain":"base","txHash":"0x...","executionCount":50,"timestamp":"2024-02-22T10:05:00Z"}
```

#### reputation_updated
```
event: reputation_updated
data: {"agentId":"0xabc123def456...","reputationScore":98.5,"successRate":0.98,"volumeWei":"150000000000000000000","timestamp":"2024-02-22T10:10:00Z"}
```

#### ucp_message
```
event: ucp_message
data: {"type":"COMMERCE_REQUEST","fromAgentId":"0xabc123def456...","toAgentId":"0xdef456abc123...","toolId":"0xfoo123bar456...","offerAmount":"2000000000000000","nonce":"uuid","timestamp":"2024-02-22T10:00:00Z"}
```

**Status Codes:**
- 200 OK - Stream established
- 1001 Going Away - Client disconnected (normal)
- 1011 Server Error - Internal error

---

## Error Response Format

All errors follow this schema:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {
    "field": "value"
  }
}
```

**Common Error Codes:**

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Request failed validation |
| TOOL_SPEC_INVALID | 400 | OpenAPI spec is malformed |
| TOOL_NOT_FOUND | 404 | Tool doesn't exist |
| AGENT_NOT_FOUND | 404 | Agent doesn't exist |
| AGENT_ALREADY_EXISTS | 409 | Wallet already has an agent |
| INSUFFICIENT_BALANCE | 402 | Balance too low (see x402 flow) |
| SIGNATURE_VERIFICATION_ERROR | 401 | EIP-712 signature invalid |
| UPSTREAM_EXECUTION_ERROR | 502 | Tool endpoint failed |
| UCP_NONCE_CONFLICT | 409 | UCP nonce already used |
| BLOCKCHAIN_ERROR | 502 | Chain unavailable |
| HEDERA_ERROR | 502 | Hedera unavailable |
| ZG_STORAGE_ERROR | 502 | 0G storage unavailable |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Rate Limiting

Currently no rate limits. In production:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1708126400
```

Limits per wallet, per hour.

---

## Pagination

All list endpoints support pagination:

```
GET /api/reputation/leaderboard?page=1&limit=50
```

**Response Fields:**
- `total`: Total number of items
- `page`: Current page (1-based)
- `limit`: Items per page
- `items`: Array of results

---

## Timestamps

All timestamps are ISO 8601 UTC:

```
2024-02-22T10:00:00Z
```

---

## Monetary Values

All monetary amounts are transmitted as strings to preserve precision:

```json
{
  "priceWei": "1000000000000000",      // 0.001 ETH
  "balanceWei": "5000000000000000000", // 5 ETH
  "hbarBalance": "1500"                // 1500 HBAR
}
```

Parse as BigInt in client:
```javascript
const balance = BigInt("5000000000000000000");
```

---

**API is fully typed with TypeScript and validated with Zod at runtime.**
