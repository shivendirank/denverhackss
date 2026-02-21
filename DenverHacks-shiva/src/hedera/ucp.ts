import { v4 as uuidv4 } from "uuid";
import { getHederaClient, getUCPRegistryTopic, getOperatorPrivateKey } from "./client";
import { submitAttestation } from "./hcsAttestation";
import type {
  UCPCapabilityAd,
  UCPCommerceRequest,
  UCPCommerceAccept,
  UCPCommerceComplete,
  UCPMessagePayload,
} from "@/types/ucp";
import type { AgentAttestation } from "@/types/hedera";
import { UCPNonceConflictError, HederaError } from "@/types/errors";
import { prisma } from "@/lib/prisma";
import pino from "pino";

const logger = pino();

/**
 * Publish a capability advertisement to UCP registry topic
 * This tells other agents what tools this agent can execute
 */
export async function publishCapabilityAd(
  agentId: string,
  tools: Array<{ toolId: string; name: string; description: string; priceWei: string }>
): Promise<void> {
  try {
    const registryTopicId = getUCPRegistryTopic();
    if (!registryTopicId) {
      logger.warn("UCP registry topic not configured, skipping capability ad");
      return;
    }

    const ad: UCPCapabilityAd = {
      type: "CAPABILITY_AD",
      agentId,
      tools,
      timestamp: Date.now(),
    };

    const attestation: AgentAttestation = {
      type: "TOOL_EXECUTED", // Reuse attestation type for HCS recording
      agentId,
      result: "SUCCESS",
      timestamp: Date.now(),
      meta: {
        ucpMessageType: "CAPABILITY_AD",
        toolCount: tools.length.toString(),
      },
    };

    await submitAttestation(registryTopicId, attestation);
    logger.info({ agentId, toolCount: tools.length }, "Capability advertisement published");
  } catch (error) {
    logger.error({ agentId, error }, "Failed to publish capability ad (non-blocking)");
  }
}

/**
 * Initiate commerce request from one agent to another
 * Returns nonce for tracking the request
 */
export async function publishCommerceRequest(
  fromAgentId: string,
  toAgentId: string,
  toolId: string,
  offerAmount: string
): Promise<string> {
  try {
    const nonce = `${fromAgentId}-${uuidv4()}`;

    const request: UCPCommerceRequest = {
      type: "COMMERCE_REQUEST",
      nonce,
      fromAgentId,
      toAgentId,
      toolId,
      offerAmount,
      timestamp: Date.now(),
    };

    // Check for nonce conflict
    const existingMessage = await prisma.uCPMessage.findUnique({
      where: { nonce },
    });

    if (existingMessage) {
      throw new UCPNonceConflictError(nonce);
    }

    // Store request in DB
    await prisma.uCPMessage.create({
      data: {
        id: nonce,
        type: "COMMERCE_REQUEST",
        fromAgentId,
        toAgentId,
        toolId,
        nonce,
        offerAmount,
        status: "PENDING",
      },
    });

    // Publish to UCP registry topic
    const registryTopicId = getUCPRegistryTopic();
    if (registryTopicId) {
      const attestation: AgentAttestation = {
        type: "TOOL_EXECUTED",
        agentId: fromAgentId,
        toolId,
        costWei: offerAmount,
        result: "SUCCESS",
        timestamp: Date.now(),
        meta: {
          ucpMessageType: "COMMERCE_REQUEST",
          toAgentId,
          nonce,
        },
      };

      await submitAttestation(registryTopicId, attestation);
    }

    logger.info(
      { fromAgentId, toAgentId, toolId, nonce },
      "Commerce request published"
    );

    return nonce;
  } catch (error) {
    if (error instanceof UCPNonceConflictError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ fromAgentId, toAgentId, error: message }, "Failed to publish commerce request");
    throw new HederaError(`Failed to publish commerce request: ${message}`);
  }
}

/**
 * Accept a commerce request
 */
export async function publishCommerceAccept(
  agentId: string,
  nonce: string,
  executionId: string
): Promise<void> {
  try {
    const accept: UCPCommerceAccept = {
      type: "COMMERCE_ACCEPT",
      nonce,
      agentId,
      executionId,
      timestamp: Date.now(),
    };

    // Update request status
    await prisma.uCPMessage.update({
      where: { nonce },
      data: { status: "ACCEPTED" },
    });

    // Publish to UCP registry topic
    const registryTopicId = getUCPRegistryTopic();
    if (registryTopicId) {
      const attestation: AgentAttestation = {
        type: "TOOL_EXECUTED",
        agentId,
        result: "SUCCESS",
        timestamp: Date.now(),
        meta: {
          ucpMessageType: "COMMERCE_ACCEPT",
          nonce,
          executionId,
        },
      };

      await submitAttestation(registryTopicId, attestation);
    }

    logger.info({ agentId, nonce, executionId }, "Commerce request accepted");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ agentId, nonce, error: message }, "Failed to publish commerce accept (non-blocking)");
  }
}

/**
 * Complete a commerce transaction
 */
export async function publishCommerceComplete(
  agentId: string,
  nonce: string,
  txId: string,
  result: "SUCCESS" | "FAILURE"
): Promise<void> {
  try {
    const complete: UCPCommerceComplete = {
      type: "COMMERCE_COMPLETE",
      nonce,
      agentId,
      txId,
      result,
      timestamp: Date.now(),
    };

    // Update message status
    await prisma.uCPMessage.update({
      where: { nonce },
      data: { status: result === "SUCCESS" ? "COMPLETED" : "FAILED" },
    });

    // Publish to UCP registry topic
    const registryTopicId = getUCPRegistryTopic();
    if (registryTopicId) {
      const attestation: AgentAttestation = {
        type: "TOOL_EXECUTED",
        agentId,
        result,
        timestamp: Date.now(),
        meta: {
          ucpMessageType: "COMMERCE_COMPLETE",
          nonce,
          txId,
        },
      };

      await submitAttestation(registryTopicId, attestation);
    }

    logger.info({ agentId, nonce, txId, result }, "Commerce transaction completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ agentId, nonce, error: message }, "Failed to publish commerce complete (non-blocking)");
  }
}
