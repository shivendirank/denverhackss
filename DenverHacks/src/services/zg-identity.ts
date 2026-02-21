/**
 * 0G Identity Service
 * Manages agent iNFT minting and action logging on 0G Chain
 */

import { encodeFunctionData, keccak256, toHex } from "viem";
import { zgPublicClient, zgWalletClient, getZgExplorerUrl, getZgNftUrl } from "../blockchain/zg-client.js";
import {
  getAgent,
  getAgentByWallet,
  type Agent,
} from "./in-memory-storage.js";

// AgentINFT ABI (matching contracts/AgentINFT.sol)
export const AGENT_NFT_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      {
        name: "metadata",
        type: "tuple",
        components: [
          { name: "agentId", type: "bytes32" },
          { name: "name", type: "string" },
          { name: "hcsTopicId", type: "string" },
          { name: "hederaAccountId", type: "string" },
          { name: "reputationScore", type: "uint256" },
          { name: "totalExecutions", type: "uint256" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "recordAgentAction",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "actionType", type: "string" },
      { name: "actionHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "updateReputation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newScore", type: "uint256" },
      { name: "newExecutions", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "walletToTokenId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "canUseTools",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "toolId", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getAgentActions",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "agentTokenId", type: "uint256" },
          { name: "actionType", type: "string" },
          { name: "actionHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "approved", type: "bool" },
          { name: "approver", type: "address" },
        ],
      },
    ],
  },
  {
    name: "agentReputation",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Get contract address from environment
 */
function getAgentNFTAddress(): string {
  const address = process.env.ZG_AGENT_NFT_CONTRACT;
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error("ZG_AGENT_NFT_CONTRACT not configured in .env");
  }
  return address;
}

/**
 * Mint Agent iNFT on 0G Chain
 * Called when a new agent is created
 */
export async function mintAgentNFT(agent: Agent): Promise<{
  tokenId: string;
  txHash: string;
  explorerUrl: string;
}> {
  try {
    if (!zgWalletClient) {
      console.warn("⚠️  No 0G wallet client - simulating NFT mint");
      return {
        tokenId: `${Date.now()}`,
        txHash: `0x${Math.random().toString(16).slice(2).padStart(64, "0")}`,
        explorerUrl: "https://explorer-testnet.0g.ai/tx/0x...",
      };
    }

    const contractAddress = getAgentNFTAddress() as `0x${string}`;

    // Prepare metadata
    const metadata = {
      agentId: keccak256(toHex(agent.id)) as `0x${string}`,
      name: agent.name,
      hcsTopicId: agent.hcsTopicId || "0.0.0",
      hederaAccountId: "0.0.0", // Placeholder
      reputationScore: BigInt(100), // Start at 100
      totalExecutions: BigInt(0),
      createdAt: BigInt(Math.floor(agent.createdAt / 1000)),
    };

    // Encode mint function call
    const data = encodeFunctionData({
      abi: AGENT_NFT_ABI,
      functionName: "mint",
      args: [agent.wallet as `0x${string}`, metadata],
    });

    // Submit transaction
    const txHash = await zgWalletClient.sendTransaction({
      to: contractAddress,
      data,
      chain: zgWalletClient.chain,
      account: zgWalletClient.account!,
    });

    console.log(`✅ Agent NFT minted on 0G Chain: ${txHash}`);

    // Wait for confirmation (optional in demo)
    const receipt = await zgPublicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    // Extract tokenId from events (simplified - parse logs in production)
    const tokenId = receipt.logs[0]?.topics[1] || `0x${Date.now().toString(16)}`;

    return {
      tokenId: BigInt(tokenId).toString(),
      txHash,
      explorerUrl: getZgExplorerUrl(txHash),
    };
  } catch (error: any) {
    console.error("Error minting agent NFT:", error);
    throw error;
  }
}

/**
 * Record agent action on-chain
 * Called after tool execution, payment, or state change
 */
export async function recordAgentAction(
  agentWallet: string,
  actionType: "TOOL_EXECUTION" | "PAYMENT" | "STATE_UPDATE",
  actionData: Record<string, any>
): Promise<{ txHash: string; actionHash: string } | null> {
  try {
    if (!zgWalletClient) {
      console.warn("⚠️  No 0G wallet client - skipping action logging");
      return null;
    }

    // Get agent's token ID
    const contractAddress = getAgentNFTAddress() as `0x${string}`;
    const tokenId = await zgPublicClient.readContract({
      address: contractAddress,
      abi: AGENT_NFT_ABI,
      functionName: "walletToTokenId",
      args: [agentWallet as `0x${string}`],
    });

    if (tokenId === 0n) {
      console.warn(`Agent ${agentWallet} has no NFT - skipping action log`);
      return null;
    }

    // Hash action data
    const actionHash = keccak256(toHex(JSON.stringify(actionData))) as `0x${string}`;

    // Encode recordAgentAction call
    const data = encodeFunctionData({
      abi: AGENT_NFT_ABI,
      functionName: "recordAgentAction",
      args: [tokenId, actionType, actionHash],
    });

    // Submit transaction
    const txHash = await zgWalletClient.sendTransaction({
      to: contractAddress,
      data,
      chain: zgWalletClient.chain,
      account: zgWalletClient.account!,
    });

    console.log(`✅ Action logged on 0G Chain: ${actionType} (tx: ${txHash})`);

    return {
      txHash,
      actionHash,
    };
  } catch (error: any) {
    console.error("Error recording agent action:", error);
    // Don't throw - action logging is non-critical
    return null;
  }
}

/**
 * Update agent reputation on-chain
 */
export async function updateAgentReputation(
  agentWallet: string,
  newScore: number,
  totalExecutions: number
): Promise<string | null> {
  try {
    if (!zgWalletClient) {
      console.warn("⚠️  No 0G wallet client - skipping reputation update");
      return null;
    }

    const contractAddress = getAgentNFTAddress() as `0x${string}`;
    const tokenId = await zgPublicClient.readContract({
      address: contractAddress,
      abi: AGENT_NFT_ABI,
      functionName: "walletToTokenId",
      args: [agentWallet as `0x${string}`],
    });

    if (tokenId === 0n) {
      console.warn(`Agent ${agentWallet} has no NFT`);
      return null;
    }

    const data = encodeFunctionData({
      abi: AGENT_NFT_ABI,
      functionName: "updateReputation",
      args: [tokenId, BigInt(newScore), BigInt(totalExecutions)],
    });

    const txHash = await zgWalletClient.sendTransaction({
      to: contractAddress,
      data,
      chain: zgWalletClient.chain,
      account: zgWalletClient.account!,
    });

    console.log(`✅ Reputation updated on 0G Chain: ${newScore} (tx: ${txHash})`);

    return txHash;
  } catch (error: any) {
    console.error("Error updating reputation:", error);
    return null;
  }
}

/**
 * Get agent's on-chain data from 0G
 */
export async function getAgentNFTData(agentWallet: string): Promise<{
  tokenId: string;
  reputation: number;
  actionCount: number;
  canUseTools: (toolId: string) => Promise<boolean>;
} | null> {
  try {
    const contractAddress = getAgentNFTAddress() as `0x${string}`;

    const tokenId = await zgPublicClient.readContract({
      address: contractAddress,
      abi: AGENT_NFT_ABI,
      functionName: "walletToTokenId",
      args: [agentWallet as `0x${string}`],
    });

    if (tokenId === 0n) {
      return null;
    }

    const reputation = await zgPublicClient.readContract({
      address: contractAddress,
      abi: AGENT_NFT_ABI,
      functionName: "agentReputation",
      args: [tokenId],
    });

    const actions = await zgPublicClient.readContract({
      address: contractAddress,
      abi: AGENT_NFT_ABI,
      functionName: "getAgentActions",
      args: [tokenId],
    });

    return {
      tokenId: tokenId.toString(),
      reputation: Number(reputation),
      actionCount: actions.length,
      canUseTools: async (toolId: string) => {
        const canUse = await zgPublicClient.readContract({
          address: contractAddress,
          abi: AGENT_NFT_ABI,
          functionName: "canUseTools",
          args: [tokenId, toolId],
        });
        return canUse;
      },
    };
  } catch (error: any) {
    console.error("Error fetching agent NFT data:", error);
    return null;
  }
}

/**
 * Get 0G Explorer URL for agent NFT
 */
export function getAgentNFTExplorerUrl(tokenId: string): string {
  return getZgNftUrl(getAgentNFTAddress(), parseInt(tokenId));
}
