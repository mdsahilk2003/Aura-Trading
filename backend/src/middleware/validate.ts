import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ERROR_CODES } from "@aura/shared";
import { failure } from "../utils/errors";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json(
        failure("Validation failed", ERROR_CODES.VALIDATION_ERROR, parsed.error.flatten())
      );
    }
    req.body = parsed.data;
    return next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(422).json(
        failure("Validation failed", ERROR_CODES.VALIDATION_ERROR, parsed.error.flatten())
      );
    }
    (req as Request & { validatedQuery: T }).validatedQuery = parsed.data;
    return next();
  };
}
