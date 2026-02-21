import axios, { AxiosInstance } from "axios";
import { config } from "@/config";
import { ZGStorageError } from "@/types/errors";
import pino from "pino";

const logger = pino();

const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.ZG_STORAGE_API_URL,
  timeout: 30000,
});

export interface ZGStorageUploadResponse {
  contentHash: string;
  size: number;
  timestamp: number;
}

export interface ZGStorageRetrieveResponse {
  content: Record<string, unknown>;
  contentHash: string;
  size: number;
}

/**
 * Upload an OpenAPI spec or schema to 0G Storage
 * Returns content hash for on-chain reference
 */
export async function uploadSchema(content: Record<string, unknown>): Promise<string> {
  try {
    const jsonContent = JSON.stringify(content);

    const response = await axiosInstance.post<ZGStorageUploadResponse>("/upload", {
      content: jsonContent,
      contentType: "application/json",
    });

    logger.info(
      { contentHash: response.data.contentHash, size: response.data.size },
      "Schema uploaded to 0G Storage"
    );

    return response.data.contentHash;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ error: message }, "0G Storage upload failed");
    throw new ZGStorageError(`Failed to upload schema: ${message}`);
  }
}

/**
 * Retrieve a schema from 0G Storage by content hash
 */
export async function retrieveSchema(contentHash: string): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.get<ZGStorageRetrieveResponse>(
      `/retrieve/${contentHash}`
    );

    logger.info({ contentHash }, "Schema retrieved from 0G Storage");

    return response.data.content;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ contentHash, error: message }, "0G Storage retrieval failed");
    throw new ZGStorageError(`Failed to retrieve schema: ${message}`);
  }
}

/**
 * Health check for 0G Storage API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await axiosInstance.get("/health", { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}
