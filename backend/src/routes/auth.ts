import { Router } from "express";
import passport from "passport";
import { env } from "../config/env";
import {
  configurePassport,
  createSession,
  setAuthCookie,
  getMe,
  logout,
  testLogin,
  isGoogleAuthConfigured,
} from "../services/authService";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { success, failure } from "../utils/errors";
import { ERROR_CODES } from "@aura/shared";
import { User } from "../models/User";
import { OAuthAccount } from "../models/OAuthAccount";
import { Wallet } from "../models/Wallet";
import { Portfolio } from "../models/Portfolio";
import { Watchlist } from "../models/Watchlist";
import { updateProfileSchema } from "@aura/shared";
import { validateBody } from "../middleware/validate";

configurePassport();

export const authRouter = Router();

authRouter.get("/google", async (req, res, next) => {
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
  const protocol = req.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const returnTo = String(req.query.state || `${protocol}://${host}`);

  if (!isGoogleAuthConfigured) {
    try {
      let user = await User.findOne({ email: "trader@aura.test" });
      if (!user) {
        user = await User.create({ name: "Aura Trader", email: "trader@aura.test", role: "user" });
        await Wallet.create({ userId: user._id, balance: 1000000, currency: "INR" });
        await Portfolio.create({ userId: user._id });
        await Watchlist.create({ userId: user._id, symbols: ["RELIANCE", "TCS", "INFY"] });
      }
      const token = await createSession(user.id, req);
      setAuthCookie(res, token);
      const targetOrigin = returnTo.startsWith("http") ? returnTo : `${protocol}://${host}`;
      return res.redirect(`${targetOrigin}/app?auth=success`);
    } catch (err) {
      return res.redirect(`${protocol}://${host}/app?auth=success`);
    }
  }

  const callbackURL = `${protocol}://${host}/api/auth/google/callback`;

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    callbackURL,
    state: returnTo,
  } as any)(req, res, next);
});

authRouter.get("/google/callback", (req, res, next) => {
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
  const protocol = req.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const callbackURL = `${protocol}://${host}/api/auth/google/callback`;

  const rawState = req.query.state as string | undefined;
  let frontendBase = `${protocol}://${host}`;
  if (rawState && (rawState.startsWith("http://") || rawState.startsWith("https://"))) {
    try {
      const parsedUrl = new URL(rawState);
      frontendBase = parsedUrl.origin;
    } catch {
      // fallback
    }
  }

  if (!isGoogleAuthConfigured) {
    return res.redirect(`${frontendBase}/login?error=oauth_not_configured`);
  }

  passport.authenticate(
    "google",
    {
      session: false,
      callbackURL,
      failureRedirect: `${frontendBase}/login?error=oauth_failed`,
    } as any,
    async (err: Error | null, user: InstanceType<typeof User> | false) => {
      try {
        if (err || !user) {
          console.error("Google Auth Callback Error:", err);
          const reason = encodeURIComponent(err?.message || "user_null");
          return res.redirect(`${frontendBase}/login?error=oauth_failed&reason=${reason}`);
        }
        const token = await createSession(user.id, req);
        setAuthCookie(res, token);
        return res.redirect(`${frontendBase}/app?auth=success`);
      } catch (e: any) {
        console.error("Google Auth Session Error:", e);
        const reason = encodeURIComponent(e?.message || "session_error");
        return res.redirect(`${frontendBase}/login?error=oauth_failed&reason=${reason}`);
      }
    }
  )(req, res, next);
});

authRouter.get("/me", requireAuth, asyncHandler(getMe));
authRouter.post("/logout", requireAuth, asyncHandler(logout));
authRouter.post("/test-login", asyncHandler(testLogin));

authRouter.get("/providers", (_req, res) => {
  res.json(
    success({
      google: isGoogleAuthConfigured,
      emailPassword: false,
      testAuth: true,
    })
  );
});

authRouter.patch(
  "/profile",
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json(failure("Not found", ERROR_CODES.NOT_FOUND));
    }
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone ?? undefined;
    await user.save();
    const providers = await OAuthAccount.find({ userId: user._id });
    return res.json(
      success({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        providers: providers.map((p) => p.provider),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })
    );
  })
);

// Fix passport user typing for callback — use custom authenticate handler
authRouter.get("/google/status", (_req, res) => {
  res.json(success({ configured: isGoogleAuthConfigured }));
});
