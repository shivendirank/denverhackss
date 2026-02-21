/**
 * Deploy AgentINFT.sol to 0G Chain
 * Usage: HARDHAT_NETWORK=zgTestnet npx ts-node scripts/deploy-0g.ts
 */

import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

// 0G Newton Testnet chain definition
const zgTestnet = defineChain({
  id: 16602,
  name: "0G Newton Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.ZG_RPC_URL ?? "https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://explorer-testnet.0g.ai",
    },
  },
});

/**
 * Get compiled contract artifact
 */
function getArtifact(contractName: string) {
  const artifactPath = resolve(
    ".hardhat/artifacts/contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  try {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
    return {
      abi: artifact.abi as unknown[],
      bytecode: artifact.bytecode as `0x${string}`,
    };
  } catch (error) {
    throw new Error(
      `Failed to load artifact for ${contractName}. ` +
        `Make sure you've compiled with: npx hardhat compile`
    );
  }
}

async function main() {
  console.log("\n=== 0G Agent iNFT Deployment ===\n");

  // Validate environment
  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    throw new Error(
      "RELAYER_PRIVATE_KEY not set in .env\n" +
        "Get 0G testnet funds from: https://faucet.0g.ai"
    );
  }

  // Setup client
  const account = privateKeyToAccount(privateKey);
  const transport = http(zgTestnet.rpcUrls.default.http[0]);
  const walletClient = createWalletClient({
    account,
    chain: zgTestnet,
    transport,
  });
  const publicClient = createPublicClient({
    chain: zgTestnet,
    transport,
  });

  console.log(`Deploying from: ${account.address}`);
  console.log(`Chain: ${zgTestnet.name} (ID: ${zgTestnet.id})`);
  console.log(`RPC: ${zgTestnet.rpcUrls.default.http[0]}`);

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  const balanceFormatted = (Number(balance) / 1e18).toFixed(4);
  console.log(`Balance: ${balanceFormatted} OG\n`);

  if (balance === 0n) {
    throw new Error(
      "❌ Wallet has no funds!\n" +
        "Get 0G testnet tokens from: https://faucet.0g.ai"
    );
  }

  // Deploy AgentINFT
  console.log("📦 Deploying AgentINFT.sol...\n");
  const { abi, bytecode } = getArtifact("AgentINFT");

  const deployHash = await walletClient.deployContract({
    abi,
    bytecode,
    // No constructor args - uses msg.sender as owner
  } as any);

  console.log(`Transaction: ${deployHash}`);
  console.log(`Explorer: ${zgTestnet.blockExplorers?.default.url}/tx/${deployHash}\n`);

  console.log("⏳ Waiting for confirmation (this may take 2-3 minutes on 0G testnet)...");
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
    confirmations: 2,
    timeout: 300_000, // 5 minutes timeout for 0G testnet
  });

  if (!receipt.contractAddress) {
    throw new Error("❌ Deployment failed - no contract address in receipt");
  }

  console.log("\n✅ AgentINFT deployed successfully!");
  console.log(`\nContract Address: ${receipt.contractAddress}`);
  console.log(`Explorer: ${zgTestnet.blockExplorers?.default.url}/address/${receipt.contractAddress}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);

  // Save deployment info
  const deploymentsDir = resolve("deployments");
  mkdirSync(deploymentsDir, { recursive: true });

  const deployment = {
    network: "0g-testnet",
    chainId: zgTestnet.id,
    agentINFT: receipt.contractAddress,
    deployer: account.address,
    deployedAt: new Date().toISOString(),
    txHash: deployHash,
    explorerUrl: `${zgTestnet.blockExplorers?.default.url}/address/${receipt.contractAddress}`,
  };

  const deploymentFile = resolve(deploymentsDir, "0g-testnet.json");
  writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));

  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);

  // Update .env instructions
  console.log("\n=== Next Steps ===");
  console.log("\n1. Add to your .env file:");
  console.log(`ZG_AGENT_NFT_CONTRACT=${receipt.contractAddress}`);
  console.log(`ZG_RPC_URL=${zgTestnet.rpcUrls.default.http[0]}`);
  console.log(`ZG_CHAIN_ID=${zgTestnet.id}`);
  console.log("\n2. Restart your backend server");
  console.log("\n3. Mint NFTs for your agents:");
  console.log("   POST http://localhost:3000/api/zg/agents/:id/mint");
  console.log("\n4. View on 0G Explorer:");
  console.log(`   ${zgTestnet.blockExplorers?.default.url}/address/${receipt.contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
