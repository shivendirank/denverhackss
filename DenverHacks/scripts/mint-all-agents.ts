/**
 * Mint NFTs for all existing agents
 * Usage: npx ts-node scripts/mint-all-agents.ts
 */

import axios from "axios";
import "dotenv/config";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

interface Agent {
  id: string;
  name: string;
  wallet: string;
  verified: boolean;
}

async function main() {
  console.log("\n=== Minting NFTs for All Agents ===\n");

  // Validate environment
  if (!process.env.ZG_AGENT_NFT_CONTRACT || process.env.ZG_AGENT_NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "❌ ZG_AGENT_NFT_CONTRACT not set in .env\n" +
        "Deploy the contract first with: npm run contracts:deploy:zg"
    );
  }

  console.log(`API: ${API_BASE_URL}`);
  console.log(`Contract: ${process.env.ZG_AGENT_NFT_CONTRACT}\n`);

  // Fetch all agents
  console.log("📡 Fetching agents...");
  const agentsResponse = await axios.get<Agent[]>(`${API_BASE_URL}/api/agents`);
  const agents = agentsResponse.data;

  console.log(`Found ${agents.length} agents:\n`);
  agents.forEach((agent) => {
    console.log(`  • ${agent.name} (${agent.id})`);
    console.log(`    Wallet: ${agent.wallet}`);
  });

  // Check current minting status
  console.log("\n📋 Checking current NFT status...");
  const statusResponse = await axios.get(`${API_BASE_URL}/api/zg/agents/status`);
  const status = statusResponse.data;

  console.log(`\nStatus: ${status.minted}/${status.total} minted`);

  if (status.minted === status.total) {
    console.log("\n✅ All agents already have NFTs!");
    console.log("\nNFT Details:");
    status.agents.forEach((agent: any) => {
      console.log(`\n  ${agent.agentName}:`);
      console.log(`    Token ID: ${agent.tokenId}`);
      console.log(`    Reputation: ${agent.reputation}`);
      console.log(`    Explorer: ${agent.explorerUrl}`);
    });
    return;
  }

  // Mint for agents without NFTs
  console.log(`\n⛏️  Minting ${status.pending} NFTs...\n`);

  const results = [];
  for (const agent of agents) {
    const existing = status.agents.find((a: any) => a.agentId === agent.id);
    if (existing?.hasnft) {
      console.log(`  ⏭️  ${agent.name}: Already has NFT (Token #${existing.tokenId})`);
      results.push({ agent: agent.name, status: "skipped", tokenId: existing.tokenId });
      continue;
    }

    try {
      console.log(`  ⛏️  Minting NFT for ${agent.name}...`);
      const mintResponse = await axios.post(
        `${API_BASE_URL}/api/zg/agents/${agent.id}/mint`
      );
      const mintData = mintResponse.data;

      console.log(`    ✅ Token ID: ${mintData.tokenId}`);
      console.log(`    TX: ${mintData.txHash}`);
      console.log(`    Explorer: ${mintData.explorerUrl}`);

      results.push({
        agent: agent.name,
        status: "minted",
        tokenId: mintData.tokenId,
        txHash: mintData.txHash,
        explorerUrl: mintData.explorerUrl,
      });

      // Wait 2 seconds between mints to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.log(`    ❌ Failed: ${error.response?.data?.error || error.message}`);
      results.push({
        agent: agent.name,
        status: "failed",
        error: error.response?.data?.error || error.message,
      });
    }
  }

  // Summary
  console.log("\n=== Summary ===\n");
  const minted = results.filter((r) => r.status === "minted");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "failed");

  console.log(`✅ Minted: ${minted.length}`);
  console.log(`⏭️  Skipped: ${skipped.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (minted.length > 0) {
    console.log("\n🎉 Successfully Minted:");
    minted.forEach((r) => {
      console.log(`\n  ${r.agent}:`);
      console.log(`    Token ID: ${r.tokenId}`);
      console.log(`    Explorer: ${r.explorerUrl}`);
    });
  }

  if (failed.length > 0) {
    console.log("\n❌ Failed:");
    failed.forEach((r) => {
      console.log(`  • ${r.agent}: ${r.error}`);
    });
  }

  console.log("\n=== Next Steps ===");
  console.log("\n1. View NFTs on 0G Explorer:");
  console.log(`   https://explorer-testnet.0g.ai/address/${process.env.ZG_AGENT_NFT_CONTRACT}`);
  console.log("\n2. Check agent dashboard:");
  console.log(`   ${API_BASE_URL.replace("3000", "3002")}/dashboard`);
  console.log("\n3. View NFT data in API:");
  console.log(`   ${API_BASE_URL}/api/zg/agents/status`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
