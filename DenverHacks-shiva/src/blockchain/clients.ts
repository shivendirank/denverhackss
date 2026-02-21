import { createPublicClient, createWalletClient, http, publicActions, PublicClient, WalletClient, Client } from "viem";
import { baseSepolia } from "viem/chains";
import { config } from "@/config";

// Define custom chains for Kite AI and 0G since they're not in viem's default chain list
export const kiteTestnet = {
  id: config.KITE_CHAIN_ID,
  name: "KiteAI Testnet",
  network: "kiteTestnet",
  nativeCurrency: { name: "KITE", symbol: "KITE", decimals: 18 },
  rpcUrls: { default: { http: [config.KITE_RPC_URL] }, public: { http: [config.KITE_RPC_URL] } },
  blockExplorers: { default: { name: "Kitescan", url: "https://testnet.kitescan.ai" } },
  testnet: true,
};

export const zgTestnet = {
  id: config.ZG_CHAIN_ID,
  name: "0G-Galileo-Testnet",
  network: "zgTestnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: [config.ZG_RPC_URL] }, public: { http: [config.ZG_RPC_URL] } },
  blockExplorers: { default: { name: "Galileo Explorer", url: "https://chainscan-galileo.0g.ai" } },
  testnet: true,
};

// Public clients for reading (no signer)
export const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(config.BASE_RPC_URL),
});

export const kiteClient = createPublicClient({
  chain: kiteTestnet,
  transport: http(config.KITE_RPC_URL),
});

export const zgClient = createPublicClient({
  chain: zgTestnet,
  transport: http(config.ZG_RPC_URL),
});

// Wallet clients for writing (with signer)
const privateKey = `0x${config.RELAYER_PRIVATE_KEY.replace(/^0x/, "")}` as const;

export const baseWalletClient = createWalletClient({
  account: undefined,
  chain: baseSepolia,
  transport: http(config.BASE_RPC_URL),
}).extend(publicActions);

export const kiteWalletClient = createWalletClient({
  account: undefined,
  chain: kiteTestnet,
  transport: http(config.KITE_RPC_URL),
}).extend(publicActions);

export const zgWalletClient = createWalletClient({
  account: undefined,
  chain: zgTestnet,
  transport: http(config.ZG_RPC_URL),
}).extend(publicActions);

export async function healthCheck(): Promise<boolean> {
  try {
    const [baseBlock, kiteBlock, zgBlock] = await Promise.all([
      baseClient.getBlockNumber(),
      kiteClient.getBlockNumber(),
      zgClient.getBlockNumber(),
    ]);

    return baseBlock > 0n && kiteBlock > 0n && zgBlock > 0n;
  } catch {
    return false;
  }
}

export type Chain = "base" | "kite" | "zg";

export function getClientForChain(chain: Chain) {
  switch (chain) {
    case "base":
      return baseClient;
    case "kite":
      return kiteClient;
    case "zg":
      return zgClient;
  }
}

export function getWalletClientForChain(chain: Chain) {
  switch (chain) {
    case "base":
      return baseWalletClient;
    case "kite":
      return kiteWalletClient;
    case "zg":
      return zgWalletClient;
  }
}
