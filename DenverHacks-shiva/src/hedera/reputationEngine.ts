import { prisma } from "@/lib/prisma";
import { getContractAddressForChain, AGENT_NFT_ABI } from "@/blockchain/contracts";
import { submitAttestation } from "./hcsAttestation";
import type { ReputationScore, AgentAttestation } from "@/types/hedera";
import { getClientForChain } from "@/blockchain/clients";
import { submitTransaction } from "@/blockchain/relayer";
import { encodeFunctionData } from "viem";
import pino from "pino";

const logger = pino();

/**
 * Calculate reputation score from HCS attestations
 * score = (successRate * 0.6) + (volumeNormalized * 0.2) + (consistencyScore * 0.2)
 */
export async function calculateReputation(agentId: string): Promise<ReputationScore> {
  try {
    // Query all executions for the agent
    const executions = await prisma.execution.findMany({
      where: { agentId },
    });

    if (executions.length === 0) {
      return {
        score: 0,
        totalExecutions: 0,
        successRate: 0,
        totalVolumeWei: "0",
        lastUpdated: new Date(),
      };
    }

    // Calculate metrics
    const successCount = executions.filter((e) => e.status === "SUCCESS").length;
    const successRate = successCount / executions.length;

    // Normalize volume (cap at 100 ETH for scoring purposes)
    const totalVolumeWei = executions.reduce((sum, e) => {
      return (BigInt(sum) + BigInt(e.costWei)).toString();
    }, "0");

    const volumeBigInt = BigInt(totalVolumeWei);
    const volumeEth = Number(volumeBigInt) / 1e18;
    const volumeNormalized = Math.min(volumeEth / 100, 1); // Maps [0, 100 ETH] to [0, 1]

    // Consistency score: frequency of executions over time
    const now = Date.now();
    const oldestExecution = executions.reduce((oldest, current) => {
      const currentTime = current.createdAt.getTime();
      const oldestTime = oldest.createdAt.getTime();
      return currentTime < oldestTime ? current : oldest;
    });

    const timeSpan = now - oldestExecution.createdAt.getTime();
    const daysActive = timeSpan / (1000 * 60 * 60 * 24);
    const executionsPerDay = Math.min(executions.length / Math.max(daysActive, 1), 10); // Cap at 10/day
    const consistencyScore = executionsPerDay / 10;

    // Final score calculation
    const score = Math.round(
      successRate * 0.6 + volumeNormalized * 0.2 + consistencyScore * 0.2
    ) * 100;

    const reputation: ReputationScore = {
      score: Math.min(100, score),
      totalExecutions: executions.length,
      successRate: Number((successRate * 100).toFixed(2)),
      totalVolumeWei,
      lastUpdated: new Date(),
    };

    logger.info({ agentId, score: reputation.score }, "Reputation calculated");
    return reputation;
  } catch (error) {
    logger.error({ agentId, error }, "Failed to calculate reputation");
    throw error;
  }
}

/**
 * Update reputation on-chain via AgentNFT contract on 0G Chain
 */
export async function updateReputationOnChain(
  agentId: string,
  score: number,
  totalExecutions: number
): Promise<void> {
  try {
    // Get agent from DB to find their NFT token ID
    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });

    if (!agent || !agent.nftTokenId) {
      logger.warn({ agentId }, "Agent not found or no NFT token ID");
      return;
    }

    const tokenId = BigInt(agent.nftTokenId);

    // Prepare transaction data
    const agentNFTAddress = getContractAddressForChain("zg", "agentNFT");
    const data = encodeFunctionData({
      abi: AGENT_NFT_ABI,
      functionName: "updateReputation",
      args: [tokenId, BigInt(score), BigInt(totalExecutions)],
    });

    // Submit transaction via relayer
    const result = await submitTransaction({
      chain: "zg",
      to: agentNFTAddress as `0x${string}`,
      data,
    });

    logger.info(
      { agentId, tokenId: tokenId.toString(), score, txHash: result.txHash },
      "Reputation updated on-chain"
    );

    // Submit attestation to HCS
    const agent_hcs_topic = agent.hcsTopicId;
    if (agent_hcs_topic) {
      const attestation: AgentAttestation = {
        type: "REPUTATION_UPDATED",
        agentId,
        result: "SUCCESS",
        timestamp: Date.now(),
        meta: {
          newScore: score.toString(),
          totalExecutions: totalExecutions.toString(),
          txHash: result.txHash,
        },
      };

      await submitAttestation(agent_hcs_topic, attestation);
    }
  } catch (error) {
    logger.error({ agentId, error }, "Failed to update reputation on-chain (non-blocking)");
  }
}

/**
 * Update agent record in DB with new reputation
 */
export async function updateAgentReputation(
  agentId: string,
  reputation: ReputationScore
): Promise<void> {
  try {
    await prisma.agent.update({
      where: { agentId },
      data: {
        reputationScore: reputation.score,
        reputationData: {
          successRate: reputation.successRate,
          totalVolumeWei: reputation.totalVolumeWei,
          lastUpdated: typeof reputation.lastUpdated === 'number' 
            ? new Date(reputation.lastUpdated).toISOString()
            : reputation.lastUpdated.toISOString(),
        },
      },
    });

    logger.debug({ agentId, score: reputation.score }, "Agent reputation updated in DB");
  } catch (error) {
    logger.error({ agentId, error }, "Failed to update agent reputation in DB");
    throw error;
  }
}
