/**
 * 0G Chain API Routes
 * Provides agent iNFT data, on-chain actions, and 0G identity information
 */

import { Router, type Request, type Response } from "express";
import {
  getAgent,
  findAgents,
} from "../services/in-memory-storage.js";
import {
  mintAgentNFT,
  getAgentNFTData,
  getAgentNFTExplorerUrl,
} from "../services/zg-identity.js";

const router = Router();

/**
 * GET /api/zg/agents/:id/nft
 * Get agent's iNFT data from 0G Chain
 */
router.get("/agents/:id/nft", async (req: Request, res: Response) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID required" });
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Fetch NFT data from 0G Chain
    const nftData = await getAgentNFTData(agent.wallet);
    
    if (!nftData) {
      return res.json({
        status: "not-minted",
        agent: {
          id: agent.id,
          name: agent.name,
          wallet: agent.wallet,
        },
      });
    }

    res.json({
      status: "minted",
      tokenId: nftData.tokenId,
      reputation: nftData.reputation,
      actionCount: nftData.actionCount,
      explorerUrl: getAgentNFTExplorerUrl(nftData.tokenId),
      agent: {
        id: agent.id,
        name: agent.name,
        wallet: agent.wallet,
      },
    });
  } catch (error: any) {
    console.error("Error fetching agent NFT:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/zg/agents/:id/mint
 * Mint agent iNFT on 0G Chain
 */
router.post("/agents/:id/mint", async (req: Request, res: Response) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID required" });
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Check if already minted
    const existing = await getAgentNFTData(agent.wallet);
    if (existing) {
      return res.status(400).json({
        error: "Agent already has NFT",
        tokenId: existing.tokenId,
        explorerUrl: getAgentNFTExplorerUrl(existing.tokenId),
      });
    }

    // Mint NFT
    const result = await mintAgentNFT(agent);

    res.json({
      success: true,
      tokenId: result.tokenId,
      txHash: result.txHash,
      explorerUrl: result.explorerUrl,
      agent: {
        id: agent.id,
        name: agent.name,
        wallet: agent.wallet,
      },
    });
  } catch (error: any) {
    console.error("Error minting agent NFT:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/zg/agents/status
 * Get NFT minting status for all agents
 */
router.get("/agents/status", async (req: Request, res: Response) => {
  try {
    const agents = findAgents();

    const statuses = await Promise.all(
      agents.map(async (agent) => {
        const nftData = await getAgentNFTData(agent.wallet);

        return {
          agentId: agent.id,
          agentName: agent.name,
          wallet: agent.wallet,
          hasnft: !!nftData,
          tokenId: nftData?.tokenId,
          reputation: nftData?.reputation,
          actionCount: nftData?.actionCount,
          explorerUrl: nftData ? getAgentNFTExplorerUrl(nftData.tokenId) : null,
        };
      })
    );

    res.json({
      total: agents.length,
      minted: statuses.filter((s) => s.hasnft).length,
      pending: statuses.filter((s) => !s.hasnft).length,
      agents: statuses,
    });
  } catch (error: any) {
    console.error("Error fetching agent statuses:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
