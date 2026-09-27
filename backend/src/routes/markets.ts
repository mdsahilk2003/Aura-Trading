import { Router } from "express";
import {
  chartTimeframeSchema,
  marketSearchSchema,
} from "@aura/shared";
import { asyncHandler, optionalAuth } from "../middleware/auth";
import { validateQuery } from "../middleware/validate";
import { success } from "../utils/errors";
import { appContext } from "../config/context";
import { Instrument } from "../models/Instrument";
import { z } from "zod";

export const marketsRouter = Router();

marketsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const instruments = await Instrument.find({ isActive: true }).limit(50);
    const quotes = await appContext.marketData.getQuotes(
      instruments.map((i) => i.symbol)
    );
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
    return res.json(
      success({
        mode: appContext.marketData.getMode(),
        provider: appContext.marketData.getProviderName(),
        instruments: instruments.map((i) => ({
          id: i.id,
          symbol: i.symbol,
          name: i.name,
          exchange: i.exchange,
          segment: i.segment,
          lotSize: i.lotSize,
          tickSize: i.tickSize,
          sector: i.sector,
          quote: quoteMap.get(i.symbol),
        })),
      })
    );
  })
);

marketsRouter.get(
  "/status",
  asyncHandler(async (_req, res) => {
    const status = await appContext.marketData.getMarketStatus();
    return res.json(success(status));
  })
);

marketsRouter.get(
  "/search",
  validateQuery(marketSearchSchema),
  asyncHandler(async (req, res) => {
    const { q, limit } = (req as typeof req & {
      validatedQuery: { q: string; limit: number };
    }).validatedQuery;
    const instruments = await Instrument.find({
      isActive: true,
      $or: [
        { symbol: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    }).limit(limit);
    const quotes = await appContext.marketData.getQuotes(
      instruments.map((i) => i.symbol)
    );
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
    return res.json(
      success(
        instruments.map((i) => ({
          id: i.id,
          symbol: i.symbol,
          name: i.name,
          exchange: i.exchange,
          quote: quoteMap.get(i.symbol),
        }))
      )
    );
  })
);

marketsRouter.get(
  "/indices",
  asyncHandler(async (_req, res) => {
    const symbols = ["NIFTY50", "SENSEX", "BANKNIFTY"];
    const quotes = await appContext.marketData.getQuotes(symbols);
    return res.json(
      success({
        mode: appContext.marketData.getMode(),
        indices: quotes,
      })
    );
  })
);

marketsRouter.get(
  "/movers",
  asyncHandler(async (_req, res) => {
    const instruments = await Instrument.find({
      isActive: true,
      segment: "EQ",
    }).limit(30);
    const quotes = await appContext.marketData.getQuotes(
      instruments.map((i) => i.symbol)
    );
    const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
    return res.json(
      success({
        mode: appContext.marketData.getMode(),
        gainers: sorted.slice(0, 5),
        losers: sorted.slice(-5).reverse(),
      })
    );
  })
);

const historyQuery = z.object({
  timeframe: chartTimeframeSchema.optional().default("1D"),
});

marketsRouter.get(
  "/:symbol/history",
  validateQuery(historyQuery),
  asyncHandler(async (req, res) => {
    const { timeframe } = (req as typeof req & {
      validatedQuery: { timeframe: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" };
    }).validatedQuery;
    const data = await appContext.marketData.getHistoricalData(
      String(req.params.symbol),
      timeframe
    );
    return res.json(success(data));
  })
);

marketsRouter.get(
  "/:symbol",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const symbol = String(req.params.symbol).toUpperCase();
    const instrument = await Instrument.findOne({ symbol, isActive: true });
    const quote = await appContext.marketData.getQuote(symbol);
    return res.json(
      success({
        instrument: instrument
          ? {
              id: instrument.id,
              symbol: instrument.symbol,
              name: instrument.name,
              exchange: instrument.exchange,
              segment: instrument.segment,
              lotSize: instrument.lotSize,
              tickSize: instrument.tickSize,
              sector: instrument.sector,
            }
          : {
              id: symbol,
              symbol,
              name: symbol,
              exchange: "NSE",
              segment: "EQ",
              lotSize: 1,
              tickSize: 0.05,
            },
        quote,
      })
    );
  })
);
