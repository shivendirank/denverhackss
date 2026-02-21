require("dotenv/config");
require("@nomicfoundation/hardhat-viem");

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable for large contracts like AgentINFT
    },
  },
  networks: {
    zgTestnet: {
      url: process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts: process.env.RELAYER_PRIVATE_KEY ? [process.env.RELAYER_PRIVATE_KEY] : [],
      chainId: Number(process.env.ZG_CHAIN_ID) || 16602,
    },
    kiteTestnet: {
      url: process.env.KITE_RPC_URL || "https://rpc-testnet.gokite.ai",
      accounts: process.env.RELAYER_PRIVATE_KEY ? [process.env.RELAYER_PRIVATE_KEY] : [],
      chainId: Number(process.env.KITE_CHAIN_ID) || 2368,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./.hardhat/cache",
    artifacts: "./.hardhat/artifacts",
  },
};

module.exports = config;
