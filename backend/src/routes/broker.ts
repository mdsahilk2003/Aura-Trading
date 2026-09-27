import { Router } from "express";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { success } from "../utils/errors";
import { appContext } from "../config/context";

import { AngelOneBrokerAdapter } from "../brokers/AngelOneBrokerAdapter";

export const brokerRouter = Router();
brokerRouter.use(requireAuth);

brokerRouter.get(
  "/profile",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.brokerManager.getAdapter().getProfile(req.user!.id);
    return res.json(success(data));
  })
);

brokerRouter.get(
  "/funds",
  asyncHandler(async (req: AuthRequest, res) => {
    await appContext.trading.ensureWallet(req.user!.id);
    const data = await appContext.brokerManager.getAdapter().getFunds(req.user!.id);
    return res.json(success(data));
  })
);

brokerRouter.get(
  "/holdings",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.brokerManager.getAdapter().getHoldings(req.user!.id);
    return res.json(success(data));
  })
);

brokerRouter.get(
  "/positions",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.brokerManager.getAdapter().getPositions(req.user!.id);
    return res.json(success(data));
  })
);

brokerRouter.get(
  "/orders",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.brokerManager.getAdapter().getOrders(req.user!.id);
    return res.json(success(data));
  })
);

brokerRouter.get(
  "/angelone/status",
  asyncHandler(async (_req: AuthRequest, res) => {
    const adapter = appContext.brokerManager.getAdapter();
    if (adapter instanceof AngelOneBrokerAdapter) {
      return res.json(success(adapter.getSessionStatus()));
    }
    return res.json(
      success({
        authenticated: false,
        clientCode: null,
        message: "Broker provider is not set to Angel One",
        staticIp: "65.1.222.7",
      })
    );
  })
);

brokerRouter.post(
  "/angelone/login",
  asyncHandler(async (_req: AuthRequest, res) => {
    const adapter = appContext.brokerManager.getAdapter();
    if (adapter instanceof AngelOneBrokerAdapter) {
      const session = await adapter.authenticate();
      return res.json(
        success({
          authenticated: true,
          authenticatedAt: session.authenticatedAt,
          feedTokenConfigured: Boolean(session.feedToken),
        })
      );
    }
    return res.status(400).json({
      success: false,
      message: "Angel One broker is not configured in env (BROKER_PROVIDER != angelone)",
      code: "BAD_REQUEST",
    });
  })
);

brokerRouter.post(
  "/angelone/sync",
  asyncHandler(async (req: AuthRequest, res) => {
    const holdings = await appContext.brokerManager.getAdapter().getHoldings(req.user!.id);
    const positions = await appContext.brokerManager.getAdapter().getPositions(req.user!.id);
    const orders = await appContext.brokerManager.getAdapter().getOrders(req.user!.id);
    return res.json(
      success({
        ordersSynced: orders.length,
        holdingsSynced: holdings.length,
        positionsSynced: positions.length,
        timestamp: new Date().toISOString(),
      })
    );
  })
);

