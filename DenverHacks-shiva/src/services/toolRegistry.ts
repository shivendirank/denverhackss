import SwaggerParser from "swagger-parser";
import { prisma } from "@/lib/prisma";
import { uploadSchema } from "@/zg/storage";
import { submitTransaction } from "@/blockchain/relayer";
import { getContractAddressForChain, TOOL_REGISTRY_ABI } from "@/blockchain/contracts";
import { publishCapabilityAd } from "@/hedera/ucp";
import { keccak256, toHex, encodeFunctionData } from "viem";
import type { ToolRegistrationPayload, ToolSpec } from "@/types/tool";
import { ToolSpecInvalidError } from "@/types/errors";
import pino from "pino";

const logger = pino();

interface OpenAIParameter {
  type: string;
  description?: string;
  enum?: unknown[];
  items?: unknown;
  properties?: Record<string, unknown>;
  required?: string[];
}

/**
 * Convert OpenAPI JSON Schema to OpenAI function calling parameter format
 */
function convertSchemaToOpenAIParameter(
  schema: Record<string, unknown> | undefined
): any {
  if (!schema) {
    return { type: "object", properties: {} };
  }

  const converted: any = { type: "object" };

  if (schema.type) {
    converted.type = schema.type as string;
  }

  if (schema.description) {
    converted.description = schema.description as string;
  }

  if (schema.enum) {
    converted.enum = schema.enum as unknown[];
  }

  if (schema.items) {
    converted.items = convertSchemaToOpenAIParameter(schema.items as Record<string, unknown>);
  }

  if (schema.properties) {
    converted.properties = schema.properties as Record<string, unknown>;
  }

  if (schema.required) {
    converted.required = schema.required as string[];
  }

  return converted;
}

/**
 * Parse OpenAPI 3.0 spec and convert operations to OpenAI function calling format
 */
async function parseOpenAPISpec(
  spec: Record<string, unknown>
): Promise<{
  functions: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
}> {
  try {
    // Validate spec structure
    const parsed = await (SwaggerParser as any).validate(spec as any);

    const functions: any[] = [];
    const paths = parsed.paths ?? {};

    // Iterate through all paths and operations
    for (const [path, pathItem] of Object.entries(paths)) {
      if (!pathItem || typeof pathItem !== "object") continue;

      for (const [method, operation] of Object.entries(pathItem)) {
        if (
          !operation ||
          typeof operation !== "object" ||
          !("operationId" in operation) ||
          ["parameters", "servers"].includes(method)
        ) {
          continue;
        }

        const op = operation as any;
        const operationId = op.operationId || `${method}_${path.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const summary = op.summary || "";
        const description = op.description || "";
        const fullDescription = `${summary} ${description}`.trim();

        // Collect all parameters (path, query, body)
        const parameters: Record<string, any> = {};
        const required: string[] = [];

        // Path and query parameters
        if (op.parameters && Array.isArray(op.parameters)) {
          for (const param of op.parameters) {
            if (param.name && param.schema) {
              parameters[param.name] = convertSchemaToOpenAIParameter(param.schema) as any;
              if (param.required) {
                required.push(param.name);
              }
            }
          }
        }

        // Request body (application/json only)
        if (op.requestBody) {
          const jsonContent = op.requestBody.content?.["application/json"];
          if (jsonContent?.schema) {
            const bodySchema = convertSchemaToOpenAIParameter(
              jsonContent.schema as Record<string, unknown>
            ) as any;
            if (bodySchema.properties) {
              Object.assign(parameters, bodySchema.properties);
            }
            if (op.requestBody.required) {
              required.push("body");
            }
          }
        }

        functions.push({
          name: operationId,
          description: fullDescription,
          parameters: {
            type: "object",
            properties: parameters,
            required: required.length > 0 ? required : undefined,
          } as any,
        });
      }
    }

    return { functions };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ToolSpecInvalidError(`Failed to parse OpenAPI spec: ${message}`);
  }
}

/**
 * Register a tool with full OpenAPI spec support
 * - Parse and validate spec
 * - Convert to OpenAI function schema
 * - Upload full spec to 0G Storage
 * - Register on Base and Kite chains
 * - Publish UCP capability ad
 */
export async function registerTool(
  payload: ToolRegistrationPayload,
  ownerWallet: string
): Promise<ToolSpec> {
  try {
    // Fetch and validate OpenAPI spec
    let spec = payload.openApiSpec;

    if (payload.openApiSpecUrl && !spec) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(payload.openApiSpecUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch spec: ${response.statusText}`);
        }
        spec = (await response.json()) as Record<string, unknown>;
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!spec) {
      throw new ToolSpecInvalidError("No OpenAPI spec provided");
    }

    // Parse and convert to OpenAI functions
    const { functions } = await parseOpenAPISpec(spec as Record<string, unknown>);

    if (functions.length === 0) {
      throw new ToolSpecInvalidError("No valid operations found in OpenAPI spec");
    }

    // Use first function as primary schema
    const primaryFunction = functions[0];

    // Upload full spec to 0G Storage
    logger.info({ tool: payload.name }, "Uploading spec to 0G Storage");
    const zgContentHash = await uploadSchema(spec as Record<string, unknown>);
    const metadataURI = `zg://${zgContentHash}`;

    // Register on Base Sepolia
    const baseToolRegistryAddress = getContractAddressForChain("base", "toolRegistry");
    const baseToolData = encodeFunctionData({
      abi: TOOL_REGISTRY_ABI,
      functionName: "registerTool",
      args: [metadataURI, BigInt(payload.priceWei)],
    });

    logger.info({ chain: "base" }, "Registering tool on Base");
    const baseResult = await submitTransaction({
      chain: "base",
      to: baseToolRegistryAddress as `0x${string}`,
      data: baseToolData,
    });

    // Derive tool ID the same way the contract does
    const toolIdHash = keccak256(
      Buffer.concat([
        Buffer.from(ownerWallet.slice(2), "hex"),
        Buffer.from(metadataURI),
        Buffer.from(Math.floor(Date.now() / 1000).toString()),
      ])
    );

    // Register on Kite
    const kiteToolRegistryAddress = getContractAddressForChain("kite", "toolRegistry");
    const kiteToolData = encodeFunctionData({
      abi: TOOL_REGISTRY_ABI,
      functionName: "registerTool",
      args: [metadataURI, BigInt(payload.priceWei)],
    });

    logger.info({ chain: "kite" }, "Registering tool on Kite");
    const kiteResult = await submitTransaction({
      chain: "kite",
      to: kiteToolRegistryAddress as `0x${string}`,
      data: kiteToolData,
    });

    // Store tool in DB
    const tool = await prisma.tool.create({
      data: {
        onChainId: toolIdHash,
        ownerWallet,
        name: payload.name,
        description: payload.description,
        schema: primaryFunction as any,
        openApiSpec: spec as any,
        endpointUrl: payload.endpointUrl,
        authType: (payload.authType || "none") as any,
        priceWei: payload.priceWei,
        zgStorageRef: zgContentHash,
        baseToolId: toolIdHash,
        kiteTxHash: kiteResult.txHash,
        active: true,
      },
    });

    // Publish UCP capability ad
    await publishCapabilityAd(ownerWallet, [
      {
        toolId: tool.id,
        name: payload.name,
        description: payload.description,
        priceWei: payload.priceWei,
      },
    ]);

    logger.info(
      {
        tool: payload.name,
        baseToolId: toolIdHash,
        kiteTxHash: kiteResult.txHash,
      },
      "Tool registered successfully"
    );

    return {
      id: tool.id,
      onChainId: tool.onChainId,
      name: tool.name,
      description: tool.description,
      schema: primaryFunction as any,
      endpointUrl: tool.endpointUrl,
      priceWei: tool.priceWei,
      authType: (tool.authType || "none") as any,
      active: true,
      createdAt: tool.createdAt,
      zgStorageRef: zgContentHash,
      baseToolId: toolIdHash,
      kiteTxHash: kiteResult.txHash,
    };
  } catch (error) {
    if (error instanceof ToolSpecInvalidError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ tool: payload.name, error: message }, "Tool registration failed");
    throw new ToolSpecInvalidError(`Tool registration failed: ${message}`);
  }
}

/**
 * Get tool by ID with full metadata
 */
export async function getTool(toolId: string): Promise<ToolSpec | null> {
  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
  });

  if (!tool) return null;

  return {
    id: tool.id,
    onChainId: tool.onChainId,
    name: tool.name,
    description: tool.description,
    schema: tool.schema as any,
    endpointUrl: tool.endpointUrl,
    priceWei: tool.priceWei,
    authType: tool.authType as "none" | "apikey" | "bearer" | "oauth2",
    active: tool.active,
    createdAt: tool.createdAt,
    zgStorageRef: tool.zgStorageRef ?? undefined,
    baseToolId: tool.baseToolId ?? undefined,
    kiteTxHash: tool.kiteTxHash ?? undefined,
  };
}
