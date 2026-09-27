import { Router } from "express";
import {
  modifyOrderSchema,
  paginationSchema,
  placeOrderSchema,
} from "@aura/shared";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { success } from "../utils/errors";
import { appContext } from "../config/context";

import { orderIdempotencyMiddleware } from "../middleware/idempotency";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

ordersRouter.post(
  "/",
  orderIdempotencyMiddleware,
  validateBody(placeOrderSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await appContext.trading.placeOrder(req.user!.id, req.body);
    return res.status(201).json(success(order));
  })
);

ordersRouter.get(
  "/",
  validateQuery(paginationSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const q = (req as typeof req & {
      validatedQuery: {
        page: number;
        limit: number;
        side?: "BUY" | "SELL";
        status?: string;
        search?: string;
      };
    }).validatedQuery;
    const data = await appContext.trading.getOrders(req.user!.id, q);
    return res.json(success(data));
  })
);

ordersRouter.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await appContext.trading.getOrder(
      req.user!.id,
      String(req.params.id)
    );
    return res.json(success(order));
  })
);

ordersRouter.patch(
  "/:id",
  validateBody(modifyOrderSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await appContext.trading.modifyOrder(
      req.user!.id,
      String(req.params.id),
      req.body
    );
    return res.json(success(order));
  })
);

ordersRouter.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await appContext.trading.cancelOrder(
      req.user!.id,
      String(req.params.id)
    );
    return res.json(success(order));
  })
);
