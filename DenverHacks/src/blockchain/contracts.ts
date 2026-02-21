import type { Chain } from "./clients.js";

// Escrow Contract ABI (simplified - only functions we need)
export const ESCROW_ABI = [
  {
    inputs: [
      { name: "agent", type: "address" },
      { name: "toolOwner", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "debit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agent", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Tool Registry Contract ABI (simplified)
export const TOOL_REGISTRY_ABI = [
  {
    inputs: [{ name: "toolId", type: "string" }],
    name: "getTool",
    outputs: [
      { name: "owner", type: "address" },
      { name: "priceWei", type: "uint256" },
      { name: "apiEndpoint", type: "string" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "toolId", type: "string" },
      { name: "priceWei", type: "uint256" },
      { name: "apiEndpoint", type: "string" },
    ],
    name: "registerTool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Contract addresses by chain (will be loaded from environment variables)
export function getContractAddressForChain(
  chain: Chain,
  contract: "escrow" | "toolRegistry"
): string {
  const addresses: Record<Chain, Record<string, string>> = {
    base: {
      escrow: process.env.BASE_ESCROW_CONTRACT || "0x0000000000000000000000000000000000000000",
      toolRegistry: process.env.BASE_TOOL_REGISTRY_CONTRACT || "0x0000000000000000000000000000000000000000",
    },
    kite: {
      escrow: process.env.KITE_ESCROW_CONTRACT || "0x0000000000000000000000000000000000000000",
      toolRegistry: process.env.KITE_TOOL_REGISTRY_CONTRACT || "0x0000000000000000000000000000000000000000",
    },
    zg: {
      escrow: "0x0000000000000000000000000000000000000000",
      toolRegistry: "0x0000000000000000000000000000000000000000",
    },
  };

  return addresses[chain][contract] || "0x0000000000000000000000000000000000000000";
}
