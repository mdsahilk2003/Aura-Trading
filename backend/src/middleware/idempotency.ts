import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth";
import { AppError } from "../utils/errors";
import { ERROR_CODES } from "@aura/shared";

// In-memory LRU cache storing recent order idempotency keys & request signatures
const seenKeys = new Map<string, { timestamp: number; result?: unknown }>();

// TTL for idempotency cache: 10 seconds
const TTL_MS = 10_000;

function cleanup() {
  const now = Date.now();
  for (const [key, value] of seenKeys.entries()) {
    if (now - value.timestamp > TTL_MS) {
      seenKeys.delete(key);
    }
  }
}

/**
 * Idempotency & Duplicate Order Protection Middleware.
 * Prevents identical order placement within 10s window via X-Idempotency-Key header or body fingerprint.
 */
export function orderIdempotencyMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  cleanup();
  const userId = req.user?.id || "anonymous";
  const customKey = req.headers["x-idempotency-key"] as string | undefined;

  let cacheKey: string;
  if (customKey) {
    cacheKey = `key:${userId}:${customKey}`;
  } else if (req.body && req.body.symbol && req.body.side && req.body.quantity) {
    const { symbol, side, quantity, price } = req.body;
    cacheKey = `fp:${userId}:${symbol}:${side}:${quantity}:${price || 0}`;
  } else {
    return next();
  }

  const existing = seenKeys.get(cacheKey);
  if (existing && Date.now() - existing.timestamp < TTL_MS) {
    throw new AppError(
      "Duplicate order request detected. Please wait before placing identical orders.",
      409,
      ERROR_CODES.CONFLICT
    );
  }

  seenKeys.set(cacheKey, { timestamp: Date.now() });
  next();
}
