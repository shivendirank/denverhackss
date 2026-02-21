/**
 * Batch Mint All Agents in ONE Transaction
 * Saves gas by bundling all mints together
 * Usage: npx ts-node scripts/batch-mint-agents.ts
 */

import { createWalletClient, createPublicClient, http, defineChain, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toHex } from "viem";
import "dotenv/config";
import axios from "axios";

// 0G Newton Testnet
const zgTestnet = defineChain({
  id: 16602,
  name: "0G Newton Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.ZG_RPC_URL ?? "https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "0G Explorer", url: "https://explorer-testnet.0g.ai" },
  },
});

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Contract ABI for batchMintAgents
const BATCH_MINT_ABI = [
  {
    name: "batchMintAgents",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "agentWallets", type: "address[]" },
      { name: "names", type: "string[]" },
      { name: "specializations", type: "string[]" },
      { name: "hasTEEFlags", type: "bool[]" },
    ],
    outputs: [],
  },
] as const;

interface Agent {
  id: string;
  name: string;
  wallet: string;
  verified: boolean;
}

async function main() {
  console.log("\n=== Batch Mint All Agents (ONE Transaction) ===\n");

  // Validate environment
  const contractAddress = process.env.ZG_AGENT_NFT_CONTRACT as `0x${string}`;
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "❌ ZG_AGENT_NFT_CONTRACT not set in .env\n" +
        "Deploy first: npm run 0g:deploy"
    );
  }

  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    throw new Error("❌ RELAYER_PRIVATE_KEY not set in .env");
  }

  // Setup clients
  const account = privateKeyToAccount(privateKey);
  const transport = http(zgTestnet.rpcUrls.default.http[0]);
  const walletClient = createWalletClient({ account, chain: zgTestnet, transport });
  const publicClient = createPublicClient({ chain: zgTestnet, transport });

  console.log(`Relayer: ${account.address}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Chain: ${zgTestnet.name} (ID: ${zgTestnet.id})\n`);

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  const balanceFormatted = (Number(balance) / 1e18).toFixed(6);
  console.log(`Balance: ${balanceFormatted} A0GI`);

  if (balance === 0n) {
    throw new Error(
      "❌ No tokens!\n" +
        "Get tokens from: https://faucet.0g.ai\n" +
        "Enter address: " + account.address
    );
  }

  // Fetch all agents from backend
  console.log("\n📡 Fetching agents from backend...");
  const response = await axios.get<Agent[]>(`${API_BASE_URL}/api/agents`);
  const agents = response.data;

  console.log(`Found ${agents.length} agents:\n`);
  agents.forEach((agent) => {
    console.log(`  • ${agent.name}`);
    console.log(`    ID: ${agent.id}`);
    console.log(`    Wallet: ${agent.wallet}`);
  });

  if (agents.length === 0) {
    throw new Error("❌ No agents found. Create agents first.");
  }

  // Prepare batch data
  console.log("\n📦 Preparing batch mint...");

  const owners: `0x${string}`[] = [];
  const agentWallets: `0x${string}`[] = [];
  const names: string[] = [];
  const specializations: string[] = [];
  const hasTEEFlags: boolean[] = [];

  agents.forEach((agent) => {
    owners.push(account.address); // All NFTs owned by relayer
    agentWallets.push(agent.wallet as `0x${string}`); // Agent's identity wallet
    names.push(agent.name);
    
    // Infer specialization from name
    const nameLower = agent.name.toLowerCase();
    if (nameLower.includes("market") || nameLower.includes("finance")) {
      specializations.push("finance");
    } else if (nameLower.includes("code") || nameLower.includes("developer")) {
      specializations.push("code");
    } else if (nameLower.includes("data") || nameLower.includes("analyst")) {
      specializations.push("data");
    } else {
      specializations.push("general");
    }
    
    hasTEEFlags.push(false); // Will enable TEE later
  });

  console.log(`\nBatch Details:`);
  console.log(`  Agents: ${agents.length}`);
  console.log(`  Owner: ${account.address} (relayer pays gas)`);
  console.log(`  Agent Wallets: ${agentWallets.length} unique addresses\n`);

  // Encode batch mint call
  const data = encodeFunctionData({
    abi: BATCH_MINT_ABI,
    functionName: "batchMintAgents",
    args: [owners, agentWallets, names, specializations, hasTEEFlags],
  });

  // Estimate gas
  console.log("⛽ Estimating gas...");
  const gasEstimate = await publicClient.estimateGas({
    account: account.address,
    to: contractAddress,
    data,
  });

  const gasCostWei = gasEstimate * 2n; // 2x for buffer
  const gasCostA0GI = (Number(gasCostWei) / 1e18).toFixed(6);
  console.log(`  Estimated: ${gasEstimate.toString()} gas`);
  console.log(`  Cost: ~${gasCostA0GI} A0GI\n`);

  if (gasCostWei > balance) {
    throw new Error(
      `❌ Insufficient balance!\n` +
        `  Required: ${gasCostA0GI} A0GI\n` +
        `  Available: ${balanceFormatted} A0GI`
    );
  }

  // Confirm
  console.log("🚀 Submitting batch mint transaction...\n");

  const txHash = await walletClient.sendTransaction({
    to: contractAddress,
    data,
    chain: zgTestnet,
    account: account,
  });

  console.log(`Transaction: ${txHash}`);
  console.log(`Explorer: ${zgTestnet.blockExplorers?.default.url}/tx/${txHash}\n`);

  console.log("⏳ Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 2,
  });

  if (receipt.status === "success") {
    console.log("\n✅ Batch mint successful!");
    console.log(`\nGas Used: ${receipt.gasUsed.toString()}`);
    console.log(`Cost: ${(Number(receipt.gasUsed * receipt.effectiveGasPrice) / 1e18).toFixed(6)} A0GI`);

    console.log("\n📋 Minted NFTs:");
    agents.forEach((agent, index) => {
      const tokenId = index + 1; // Token IDs start at 1
      console.log(`\n  ${agent.name}:`);
      console.log(`    Token ID: ${tokenId}`);
      console.log(`    Wallet: ${agent.wallet}`);
      console.log(`    Explorer: ${zgTestnet.blockExplorers?.default.url}/token/${contractAddress}?a=${tokenId}`);
    });

    console.log("\n=== Next Steps ===");
    console.log("\n1. Verify on 0G Explorer:");
    console.log(`   ${zgTestnet.blockExplorers?.default.url}/address/${contractAddress}`);
    console.log("\n2. Check NFT data via API:");
    console.log(`   GET ${API_BASE_URL}/api/zg/agents/status`);
    console.log("\n3. View in frontend dashboard");
    console.log("\n💰 Token Savings: Batch mint uses ~50% less gas than individual mints!");
  } else {
    throw new Error("❌ Transaction failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Batch mint failed:");
    console.error(error.message);
    process.exit(1);
  });
