import { createPublicClient, createWalletClient, http, publicActions } from "viem";
import { baseSepolia } from "viem/chains";

// Define custom chains for Kite AI and 0G since they're not in viem's default chain list
export const kiteTestnet = {
  id: 2368,
  name: "KiteAI Testnet",
  network: "kiteTestnet",
  nativeCurrency: { name: "KITE", symbol: "KITE", decimals: 18 },
  rpcUrls: { 
    default: { http: ["https://rpc-testnet.gokite.ai/"] }, 
    public: { http: ["https://rpc-testnet.gokite.ai/"] } 
  },
  blockExplorers: { 
    default: { name: "Kitescan", url: "https://testnet.kitescan.ai" } 
  },
  testnet: true,
} as const;

export const zgTestnet = {
  id: 16602,
  name: "0G-Galileo-Testnet",
  network: "zgTestnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { 
    default: { http: ["https://rpc-testnet.0g.ai"] }, 
    public: { http: ["https://rpc-testnet.0g.ai"] } 
  },
  blockExplorers: { 
    default: { name: "Galileo Explorer", url: "https://chainscan-galileo.0g.ai" } 
  },
  testnet: true,
} as const;

// Public clients for reading (no signer)
export const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_RPC_URL || "https://sepolia.base.org"),
});

export const kiteClient = createPublicClient({
  chain: kiteTestnet,
  transport: http("https://rpc-testnet.gokite.ai/"),
});

export const zgClient = createPublicClient({
  chain: zgTestnet,
  transport: http(process.env.ZG_RPC_URL || "https://rpc-testnet.0g.ai"),
});

// Wallet clients for writing (with signer) - only if private key is provided
const privateKey = process.env.RELAYER_PRIVATE_KEY;

export const baseWalletClient = privateKey
  ? createWalletClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_RPC_URL || "https://sepolia.base.org"),
    }).extend(publicActions)
  : null;

export const kiteWalletClient = privateKey
  ? createWalletClient({
      chain: kiteTestnet,
      transport: http("https://rpc-testnet.gokite.ai/"),
    }).extend(publicActions)
  : null;

export const zgWalletClient = privateKey
  ? createWalletClient({
      chain: zgTestnet,
      transport: http(process.env.ZG_RPC_URL || "https://rpc-testnet.0g.ai"),
    }).extend(publicActions)
  : null;

export async function healthCheck(): Promise<boolean> {
  try {
    const [baseBlock, kiteBlock] = await Promise.all([
      baseClient.getBlockNumber().catch(() => 0n),
      kiteClient.getBlockNumber().catch(() => 0n),
    ]);

    return baseBlock > 0n && kiteBlock > 0n;
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
