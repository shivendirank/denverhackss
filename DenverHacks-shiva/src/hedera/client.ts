import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import { config } from "@/config";
import pino from "pino";

const logger = pino();

let hederaClient: Client | null = null;

export function initializeHederaClient(): Client {
  if (hederaClient) return hederaClient;

  try {
    // Use the correct Hedera SDK static methods for standard networks
    if (config.HEDERA_NETWORK === "mainnet") {
      hederaClient = Client.forMainnet();
    } else if (config.HEDERA_NETWORK === "previewnet") {
      hederaClient = Client.forPreviewnet();
    } else {
      hederaClient = Client.forTestnet();
    }

    if (!hederaClient) {
      throw new Error("Failed to create Hedera client");
    }

    const operatorId = AccountId.fromString(config.HEDERA_ACCOUNT_ID);
    let operatorKey: PrivateKey;

    // Try to parse as DER first, fall back to hex string
    try {
      operatorKey = PrivateKey.fromStringDer(config.HEDERA_PRIVATE_KEY);
    } catch {
      // If DER parsing fails, try hex string (without 0x prefix)
      const hexKey = config.HEDERA_PRIVATE_KEY.replace(/^0x/, "");
      operatorKey = PrivateKey.fromString(hexKey);
    }

    hederaClient.setOperator(operatorId, operatorKey);

    logger.info(
      {
        operatorId: config.HEDERA_ACCOUNT_ID,
        network: config.HEDERA_NETWORK,
      },
      "Hedera client initialized"
    );

    return hederaClient!;
  } catch (error) {
    logger.error({ error }, "Failed to initialize Hedera client");
    throw error;
  }
}

export function getHederaClient(): Client {
  if (!hederaClient) {
    return initializeHederaClient();
  }
  return hederaClient;
}

export async function closeHederaClient(): Promise<void> {
  if (hederaClient) {
    await hederaClient.close();
    hederaClient = null;
    logger.info("Hedera client closed");
  }
}

export function getOperatorAccountId(): string {
  return config.HEDERA_ACCOUNT_ID;
}

export function getOperatorPrivateKey(): string {
  return config.HEDERA_PRIVATE_KEY;
}

export function getAgentTokenId(): string | undefined {
  return config.HEDERA_AGENT_TOKEN_ID;
}

/**
 * Robustly parse any Hedera private key string (DER, hex, or 0x-prefixed hex)
 */
export function parsePrivateKey(raw: string): PrivateKey {
  try {
    return PrivateKey.fromStringDer(raw);
  } catch {
    const hex = raw.replace(/^0x/, "");
    return PrivateKey.fromString(hex);
  }
}

export function getUCPRegistryTopic(): string | undefined {
  return config.HEDERA_UCP_REGISTRY_TOPIC;
}
