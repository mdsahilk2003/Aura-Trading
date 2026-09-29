import type { Request, Response, NextFunction } from "express";
import { ERROR_CODES } from "@aura/shared";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { hashToken } from "../utils/jwt";
import { AppError, failure } from "../utils/errors";

export interface UserPayload {
  id: string;
  role: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface User extends UserPayload {}
    interface Request {
      user?: UserPayload;
      validatedQuery?: any;
    }
  }
}

export type AuthRequest = Request;

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const cookieName = process.env.JWT_COOKIE_NAME || "aura_token";
    const token =
      req.cookies?.[cookieName] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      return res
        .status(401)
        .json(failure("Authentication required", ERROR_CODES.UNAUTHORIZED));
    }

    const payload = verifyToken(token);
    const session = await Session.findOne({
      tokenHash: hashToken(token),
      revokedAt: { $exists: false },
    });
    if (!session || session.expiresAt < new Date()) {
      return res
        .status(401)
        .json(failure("Session expired", ERROR_CODES.UNAUTHORIZED));
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json(failure("User not found", ERROR_CODES.UNAUTHORIZED));
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };
    return next();
  } catch {
    return res
      .status(401)
      .json(failure("Invalid token", ERROR_CODES.UNAUTHORIZED));
  }
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  return authenticate(req, res, next);
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  return authenticate(req, res, (err?: unknown) => {
    if (err) return next(err as Error);
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json(failure("Admin access required", ERROR_CODES.FORBIDDEN));
    }
    return next();
  });
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const cookieName = process.env.JWT_COOKIE_NAME || "aura_token";
  const token =
    req.cookies?.[cookieName] ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);
  if (!token) return next();
  void authenticate(req, _res, next).catch(() => next());
}

export function asyncHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>
) {
  return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(failure(err.message, err.code, err.details));
  }
  console.error("API Middleware Error:", err);
  const errMsg = err instanceof Error ? err.message : "Internal server error";
  return res
    .status(500)
    .json(failure(errMsg, ERROR_CODES.INTERNAL_ERROR));
}
