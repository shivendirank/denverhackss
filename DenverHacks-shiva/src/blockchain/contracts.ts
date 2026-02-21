import { getContractAddress } from "viem";
import { config } from "@/config";

// Tool Registry ABI
export const TOOL_REGISTRY_ABI = [
  {
    name: "registerTool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "metadataURI", type: "string" },
      { name: "pricePerCallWei", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "updatePricing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "toolId", type: "bytes32" },
      { name: "newPrice", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "deactivateTool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "toolId", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "getTool",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "toolId", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "metadataURI", type: "string" },
          { name: "pricePerCallWei", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
  },
] as const;

// Escrow ABI
export const ESCROW_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "debit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agent", type: "address" },
      { name: "toolOwner", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "agentBalances",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ownerEarnings",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "setRelayer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_newRelayer", type: "address" }],
    outputs: [],
  },
] as const;

// AgentNFT ABI
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
    name: "setRelayer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_newRelayer", type: "address" }],
    outputs: [],
  },
] as const;

// UsageLog ABI
export const USAGE_LOG_ABI = [
  {
    name: "logUsage",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "toolId", type: "bytes32" },
      { name: "paramsHash", type: "bytes32" },
      { name: "cost", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "setRelayer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_newRelayer", type: "address" }],
    outputs: [],
  },
] as const;

// Contract address getters - these come from deployments/{network}.json at startup
export interface ContractAddresses {
  toolRegistry?: string;
  escrow?: string;
  usageLog?: string;
  agentNFT?: string;
}

export const contractAddresses: { [key: string]: ContractAddresses } = {
  base: {
    toolRegistry: config.BASE_TOOL_REGISTRY_CONTRACT,
    escrow: config.BASE_ESCROW_CONTRACT,
    usageLog: config.BASE_USAGE_LOG_CONTRACT,
  },
  kite: {
    toolRegistry: config.KITE_TOOL_REGISTRY_CONTRACT,
    escrow: config.KITE_ESCROW_CONTRACT,
  },
  zg: {
    agentNFT: config.ZG_AGENT_NFT_CONTRACT,
  },
};

export function getContractAddressForChain(chain: "base" | "kite" | "zg", contractType: string): string {
  const address = contractAddresses[chain]?.[contractType as keyof ContractAddresses];
  if (!address) {
    throw new Error(`No ${contractType} contract address configured for ${chain}`);
  }
  return address;
}
