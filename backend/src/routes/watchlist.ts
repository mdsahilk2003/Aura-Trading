import { Router } from "express";
import { watchlistSymbolSchema } from "@aura/shared";
import { asyncHandler, requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { success, AppError } from "../utils/errors";
import { ERROR_CODES } from "@aura/shared";
import { Watchlist } from "../models/Watchlist";
import { Instrument } from "../models/Instrument";
import { appContext } from "../config/context";

export const watchlistRouter = Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    let list = await Watchlist.findOne({ userId: req.user!.id });
    if (!list) {
      list = await Watchlist.create({ userId: req.user!.id, symbols: [] });
    }
    const quotes = list.symbols.length
      ? await appContext.marketData.getQuotes(list.symbols)
      : [];
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
    const instruments = await Instrument.find({ symbol: { $in: list.symbols } });
    const nameMap = new Map(instruments.map((i) => [i.symbol, i.name]));

    return res.json(
      success(
        list.symbols.map((symbol) => ({
          symbol,
          name: nameMap.get(symbol) || symbol,
          quote: quoteMap.get(symbol)!,
        }))
      )
    );
  })
);

watchlistRouter.post(
  "/",
  validateBody(watchlistSymbolSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const symbol = req.body.symbol.toUpperCase();
    const instrument = await Instrument.findOne({ symbol, isActive: true });
    if (!instrument) {
      throw new AppError("Instrument not found", 404, ERROR_CODES.NOT_FOUND);
    }
    let list = await Watchlist.findOne({ userId: req.user!.id });
    if (!list) {
      list = await Watchlist.create({ userId: req.user!.id, symbols: [symbol] });
    } else if (!list.symbols.includes(symbol)) {
      list.symbols.push(symbol);
      await list.save();
    }
    return res.status(201).json(success({ symbols: list.symbols }));
  })
);

watchlistRouter.delete(
  "/:symbol",
  asyncHandler(async (req: AuthRequest, res) => {
    const symbol = String(req.params.symbol).toUpperCase();
    const list = await Watchlist.findOne({ userId: req.user!.id });
    if (!list) {
      return res.json(success({ symbols: [] }));
    }
    list.symbols = list.symbols.filter((s) => s !== symbol);
    await list.save();
    return res.json(success({ symbols: list.symbols }));
  })
);
