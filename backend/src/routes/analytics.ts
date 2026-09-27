import { Router } from "express";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { success } from "../utils/errors";
import { Trade } from "../models/Trade";
import { Order } from "../models/Order";
import { appContext } from "../config/context";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get(
  "/pnl",
  asyncHandler(async (req: AuthRequest, res) => {
    const trades = await Trade.find({ userId: req.user!.id }).sort({ executedAt: 1 });
    const labels: string[] = [];
    const values: number[] = [];
    let cumulative = 0;
    let wins = 0;

    // Approximate P&L: BUY decreases cash basis, SELL realizes vs avg (simplified)
    const costBasis = new Map<string, { qty: number; avg: number }>();
    for (const t of trades) {
      const key = t.symbol;
      if (t.side === "BUY") {
        const cur = costBasis.get(key) || { qty: 0, avg: 0 };
        const totalQty = cur.qty + t.quantity;
        cur.avg = totalQty
          ? (cur.avg * cur.qty + t.price * t.quantity) / totalQty
          : 0;
        cur.qty = totalQty;
        costBasis.set(key, cur);
      } else {
        const cur = costBasis.get(key) || { qty: 0, avg: t.price };
        const pnl = (t.price - cur.avg) * t.quantity;
        cumulative += pnl;
        if (pnl >= 0) wins += 1;
        cur.qty = Math.max(0, cur.qty - t.quantity);
        costBasis.set(key, cur);
      }
      labels.push(t.executedAt.toISOString().slice(0, 10));
      values.push(Number(cumulative.toFixed(2)));
    }

    const sells = trades.filter((t) => t.side === "SELL").length;
    return res.json(
      success({
        labels,
        values,
        totalPnl: cumulative,
        winRate: sells ? (wins / sells) * 100 : 0,
        mode: appContext.brokerManager.isPaper() ? "PAPER" : "LIVE",
      })
    );
  })
);

analyticsRouter.get(
  "/performance",
  asyncHandler(async (req: AuthRequest, res) => {
    const portfolio = await appContext.portfolio.getPortfolio(req.user!.id);
    const trades = await Trade.find({ userId: req.user!.id }).sort({ executedAt: 1 });
    const orders = await Order.find({ userId: req.user!.id });

    const equityCurve: { date: string; value: number }[] = [];
    let cash = portfolio.availableFunds + portfolio.invested;
    // Start from paper seed approximation
    let running = cash - portfolio.overallPnl;
    const byDay = new Map<string, number>();

    for (const t of trades) {
      const day = t.executedAt.toISOString().slice(0, 10);
      if (t.side === "BUY") running -= 0; // already reflected in holdings
      byDay.set(day, (byDay.get(day) || 0) + (t.side === "SELL" ? t.value : -t.value));
      equityCurve.push({ date: day, value: portfolio.totalValue });
    }

    if (!equityCurve.length) {
      equityCurve.push({
        date: new Date().toISOString().slice(0, 10),
        value: portfolio.totalValue,
      });
    }

    const monthlyMap = new Map<string, number>();
    for (const [day, v] of byDay) {
      const month = day.slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + v);
    }

    const statusDist = ["FILLED", "CANCELLED", "REJECTED", "OPEN"].map((label) => ({
      label,
      value: orders.filter((o) => o.status === label).length,
    }));

    return res.json(
      success({
        equityCurve,
        monthly: [...monthlyMap.entries()].map(([month, pnl]) => ({ month, pnl })),
        tradeDistribution: statusDist,
        mode: portfolio.mode,
      })
    );
  })
);
