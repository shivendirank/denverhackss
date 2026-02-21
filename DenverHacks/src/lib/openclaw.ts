/**
 * OpenClaw Client Service
 * Manages AI Agent lifecycle with SENTINEL trust layer
 */

import { createWalletClient, createPublicClient, http, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { prisma } from './prisma';

// Import contract ABIs (you'll need to compile these)
import AgentNFTABI from '../../contracts/AgentNFT.sol/AgentNFT.json';
import EscrowABI from '../../contracts/Escrow.sol/Escrow.json';
import ToolRegistryABI from '../../contracts/ToolRegistry.sol/ToolRegistry.json';

export interface AgentConfig {
  name: string;
  description: string;
  metadata: Record<string, any>;
  initialTrustScore?: number;
}

export interface ToolExecution {
  agentId: string;
  toolId: string;
  params: any;
}

export interface EscrowParams {
  agentId: string;
  amount: bigint;
  duration: number; // in seconds
}

export class OpenClawClient {
  private walletClient;
  private publicClient;
  private agentNFTAddress: Address;
  private escrowAddress: Address;
  private toolRegistryAddress: Address;

  constructor() {
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not set in environment');
    }

    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

    this.walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC),
    });

    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC),
    });

    this.agentNFTAddress = process.env.AGENT_NFT_ADDRESS as Address;
    this.escrowAddress = process.env.ESCROW_ADDRESS as Address;
    this.toolRegistryAddress = process.env.TOOL_REGISTRY_ADDRESS as Address;
  }

  /**
   * Create new AI agent with ERC-8004 identity
   */
  async createAgent(config: AgentConfig) {
    try {
      // 1. Mint AgentNFT on Base
      const hash = await this.walletClient.writeContract({
        address: this.agentNFTAddress,
        abi: AgentNFTABI.abi,
        functionName: 'mint',
        args: [
          this.walletClient.account?.address,
          config.name,
          config.description,
          JSON.stringify(config.metadata),
        ],
      });

      // Wait for transaction
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      // Extract tokenId from logs
      const tokenId = this.parseTokenIdFromReceipt(receipt);

      // 2. Create Hedera HCS topic for reputation
      const topicId = await this.createHederaTopic(tokenId.toString());

      // 3. Store in database
      const agent = await prisma.agent.create({
        data: {
          tokenId: tokenId.toString(),
          hederaTopicId: topicId,
          name: config.name,
          description: config.description,
          metadata: config.metadata,
          trustScore: config.initialTrustScore || 50,
          status: 'active',
        },
      });

      console.log(`✅ Agent created: Token ${tokenId}, Topic ${topicId}`);

      return {
        tokenId: tokenId.toString(),
        topicId,
        agent,
      };
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }

  /**
   * Execute tool in TEE with attestation
   */
  async executeToolInTEE(execution: ToolExecution) {
    try {
      // 1. Verify agent exists
      const agent = await prisma.agent.findUnique({
        where: { tokenId: execution.agentId },
      });

      if (!agent) {
        throw new Error(`Agent ${execution.agentId} not found`);
      }

      // 2. Get tool from registry
      const tool = await this.publicClient.readContract({
        address: this.toolRegistryAddress,
        abi: ToolRegistryABI.abi,
        functionName: 'getTool',
        args: [execution.toolId],
      });

      // 3. Submit to TEE for execution
      const teeResponse = await fetch(
        process.env.TEE_ENDPOINT || 'http://localhost:8080/execute',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: execution.agentId,
            toolId: execution.toolId,
            params: execution.params,
            tool,
          }),
        }
      );

      const attestation = await teeResponse.json();

      // 4. Submit attestation to Hedera HCS
      await this.submitHederaAttestation(agent.hederaTopicId, attestation);

      // 5. Log execution
      await prisma.executionLog.create({
        data: {
          agentId: execution.agentId,
          toolId: execution.toolId,
          params: execution.params,
          result: attestation.result,
          attestation: attestation.proof,
          status: attestation.success ? 'success' : 'failed',
        },
      });

      return attestation;
    } catch (error) {
      console.error('Tool execution failed:', error);
      throw error;
    }
  }

  /**
   * Create escrow for agent payment
   */
  async createEscrow(params: EscrowParams) {
    try {
      const hash = await this.walletClient.writeContract({
        address: this.escrowAddress,
        abi: EscrowABI.abi,
        functionName: 'createEscrow',
        args: [BigInt(params.agentId), BigInt(params.duration)],
        value: params.amount,
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      console.log(`✅ Escrow created: ${hash}`);

      return {
        hash,
        receipt,
      };
    } catch (error) {
      console.error('Escrow creation failed:', error);
      throw error;
    }
  }

  /**
   * Release escrow payment to agent
   */
  async releaseEscrow(escrowId: bigint) {
    try {
      const hash = await this.walletClient.writeContract({
        address: this.escrowAddress,
        abi: EscrowABI.abi,
        functionName: 'release',
        args: [escrowId],
      });

      await this.publicClient.waitForTransactionReceipt({ hash });

      console.log(`✅ Escrow released: ${escrowId}`);

      return hash;
    } catch (error) {
      console.error('Escrow release failed:', error);
      throw error;
    }
  }

  /**
   * Update agent trust score based on reputation
   */
  async updateTrustScore(agentId: string, delta: number) {
    try {
      const agent = await prisma.agent.update({
        where: { tokenId: agentId },
        data: {
          trustScore: {
            increment: delta,
          },
        },
      });

      // Submit to Hedera HCS
      await this.submitHederaAttestation(agent.hederaTopicId, {
        type: 'trust_score_update',
        agentId,
        delta,
        newScore: agent.trustScore,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Trust score updated: ${agentId} -> ${agent.trustScore}`);

      return agent;
    } catch (error) {
      console.error('Trust score update failed:', error);
      throw error;
    }
  }

  /**
   * Get agent's current state
   */
  async getAgent(tokenId: string) {
    return prisma.agent.findUnique({
      where: { tokenId },
      include: {
        executionLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * List all agents
   */
  async listAgents(limit = 50) {
    return prisma.agent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // Private Helper Methods
  // ══════════════════════════════════════════════════════════════

  private parseTokenIdFromReceipt(receipt: any): bigint {
    // Extract Transfer event from logs
    const transferLog = receipt.logs.find(
      (log: any) =>
        log.topics[0] ===
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    );

    if (!transferLog) {
      throw new Error('Transfer event not found in receipt');
    }

    return BigInt(transferLog.topics[3]);
  }

  private async createHederaTopic(agentId: string): Promise<string> {
    // TODO: Implement Hedera HCS topic creation
    // For now, return mock topic ID
    return `0.0.${Math.floor(Math.random() * 1000000)}`;
  }

  private async submitHederaAttestation(
    topicId: string,
    attestation: any
  ): Promise<void> {
    // TODO: Implement Hedera HCS message submission
    console.log(`📡 Submitting to HCS topic ${topicId}:`, attestation);
  }
}

// Singleton instance
let openClawInstance: OpenClawClient | null = null;

export function getOpenClawClient(): OpenClawClient {
  if (!openClawInstance) {
    openClawInstance = new OpenClawClient();
  }
  return openClawInstance;
}
