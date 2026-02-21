import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  // App
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // Relayer private key (used across all EVM chains)
  RELAYER_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/),

  // Base Sepolia
  BASE_RPC_URL: z.string().url(),
  BASE_CHAIN_ID: z.coerce.number().default(84532),
  BASE_TOOL_REGISTRY_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  BASE_ESCROW_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  BASE_USAGE_LOG_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),

  // Kite AI Testnet
  KITE_RPC_URL: z.string().url(),
  KITE_CHAIN_ID: z.coerce.number(),
  KITE_TOOL_REGISTRY_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  KITE_ESCROW_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),

  // 0G Testnet
  ZG_RPC_URL: z.string().url(),
  ZG_CHAIN_ID: z.coerce.number(),
  ZG_AGENT_NFT_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  ZG_STORAGE_API_URL: z.string().url(),

  // Hedera
  HEDERA_NETWORK: z.enum(["mainnet", "testnet", "previewnet"]).default("testnet"),
  HEDERA_ACCOUNT_ID: z.string().regex(/^0\.0\.\d+$/),
  HEDERA_PRIVATE_KEY: z.string(),
  HEDERA_AGENT_TOKEN_ID: z.string().regex(/^0\.0\.\d+$/).optional(),
  HEDERA_UCP_REGISTRY_TOPIC: z.string().regex(/^0\.0\.\d+$/).optional(),
});

type Config = z.infer<typeof configSchema>;

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten();
    const missingFields = Object.keys(errors.fieldErrors);
    console.error(
      `❌ Missing or invalid environment variables:\n${missingFields
        .map((field) => `  ${field}: ${errors.fieldErrors[field as keyof typeof errors.fieldErrors]}`)
        .join("\n")}`
    );
    // In development, continue with partial config
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Running in development mode with partial config");
      cachedConfig = {} as Config;
      return cachedConfig;
    }
    process.exit(1);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export const config = loadConfig();

export default config;
