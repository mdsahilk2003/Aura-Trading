import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { DEFAULT_PAPER_FUNDS } from "@aura/shared";
import { env, isGoogleAuthConfigured } from "../config/env";
import { User } from "../models/User";
import { OAuthAccount } from "../models/OAuthAccount";
import { Session } from "../models/Session";
import { Wallet } from "../models/Wallet";
import { Portfolio } from "../models/Portfolio";
import { Watchlist } from "../models/Watchlist";
import { AuditLog } from "../models/AuditLog";
import { hashToken, signToken } from "../utils/jwt";
import { success, failure, AppError } from "../utils/errors";
import { ERROR_CODES } from "@aura/shared";
import { connectDatabase } from "../config/database";
import type { AuthRequest } from "../middleware/auth";

export function configurePassport() {
  if (!isGoogleAuthConfigured) return;

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          await connectDatabase();
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new AppError("Google account has no email", 400));
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (!user) {
            user = await User.create({
              name: profile.displayName || email.split("@")[0],
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              role: "user",
            });
            await OAuthAccount.create({
              userId: user._id,
              provider: "google",
              providerAccountId: profile.id,
            });
            await Wallet.create({
              userId: user._id,
              balance: 0,
              currency: "INR",
            });
            await Portfolio.create({ userId: user._id });
            await Watchlist.create({
              userId: user._id,
              symbols: ["RELIANCE", "TCS", "INFY"],
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            await OAuthAccount.findOneAndUpdate(
              { provider: "google", providerAccountId: profile.id },
              { userId: user._id, provider: "google", providerAccountId: profile.id },
              { upsert: true }
            );
          }

          return done(null, {
            id: user.id,
            role: user.role,
            email: user.email,
            name: user.name,
          });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

export async function createSession(
  userId: string,
  req: Request
): Promise<string> {
  const token = signToken({
    sub: userId,
    role: (await User.findById(userId))?.role || "user",
  });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({
    userId,
    tokenHash: hashToken(token),
    userAgent: req.get("user-agent") || undefined,
    ip: req.ip,
    expiresAt,
  });
  return token;
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(env.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json(failure("Unauthorized", ERROR_CODES.UNAUTHORIZED));
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json(failure("Unauthorized", ERROR_CODES.UNAUTHORIZED));
  }
  const providers = await OAuthAccount.find({ userId: user._id });
  return res.json(
    success({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      providers: [
        ...providers.map((p) => p.provider),
        ...(user.passwordHash ? ["email"] : []),
      ],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })
  );
}

export async function logout(req: AuthRequest, res: Response) {
  const token = req.cookies?.[env.JWT_COOKIE_NAME];
  if (token) {
    await Session.findOneAndUpdate(
      { tokenHash: hashToken(token) },
      { revokedAt: new Date() }
    );
  }
  clearAuthCookie(res);
  if (req.user) {
    await AuditLog.create({
      userId: req.user.id,
      action: "LOGOUT",
      resource: "Session",
    });
  }
  return res.json(success({ ok: true }));
}

/** Authenticates or creates user dynamically with their email address */
export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json(failure("Valid email address is required", ERROR_CODES.VALIDATION_ERROR));
  }

  const cleanEmail = email.trim().toLowerCase();
  await connectDatabase();

  let user = await User.findOne({ email: cleanEmail });

  if (!user) {
    const name = cleanEmail.split("@")[0] || "Aura Trader";
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    user = await User.create({
      name,
      email: cleanEmail,
      passwordHash,
      role: "user",
    });
    await Wallet.create({ userId: user._id, balance: 0, currency: "INR" });
    await Portfolio.create({ userId: user._id });
    await Watchlist.create({
      userId: user._id,
      symbols: ["RELIANCE", "TCS", "INFY"],
    });
  } else if (password && user.passwordHash) {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(failure("Incorrect password", ERROR_CODES.UNAUTHORIZED));
    }
  } else if (password && !user.passwordHash) {
    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
  }

  const token = await createSession(user.id, req);
  setAuthCookie(res, token);

  return res.json(
    success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    })
  );
}

/** Registers a new user with email, name, and optional password */
export async function registerUser(req: Request, res: Response) {
  const { name, email, password } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json(failure("Valid email address is required", ERROR_CODES.VALIDATION_ERROR));
  }

  const cleanEmail = email.trim().toLowerCase();
  const userName = (typeof name === "string" && name.trim()) ? name.trim() : cleanEmail.split("@")[0];

  await connectDatabase();

  let user = await User.findOne({ email: cleanEmail });

  if (user) {
    if (password && user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json(failure("Email already registered with another password", ERROR_CODES.VALIDATION_ERROR));
      }
    }
  } else {
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    user = await User.create({
      name: userName,
      email: cleanEmail,
      passwordHash,
      role: "user",
    });
    await Wallet.create({ userId: user._id, balance: 0, currency: "INR" });
    await Portfolio.create({ userId: user._id });
    await Watchlist.create({
      userId: user._id,
      symbols: ["RELIANCE", "TCS", "INFY"],
    });
  }

  const token = await createSession(user.id, req);
  setAuthCookie(res, token);

  return res.json(
    success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    })
  );
}

/** Creates a session for 1-click demo/trader login */
export async function testLogin(req: Request, res: Response) {
  const email = (req.body?.email as string) || "trader@aura.test";
  const name = (req.body?.name as string) || (email ? email.split("@")[0] : "Aura Trader");
  const role = req.body?.role === "admin" ? "admin" : "user";

  await connectDatabase();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, role, avatar: undefined });
    await Wallet.create({ userId: user._id, balance: 0, currency: "INR" });
    await Portfolio.create({ userId: user._id });
    await Watchlist.create({
      userId: user._id,
      symbols: ["RELIANCE", "TCS", "INFY"],
    });
  }

  const token = await createSession(user.id, req);
  setAuthCookie(res, token);
  return res.json(
    success({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  );
}

export { isGoogleAuthConfigured };

