/**
 * SIWE (Sign In With Ethereum) Authentication Middleware
 * Validates EIP-4361 signed messages for agent wallet authentication
 *
 * In production, implement full signature verification using:
 * - siwe package for message validation
 * - SIWE nonce storage in Redis
 * - Domain verification
 */

import { Request, Response, NextFunction } from "express";
import pino from "pino";

const logger = pino();

/**
 * Placeholder SIWE middleware
 * In production: 
 * 1. Client signs EIP-4361 message with their wallet
 * 2. Middleware verifies signature matches wallet address
 * 3. Verifies nonce hasn't been used (stored in Redis)
 * 4. Sets req.agentWallet to authenticated wallet
 */
export function siweAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    const walletHeader = req.headers["x-wallet"];

    if (!authHeader && !walletHeader) {
      return res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      });
    }

    // For development: accept X-Wallet header
    // In production: implement full SIWE verification
    const wallet = walletHeader as string;

    if (!wallet || !wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(401).json({
        code: "INVALID_WALLET",
        message: "Invalid wallet address format",
      });
    }

    // Attach authenticated wallet to request
    (req as any).agentWallet = wallet;

    logger.debug({ wallet }, "Agent authenticated");
    next();
  } catch (error) {
    logger.error({ error }, "SIWE authentication error");
    res.status(500).json({
      code: "AUTH_ERROR",
      message: "Authentication error",
    });
  }
}

/**
 * Production SIWE verification pseudocode:
 *
 * import { SiweMessage } from 'siwe';
 *
 * export async function siweAuth(req, res, next) {
 *   const { message, signature } = req.body;
 *
 *   try {
 *     const siweMessage = new SiweMessage(message);
 *     const fields = await siweMessage.validate(signature);
 *
 *     // Verify nonce hasn't been used
 *     const nonceUsed = await redis.get(`siwe:nonce:${fields.nonce}`);
 *     if (nonceUsed) {
 *       return res.status(401).json({ error: 'Nonce already used' });
 *     }
 *
 *     // Mark nonce as used
 *     await redis.setex(`siwe:nonce:${fields.nonce}`, 3600, '1');
 *
 *     // Verify message domain matches expected
 *     if (fields.domain !== EXPECTED_DOMAIN) {
 *       return res.status(401).json({ error: 'Invalid domain' });
 *     }
 *
 *     // Set authenticated wallet
 *     req.agentWallet = fields.address;
 *     next();
 *   } catch (error) {
 *     res.status(401).json({ error: 'Invalid signature' });
 *   }
 * }
 */
