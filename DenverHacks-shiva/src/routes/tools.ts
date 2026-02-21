import { Router, Request, Response } from "express";
import { z } from "zod";
import { registerTool, getTool } from "@/services/toolRegistry";
import { validateBody } from "@/middleware/validate";
import type { ToolRegistrationPayload } from "@/types/tool";
import pino from "pino";

const logger = pino();
const router = Router();

const toolRegistrationSchema = z.object({
  openApiSpecUrl: z.string().url().optional(),
  openApiSpec: z.record(z.unknown()).optional(),
  endpointUrl: z.string().url(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  priceWei: z.string().regex(/^\d+$/),
  authType: z.enum(["none", "apikey", "bearer", "oauth2"]),
  authConfig: z.record(z.string()).optional(),
});

const toolIdParamSchema = z.object({
  toolId: z.string().uuid(),
});

/**
 * GET /api/tools
 * List all registered tools
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { prisma } = await import("@/lib/prisma");
    const tools = await prisma.tool.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        endpointUrl: true,
        priceWei: true,
        authType: true,
        ownerWallet: true,
        onChainId: true,
        active: true,
        createdAt: true,
        _count: { select: { executions: true } },
      },
    });
    res.json(tools);
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/tools
 * Register a new tool with OpenAPI spec
 */
router.post(
  "/",
  validateBody(toolRegistrationSchema),
  async (req: Request, res: Response) => {
    try {
      const payload = req.body as ToolRegistrationPayload;
      const ownerWallet = (req as any).agentWallet as string;

      if (!ownerWallet) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const tool = await registerTool(payload, ownerWallet);

      logger.info(
        { toolId: tool.id, name: tool.name, owner: ownerWallet },
        "Tool registered successfully"
      );

      res.status(201).json(tool);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/tools/:toolId
 * Get tool details and schema
 */
router.get("/:toolId", async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params as { toolId: string };

    const tool = await getTool(toolId);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    res.json(tool);
  } catch (error) {
    throw error;
  }
});

export default router;
