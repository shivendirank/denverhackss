import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  PrivateKey,
} from "@hashgraph/sdk";
import { getHederaClient, getOperatorPrivateKey, parsePrivateKey } from "./client";
import type { AgentAttestation } from "@/types/hedera";
import { AppError } from "@/types/errors";
import pino from "pino";

const logger = pino();

export interface HCSAttestationResponse {
  topicId: string;
  sequenceNumber: number;
  timestamp: number;
}

/**
 * Create a dedicated HCS topic for an agent
 * Topic memo = "agent-attestations:${agentId}"
 */
export async function createAgentTopic(agentId: string): Promise<string> {
  try {
    const client = getHederaClient();
    const operatorPrivateKey = parsePrivateKey(getOperatorPrivateKey());

    const transaction = await new TopicCreateTransaction()
      .setTopicMemo(`agent-attestations:${agentId}`)
      .setSubmitKey(operatorPrivateKey.publicKey)
      .freezeWith(client)
      .sign(operatorPrivateKey);

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    const topicId = receipt.topicId?.toString();
    if (!topicId) {
      throw new Error("No topic ID in receipt");
    }

    logger.info(
      { agentId, topicId },
      "HCS topic created for agent"
    );

    return topicId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ agentId, error: message }, "Failed to create HCS topic");
    throw new AppError(500, "HEDERA_ERROR", `Failed to create agent topic: ${message}`);
  }
}

/**
 * Submit an attestation to an agent's HCS topic
 */
export async function submitAttestation(
  topicId: string,
  attestation: AgentAttestation
): Promise<HCSAttestationResponse> {
  try {
    const client = getHederaClient();
    const operatorPrivateKey = parsePrivateKey(getOperatorPrivateKey());

    const payload = JSON.stringify(attestation);

    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(payload)
      .freezeWith(client)
      .sign(operatorPrivateKey);

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    // Use the sequence number from receipt 
    const sequenceNumber = (receipt as any).topicSequenceNumber || Date.now();
    if (sequenceNumber === undefined) {
      logger.warn({ topicId }, "No sequence number in receipt");
    }

    logger.debug(
      {
        topicId,
        sequenceNumber,
        type: attestation.type,
        agentId: attestation.agentId,
      },
      "Attestation submitted to HCS"
    );

    return {
      topicId,
      sequenceNumber,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(
      { topicId, type: attestation.type, error: message },
      "Failed to submit HCS attestation"
    );
    throw new AppError(500, "HEDERA_ERROR", `Failed to submit attestation: ${message}`);
  }
}

/**
 * Query attestations from an agent's HCS topic via mirror node
 * In production, use Hedera Mirror Node REST API
 */
export async function getAttestations(
  topicId: string,
  limit: number = 100
): Promise<AgentAttestation[]> {
  try {
    // In production, this would query the Hedera Mirror Node REST API
    // https://docs.hedera.com/hedera/sdks-and-apis/rest-api#topic-messages-api
    // For now, return empty array - real implementation needs HTTP client to mirror node
    logger.debug(
      { topicId, limit },
      "Querying attestations from HCS (stub - use Mirror Node in production)"
    );
    return [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ topicId, error: message }, "Failed to query HCS attestations");
    throw new AppError(500, "HEDERA_ERROR", `Failed to query attestations: ${message}`);
  }
}
