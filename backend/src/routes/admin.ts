import { Router } from "express";
import { asyncHandler, requireAdmin } from "../middleware/auth";
import { success } from "../utils/errors";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Trade } from "../models/Trade";
import { TradingBot } from "../models/TradingBot";
import { Instrument } from "../models/Instrument";
import { AuditLog } from "../models/AuditLog";
import { appContext } from "../config/context";
import mongoose from "mongoose";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [users, orders, trades, bots, instruments, audits] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Trade.countDocuments(),
      TradingBot.countDocuments({ status: "RUNNING" }),
      Instrument.countDocuments({ isActive: true }),
      AuditLog.find().sort({ createdAt: -1 }).limit(20),
    ]);

    return res.json(
      success({
        users,
        orders,
        trades,
        runningBots: bots,
        instruments,
        marketProvider: appContext.marketData.getProviderName(),
        marketMode: appContext.marketData.getMode(),
        broker: appContext.brokerManager.getAdapter().name,
        dbReady: mongoose.connection.readyState === 1,
        recentAudits: audits.map((a) => ({
          id: a.id,
          action: a.action,
          resource: a.resource,
          userId: a.userId?.toString(),
          createdAt: a.createdAt.toISOString(),
        })),
      })
    );
  })
);

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    return res.json(
      success(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))
      )
    );
  })
);

adminRouter.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    return res.json(
      success(
        orders.map((o) => ({
          id: o.id,
          userId: String(o.userId),
          symbol: o.symbol,
          side: o.side,
          status: o.status,
          quantity: o.quantity,
          createdAt: o.createdAt.toISOString(),
        }))
      )
    );
  })
);

adminRouter.get(
  "/audit-logs",
  asyncHandler(async (_req, res) => {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.json(
      success(
        logs.map((a) => ({
          id: a.id,
          action: a.action,
          resource: a.resource,
          resourceId: a.resourceId,
          userId: a.userId?.toString(),
          createdAt: a.createdAt.toISOString(),
          meta: a.meta,
        }))
      )
    );
  })
);
