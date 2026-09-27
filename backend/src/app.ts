import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/auth";
import { success } from "./utils/errors";
import { authRouter } from "./routes/auth";
import { marketsRouter } from "./routes/markets";
import { watchlistRouter } from "./routes/watchlist";
import { ordersRouter } from "./routes/orders";
import { portfolioRouter } from "./routes/portfolio";
import { brokerRouter } from "./routes/broker";
import { botRouter } from "./routes/bot";
import { analyticsRouter } from "./routes/analytics";
import { notificationsRouter } from "./routes/notifications";
import { adminRouter } from "./routes/admin";

import mongoose from "mongoose";
import { appContext } from "./config/context";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        const allowed = env.CORS_ORIGIN.split(",").map((s) => s.trim());
        if (allowed.includes(requestOrigin) || requestOrigin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(passport.initialize());

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests",
        code: "RATE_LIMITED",
      },
    })
  );

  app.get("/health", (_req, res) => {
    const dbStateMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    const dbState = dbStateMap[mongoose.connection.readyState] || "unknown";

    res.json(
      success({
        status: "ok",
        service: "aura-backend",
        environment: env.NODE_ENV,
        db: dbState,
        broker: {
          provider: env.BROKER_PROVIDER,
          adapter: appContext.brokerManager.getAdapter().name,
          isPaper: appContext.brokerManager.isPaper(),
        },
        marketData: {
          provider: env.MARKET_DATA_PROVIDER,
          mode: appContext.marketData.getMode(),
        },
        staticIp: env.STATIC_BACKEND_IP,
        time: new Date().toISOString(),
      })
    );
  });

  app.use("/api/auth", authRouter);
  app.use("/api/markets", marketsRouter);
  app.use("/api/watchlist", watchlistRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/portfolio", portfolioRouter);
  app.use("/api/broker", brokerRouter);
  app.use("/api/bot", botRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/admin", adminRouter);

  app.use(errorMiddleware);
  return app;
}
