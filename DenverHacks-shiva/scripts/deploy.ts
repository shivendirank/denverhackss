import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

const kiteTestnet = defineChain({
  id: 2368,
  name: "Kite AI Testnet",
  nativeCurrency: { name: "KITE", symbol: "KITE", decimals: 18 },
  rpcUrls: { default: { http: [process.env.KITE_RPC_URL ?? "https://rpc-testnet.gokite.ai"] } },
});

const zgTestnet = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "OG", decimals: 18 },
  rpcUrls: { default: { http: [process.env.ZG_RPC_URL ?? "https://evmrpc-testnet.0g.ai"] } },
});

const allChains: Record<string, ReturnType<typeof defineChain>> = {
  baseSepolia,
  kiteTestnet,
  zgTestnet,
};

const deploymentConfig: Record<string, { contracts: string[] }> = {
  baseSepolia: { contracts: ["ToolRegistry", "Escrow", "UsageLog"] },
  kiteTestnet: { contracts: ["ToolRegistry", "Escrow"] },
  zgTestnet: { contracts: ["AgentNFT"] },
};

function getArtifact(contractName: string) {
  const artifactPath = resolve(
    ".hardhat/artifacts/contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  return { abi: artifact.abi as unknown[], bytecode: artifact.bytecode as `0x${string}` };
}

async function main() {
  const networkName = process.env.HARDHAT_NETWORK ?? "baseSepolia";
  const config = deploymentConfig[networkName];
  if (!config) throw new Error(`Unsupported network: ${networkName}`);
  const chain = allChains[networkName];
  if (!chain) throw new Error(`Chain not configured for: ${networkName}`);
  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) throw new Error("RELAYER_PRIVATE_KEY not set");

  const account = privateKeyToAccount(privateKey);
  const transport = http(chain.rpcUrls.default.http[0]);
  const walletClient = createWalletClient({ account, chain, transport });
  const publicClient = createPublicClient({ chain, transport });

  console.log(`\n=== Deploying to ${networkName} (chain ${chain.id}) ===`);
  console.log(`Relayer address: ${account.address}`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Balance: ${Number(balance) / 1e18} ${chain.nativeCurrency.symbol}`);
  if (balance === 0n) throw new Error("Wallet has no funds on this chain!");

  const deployments: Record<string, string> = {
    network: networkName,
    deployedAt: new Date().toISOString(),
  };

  async function deploy(contractName: string, constructorArgs: unknown[] = []) {
    console.log(`\nDeploying ${contractName}...`);
    const { abi, bytecode } = getArtifact(contractName);
    const hash = await walletClient.deployContract({ abi, bytecode, args: constructorArgs } as any);
    console.log(`  tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (!receipt.contractAddress) throw new Error(`${contractName} deployment failed`);
    console.log(`Deployed ${contractName}: ${receipt.contractAddress}`);
    return receipt.contractAddress;
  }

  if (config.contracts.includes("ToolRegistry")) deployments["toolRegistry"] = await deploy("ToolRegistry");
  if (config.contracts.includes("Escrow")) deployments["escrow"] = await deploy("Escrow", [account.address]);
  if (config.contracts.includes("UsageLog")) deployments["usageLog"] = await deploy("UsageLog", [account.address]);
  if (config.contracts.includes("AgentNFT")) deployments["agentNFT"] = await deploy("AgentNFT", [account.address]);

  const deploymentsDir = resolve("deployments");
  mkdirSync(deploymentsDir, { recursive: true });
  const deploymentFile = resolve(deploymentsDir, `${networkName}.json`);
  writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));
  console.log(`\nDeployments saved to: ${deploymentFile}`);
  console.log("Summary:", JSON.stringify(deployments, null, 2));
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
