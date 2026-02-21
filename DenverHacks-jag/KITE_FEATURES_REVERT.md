# Kite track features – what was added & how to revert

Use this only if you want to remove the new features and go back to the previous dashboard.

---

## What was implemented

### 1. **Tool registry / catalog**
- **Where:** `components/ui/tool-registry-catalog.tsx`
- **Data:** `lib/agents.ts` – `ToolRegistryEntry`, `AgentDetail.toolRegistry`, per-agent overrides.
- **Shows:** Name, API source, rules, price per call, permissions, on-chain id (link to Kitescan).

### 2. **Per-tool usage & billing**
- **Where:** `components/ui/per-tool-usage-billing.tsx`
- **Data:** `AgentDetail.toolUsage` (usage count, total spent, last used), per-agent.
- **Shows:** Tool name, calls, total spent, last used, small usage bar.

### 3. **Wallet / balance for the agent**
- **Where:** `components/ui/agent-wallet-balance.tsx`
- **Data:** `AgentDetail.wallet` (balance, lowBalanceThreshold, faucetUrl), per-agent.
- **Shows:** Balance (Kite testnet), “Low balance” warning when below threshold, “Get testnet KITE” link to faucet.

### 4. **Live “agent run” view**
- **Where:** `components/ui/agent-run-view.tsx`
- **Data:** `AgentDetail.lastRun` (runId, startedAt, steps with type/auth/call_tool/pay, status, txHash).
- **Shows:** Last run steps (auth → call tool → pay → …) with status and Tx link to Kitescan.

### 5. **Settings: scopes & limits**
- **Where:** `components/ui/scopes-and-limits.tsx`
- **Data:** `AgentDetail.scopesAndLimits` (rateLimitPerMin, allowedToolIds, spendLimitPerDay).
- **Shows:** Rate limit, allowed tools, daily spend limit.

### 6. **Integration**
- **Where:** `components/ui/spatial-product-showcase.tsx`
- **Changes:** Imports for the 5 components; after Status: `AgentWalletBalance`; after main card: grid with `ToolRegistryCatalog` + `PerToolUsageBilling`, then `AgentRunView` + `ScopesAndLimits`.

### 7. **Data**
- **Where:** `lib/agents.ts`
- **New types:** `ToolRegistryEntry`, `ToolUsageEntry`, `AgentWallet`, `AgentRunStep`, `AgentRun`, `ScopesAndLimits`.
- **New/updated:** `AgentDetail` extended with `toolRegistry`, `toolUsage`, `wallet`, `lastRun`, `scopesAndLimits`. Per-agent overrides in `AGENT_DETAIL_OVERRIDES` for all 5 agents. `DEFAULT_WALLET`, `DEFAULT_SCOPES`, `KITE_FAUCET_URL`.

---

## How to revert

1. **Remove new UI components** (delete files):
   - `components/ui/tool-registry-catalog.tsx`
   - `components/ui/per-tool-usage-billing.tsx`
   - `components/ui/agent-wallet-balance.tsx`
   - `components/ui/agent-run-view.tsx`
   - `components/ui/scopes-and-limits.tsx`

2. **Revert `lib/agents.ts`**  
   Remove: `ToolRegistryEntry`, `ToolUsageEntry`, `AgentWallet`, `AgentRunStep`, `AgentRun`, `ScopesAndLimits`, `DEFAULT_WALLET`, `DEFAULT_SCOPES`, `KITE_FAUCET_URL`, `getExplorerTxUrl` (keep if still used elsewhere). Remove from `AgentDetail`: `toolRegistry`, `toolUsage`, `wallet`, `lastRun`, `scopesAndLimits`. Remove all new fields from `AGENT_DETAIL_OVERRIDES` and the merge in `getAgentDetailById`.

3. **Revert `components/ui/spatial-product-showcase.tsx`**  
   Remove imports for the 5 new components. Remove the “Wallet / balance” block. Remove the “Tool registry & per-tool usage” and “Last run view & scopes & limits” blocks.

4. **Delete this file**  
   `KITE_FEATURES_REVERT.md`

You can do the revert with git:  
`git checkout -- lib/agents.ts components/ui/spatial-product-showcase.tsx`  
then delete the 5 new component files and this markdown file.
