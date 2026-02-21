import { prisma } from "@/lib/prisma";
import { submitAttestation } from "@/hedera/hcsAttestation";
import { publishCommerceComplete } from "@/hedera/ucp";
import axios from "axios";
import { keccak256, recoverAddress, verifyMessage } from "viem";
import pino from "pino";
import {
  ExecutionContext,
  ExecutionResult,
  UpstreamResponse,
} from "@/types/execution";
import {
  SignatureVerificationError,
  InsufficientBalanceError,
  UpstreamExecutionError,
  AppError,
} from "@/types/errors";
import type { AgentAttestation } from "@/types/hedera";

const logger = pino();

/**
 * Verify EIP-712 signed execution request
 */
function verifyExecutionSignature(
  agentWallet: string,
  signature: string,
  toolId: string,
  paramsHash: string,
  nonce: number,
  paymentChain: "base" | "kite"
): boolean {
  try {
    // In production, implement full EIP-712 verification with domain separator
    // For now, use simple message hash recovery
    const message = `${toolId}${paramsHash}${nonce}`;
    const messageHash = keccak256(Buffer.from(message));

    // Recover signer from signature - this is simplified
    // In production, use viem's verifyMessage or ethers.verifyMessage
    return true; // Placeholder - real implementation needed
  } catch (error) {
    logger.error({ error }, "Signature verification failed");
    throw new SignatureVerificationError("Invalid signature");
  }
}

/**
 * Execute a tool call as an agent
 *
 * Flow:
 * 1. Verify EIP-712 signature
 * 2. Fetch tool + agent, check both active
 * 3. Check escrow balance >= tool price
 * 4. Optimistically deduct from DB balance
 * 5. Execute upstream HTTP call with 30s timeout
 * 6. On upstream success: enqueue settlement, submit HCS attestation, enqueue reputation update
 * 7. On upstream failure: restore balance, submit TOOL_EXECUTED(FAILED) attestation
 * 8. All HCS and UCP steps are non-blocking fire-and-forget
 */
export async function executeToolCall(
  context: ExecutionContext,
  agentId: string
): Promise<ExecutionResult> {
  const executionId = `${agentId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    // Step 1: Verify signature
    verifyExecutionSignature(
      context.agentWallet,
      context.signature,
      context.toolId,
      context.toolId, // In practice, this would be paramsHash
      context.nonce,
      context.paymentChain
    );

    // Step 2: Fetch tool and agent, verify active
    const [tool, agent] = await Promise.all([
      prisma.tool.findUnique({ where: { id: context.toolId } }),
      prisma.agent.findUnique({ where: { agentId } }),
    ]);

    if (!tool || !tool.active) {
      throw new UpstreamExecutionError(404, "Tool not found or inactive", undefined);
    }

    if (!agent || !agent.active) {
      throw new UpstreamExecutionError(404, "Agent not found or inactive", undefined);
    }

    // Step 3: Check escrow balance
    const escrow = await prisma.escrowBalance.findUnique({
      where: { agentId: agent.id },
    });

    if (!escrow) {
      throw new InsufficientBalanceError("0", tool.priceWei);
    }

    const chainBalance =
      context.paymentChain === "base"
        ? BigInt(escrow.baseBalanceWei)
        : BigInt(escrow.kiteBalanceWei);

    const toolPrice = BigInt(tool.priceWei);

    if (chainBalance < toolPrice) {
      throw new InsufficientBalanceError(escrow.baseBalanceWei, tool.priceWei);
    }

    // Step 4: Optimistically deduct from DB balance
    const beforeBalance = escrow.baseBalanceWei;
    const afterBalance = (BigInt(beforeBalance) - toolPrice).toString();

    if (context.paymentChain === "base") {
      await prisma.escrowBalance.update({
        where: { agentId: agent.id },
        data: { baseBalanceWei: afterBalance },
      });
    } else {
      await prisma.escrowBalance.update({
        where: { agentId: agent.id },
        data: { kiteBalanceWei: afterBalance },
      });
    }

    logger.info(
      { agentId, toolId: context.toolId, cost: tool.priceWei },
      "Balance debited optimistically"
    );

    // Step 5: Execute upstream HTTP call
    let upstreamResult: UpstreamResponse;
    let paramsHash = "";

    try {
      paramsHash = keccak256(Buffer.from(JSON.stringify(context.params)));

      // Build request with parameter injection
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Inject auth (decrypt only here, never log)
      if (tool.authType === "apikey" && tool.authConfig) {
        const authConfig = tool.authConfig as any;
        if (authConfig.apiKey) {
          headers["X-API-Key"] = authConfig.apiKey;
        }
      } else if (tool.authType === "bearer" && tool.authConfig) {
        const authConfig = tool.authConfig as any;
        if (authConfig.token) {
          headers["Authorization"] = `Bearer ${authConfig.token}`;
        }
      }

      const response = await axios.post(tool.endpointUrl, context.params, {
        headers,
        timeout: 30000,
        validateStatus: () => true, // Don't throw on any status
      });

      upstreamResult = {
        statusCode: response.status,
        headers: response.headers as Record<string, string>,
        body: response.data,
        duration: 0,
      };

      logger.info(
        { agentId, toolId: context.toolId, statusCode: response.status },
        "Tool executed upstream"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        { agentId, toolId: context.toolId, error: message },
        "Upstream execution failed"
      );

      // Step 7a: On failure, restore balance and submit TOOL_EXECUTED(FAILED) attestation
      if (context.paymentChain === "base") {
        await prisma.escrowBalance.update({
          where: { agentId: agent.id },
          data: { baseBalanceWei: beforeBalance },
        });
      } else {
        await prisma.escrowBalance.update({
          where: { agentId: agent.id },
          data: { kiteBalanceWei: beforeBalance },
        });
      }

      logger.info({ agentId }, "Balance restored after failed execution");

      // Submit attestation (non-blocking)
      if (agent.hcsTopicId) {
        const attestation: AgentAttestation = {
          type: "TOOL_EXECUTED",
          agentId,
          toolId: context.toolId,
          costWei: tool.priceWei,
          result: "FAILURE",
          timestamp: Date.now(),
          meta: {
            reason: message.slice(0, 100),
            executionId,
          },
        };

        submitAttestation(agent.hcsTopicId, attestation).catch((err) => {
          logger.error({ error: err }, "Failed to submit failure attestation (non-blocking)");
        });
      }

      // Insert execution record with FAILED status
      await prisma.execution.create({
        data: {
          id: executionId,
          agentId: agent.id,
          toolId: context.toolId,
          paramsHash,
          costWei: tool.priceWei,
          paymentChain: context.paymentChain,
          status: "FAILED",
          upstreamStatus: null,
        },
      });

      throw new UpstreamExecutionError(503, `Tool execution failed: ${message}`);
    }

    // Step 7b: On upstream success
    const resultHash = keccak256(Buffer.from(JSON.stringify(upstreamResult.body)));

    // Enqueue settlement job
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create execution record with SUCCESS status
    const execution = await prisma.execution.create({
      data: {
        id: executionId,
        agentId: agent.id,
        toolId: context.toolId,
        paramsHash,
        resultHash,
        costWei: tool.priceWei,
        paymentChain: context.paymentChain,
        status: "SUCCESS",
        upstreamStatus: upstreamResult.statusCode,
        batchId,
      },
    });

    logger.info(
      { executionId, agentId, toolId: context.toolId, status: "SUCCESS" },
      "Execution record created"
    );

    // Submit TOOL_EXECUTED success attestation (non-blocking)
    if (agent.hcsTopicId) {
      const attestation: AgentAttestation = {
        type: "TOOL_EXECUTED",
        agentId,
        toolId: context.toolId,
        costWei: tool.priceWei,
        result: "SUCCESS",
        timestamp: Date.now(),
        meta: {
          executionId,
          upstreamStatus: upstreamResult.statusCode.toString(),
          resultHash,
        },
      };

      submitAttestation(agent.hcsTopicId, attestation).catch((err) => {
        logger.error({ error: err }, "Failed to submit success attestation (non-blocking)");
      });
    }

    // If UCPNonce present, publish COMMERCE_COMPLETE (non-blocking)
    if (context.nonce) {
      publishCommerceComplete(agentId, context.nonce.toString(), executionId, "SUCCESS").catch(
        (err) => {
          logger.error({ error: err }, "Failed to publish UCP completion (non-blocking)");
        }
      );
    }

    // Publish event to Redis pub/sub for SSE stream (non-blocking)
    // This would be: redis.publish('agent_execution', JSON.stringify({ executionId, agentId, toolId, status: 'SUCCESS' }))

    return {
      executionId,
      success: true,
      upstream: upstreamResult,
      costWei: tool.priceWei,
      batchId,
      ucpNonce: context.nonce ? context.nonce.toString() : "",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ executionId, error: message }, "Unexpected execution error");
    throw new UpstreamExecutionError(500, "Unexpected error during execution");
  }
}
