import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.RELAYER_PRIVATE_KEY ? [process.env.RELAYER_PRIVATE_KEY] : [],
      chainId: 84532,
    },
    kiteTestnet: {
      url: process.env.KITE_RPC_URL || "https://rpc-testnet.gokite.ai",
      accounts: process.env.RELAYER_PRIVATE_KEY ? [process.env.RELAYER_PRIVATE_KEY] : [],
      chainId: Number(process.env.KITE_CHAIN_ID) || 2368,
    },
    zgTestnet: {
      url: process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts: process.env.RELAYER_PRIVATE_KEY ? [process.env.RELAYER_PRIVATE_KEY] : [],
      chainId: Number(process.env.ZG_CHAIN_ID) || 16602,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "",
      kiteTestnet: process.env.KITE_EXPLORER_API_KEY || "",
      zgTestnet: process.env.ZG_EXPLORER_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./.hardhat/cache",
    artifacts: "./.hardhat/artifacts",
  },
};

export default config;
