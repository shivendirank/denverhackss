import { getWalletClientForChain, baseWalletClient, kiteWalletClient, zgWalletClient } from "./clients";
import { config } from "@/config";
import Redis from "ioredis";
import { encodeFunctionData, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import pino from "pino";

const logger = pino();
const redis = new Redis(config.REDIS_URL, { lazyConnect: true });
redis.on("error", () => {}); // Suppress errors

class NonceManager {
  async acquireLock(chainId: number, timeout = 30000): Promise<string> {
    const lockKey = `nonce:lock:${chainId}`;
    const lockId = `${Date.now()}-${Math.random()}`;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const acquired = await redis.set(lockKey, lockId, "PX", 10000, "NX");
      if (acquired === "OK") return lockId;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Failed to acquire nonce lock for chain ${chainId}`);
  }

  async releaseLock(chainId: number, lockId: string): Promise<void> {
    const lockKey = `nonce:lock:${chainId}`;
    const current = await redis.get(lockKey);
    if (current === lockId) {
      await redis.del(lockKey);
    }
  }

  async getNonce(chainId: number): Promise<number> {
    const key = `nonce:${chainId}`;
    const current = await redis.get(key);
    const nonce = current ? parseInt(current, 10) : 0;

    // Query chain to sync nonce if this is first call
    if (!current) {
      const walletClient = getWalletClientForChain(this.getChainKey(chainId));
      const relayerAccount = privateKeyToAccount(
        `0x${config.RELAYER_PRIVATE_KEY.replace(/^0x/, "")}`
      );
      try {
        const realNonce = await walletClient.getTransactionCount({
          address: relayerAccount.address,
        });
        await redis.set(key, realNonce.toString());
        return realNonce;
      } catch {
        return 0;
      }
    }

    return nonce;
  }

  async incrementNonce(chainId: number): Promise<number> {
    const key = `nonce:${chainId}`;
    const newNonce = await redis.incr(key);
    return newNonce - 1;
  }

  private getChainKey(chainId: number): "base" | "kite" | "zg" {
    if (chainId === 84532) return "base";
    if (chainId === config.KITE_CHAIN_ID) return "kite";
    if (chainId === config.ZG_CHAIN_ID) return "zg";
    throw new Error(`Unknown chain ID: ${chainId}`);
  }
}

const nonceManager = new NonceManager();

interface TransactionSubmitParams {
  chain: "base" | "kite" | "zg";
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
}

interface TransactionSubmitResult {
  txHash: string;
  nonce: number;
  gasLimit: string;
}

export async function submitTransaction(
  params: TransactionSubmitParams,
  retryCount = 0
): Promise<TransactionSubmitResult> {
  const chainId =
    params.chain === "base"
      ? 84532
      : params.chain === "kite"
        ? config.KITE_CHAIN_ID
        : config.ZG_CHAIN_ID;

  let lockId: string | undefined;

  try {
    lockId = await nonceManager.acquireLock(chainId);

    const walletClient = getWalletClientForChain(params.chain);
    const relayerAccount = privateKeyToAccount(
      `0x${config.RELAYER_PRIVATE_KEY.replace(/^0x/, "")}`
    );
    const nonce = await nonceManager.getNonce(chainId);

    // Estimate gas with 20% buffer
    let estimatedGas = 100000n;
    try {
      estimatedGas = await walletClient.estimateGas({
        account: relayerAccount,
        to: params.to,
        data: params.data,
        value: params.value ? BigInt(params.value) : 0n,
      });
      estimatedGas = (estimatedGas * 120n) / 100n;
    } catch (error) {
      logger.warn({ chain: params.chain, error }, "Gas estimation failed, using fallback");
    }

    // Get base fee and set maxPriorityFeePerGas
    let maxFeePerGas = parseGwei("50");
    let maxPriorityFeePerGas = parseGwei("1.5");

    try {
      const block = await walletClient.getBlock({ blockTag: "latest" });
      if (block.baseFeePerGas) {
        maxFeePerGas = block.baseFeePerGas + parseGwei("2");
      }
    } catch {
      logger.warn("Fee estimation failed, using fallback");
    }

    // Determine wallet client based on chain
    const selectedWalletClient = 
      params.chain === "base" ? baseWalletClient :
      params.chain === "kite" ? kiteWalletClient :
      zgWalletClient;

    // Submit transaction via walletClient.sendTransaction
    const txHash = await (selectedWalletClient as any).sendTransaction({
      account: relayerAccount,
      to: params.to,
      data: params.data as `0x${string}`,
      value: params.value ? BigInt(params.value) : 0n,
      gas: estimatedGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    });

    logger.info(
      {
        chain: params.chain,
        txHash,
        nonce,
        gasLimit: estimatedGas.toString(),
      },
      "Transaction submitted"
    );

    // Increment nonce for next call
    await nonceManager.incrementNonce(chainId);

    // Release lock immediately after submission (not after confirmation)
    if (lockId) {
      await nonceManager.releaseLock(chainId, lockId);
    }

    return {
      txHash,
      nonce,
      gasLimit: estimatedGas.toString(),
    };
  } catch (error) {
    logger.error(
      {
        error,
        chain: params.chain,
        to: params.to,
        retryCount,
      },
      "Transaction submission failed"
    );

    // Release lock on error
    if (lockId !== undefined) {
      await nonceManager.releaseLock(chainId, lockId);
    }

    // Retry logic with exponential backoff for specific errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      (errorMessage.includes("nonce too low") ||
        errorMessage.includes("replacement underpriced")) &&
      retryCount < 3
    ) {
      const delay = Math.pow(2, retryCount) * 1000;
      logger.warn(
        { delay, retryCount },
        "Retrying transaction after nonce/replacement error"
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return submitTransaction(params, retryCount + 1);
    }

    throw error;
  }
}

export { NonceManager, nonceManager };
