import { Router } from "express";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { success } from "../utils/errors";
import { appContext } from "../config/context";

export const portfolioRouter = Router();
portfolioRouter.use(requireAuth);

portfolioRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.portfolio.getPortfolio(req.user!.id);
    return res.json(success(data));
  })
);

portfolioRouter.get(
  "/holdings",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.portfolio.getHoldings(req.user!.id);
    return res.json(success(data));
  })
);

portfolioRouter.get(
  "/positions",
  asyncHandler(async (req: AuthRequest, res) => {
    const data = await appContext.portfolio.getPositions(req.user!.id);
    return res.json(success(data));
  })
);
