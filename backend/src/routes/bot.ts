import { Router } from "express";
import { botStartSchema } from "@aura/shared";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { success } from "../utils/errors";
import { appContext } from "../config/context";

export const botRouter = Router();
botRouter.use(requireAuth);

botRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.bot.getBot(req.user!.id);
    return res.json(success(data));
  })
);

botRouter.post(
  "/start",
  validateBody(botStartSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.bot.start(req.user!.id, req.body);
    return res.json(success(data));
  })
);

botRouter.post(
  "/stop",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.bot.stop(req.user!.id);
    return res.json(success(data));
  })
);

botRouter.get(
  "/performance",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.bot.performance(req.user!.id);
    return res.json(success(data));
  })
);
