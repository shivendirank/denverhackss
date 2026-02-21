/**
 * 0G Chain Client Configuration
 * Extends blockchain clients with 0G Chain support for iNFT operations
 */

import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// 0G Chain configuration
export const zgChain = {
  id: 16602, // 0G Newton Testnet
  name: "0G Newton Testnet",
  network: "0g-newton-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "A0GI",
    symbol: "A0GI",
  },
  rpcUrls: {
    default: {
      http: [process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai"],
    },
    public: {
      http: [process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://explorer-testnet.0g.ai",
    },
  },
  testnet: true,
} as const;

/**
 * Public client for reading 0G Chain state
 */
export const zgPublicClient: PublicClient = createPublicClient({
  chain: zgChain,
  transport: http(zgChain.rpcUrls.default.http[0]),
});

/**
 * Wallet client for writing to 0G Chain (requires RELAYER_PRIVATE_KEY)
 */
export function createZgWalletClient(): WalletClient | null {
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  
  if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.warn("⚠️  No valid RELAYER_PRIVATE_KEY for 0G Chain. Read-only mode.");
    return null;
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: zgChain,
    transport: http(zgChain.rpcUrls.default.http[0]),
  });
}

export const zgWalletClient = createZgWalletClient();

/**
 * Get 0G Explorer URL for transaction
 */
export function getZgExplorerUrl(txHash: string): string {
  return `${zgChain.blockExplorers.default.url}/tx/${txHash}`;
}

/**
 * Get 0G Explorer URL for NFT token
 */
export function getZgNftUrl(contractAddress: string, tokenId: number): string {
  return `${zgChain.blockExplorers.default.url}/token/${contractAddress}?a=${tokenId}`;
}

/**
 * Format 0G token amount (18 decimals)
 */
export function formatZgToken(wei: string): string {
  try {
    const weiValue = BigInt(wei);
    const tokens = Number(weiValue) / 1e18;
    return tokens.toFixed(4);
  } catch {
    return "0.0000";
  }
}
