import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "@/types/errors";
import pino from "pino";

const logger = pino();

/**
 * Generic Zod schema validation middleware
 * Usage: router.post('/endpoint', validateBody(mySchema), handler)
 */
export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.flatten();
        throw new ValidationError("Request validation failed", errors);
      }

      // Replace body with validated data to prevent injection
      req.body = result.data;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      logger.error({ error }, "Validation middleware error");
      res.status(500).json({ error: "Validation error" });
    }
  };
}

/**
 * Validate URL parameters
 */
export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = result.error.flatten();
        throw new ValidationError("Parameter validation failed", errors);
      }

      req.params = result.data as any;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      logger.error({ error }, "Params validation error");
      res.status(500).json({ error: "Validation error" });
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.flatten();
        throw new ValidationError("Query validation failed", errors);
      }

      req.query = result.data as any;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      logger.error({ error }, "Query validation error");
      res.status(500).json({ error: "Validation error" });
    }
  };
}
