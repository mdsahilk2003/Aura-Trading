import type { DataMode, HoldingDto, PortfolioDto, PositionDto } from "@aura/shared";
import type { MarketDataService } from "../market-data/MarketDataService";
import type { BrokerManager } from "../brokers/BrokerManager";
import { Holding } from "../models/Holding";
import { Position } from "../models/Position";
import { Wallet } from "../models/Wallet";
import { Portfolio } from "../models/Portfolio";
import { TradingService } from "./TradingService";
import { liveQuoteFromSeries } from "../utils/marketSimulation";

export class PortfolioService {
  constructor(
    private marketData: MarketDataService,
    private brokerManager: BrokerManager,
    private trading: TradingService
  ) {}

  async getPortfolio(userId: string): Promise<PortfolioDto> {
    await this.trading.ensureWallet(userId);
    const [wallet, holdings, positions] = await Promise.all([
      Wallet.findOne({ userId }),
      Holding.find({ userId, quantity: { $gt: 0 } }),
      Position.find({ userId, quantity: { $gt: 0 } }),
    ]);

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId, invested: 0, snapshotValue: 0 });
    }

    const symbols = Array.from(
      new Set([...holdings.map((h) => h.symbol), ...positions.map((p) => p.symbol)])
    );

    const quotes =
      symbols.length > 0 ? await this.marketData.getQuotes(symbols) : [];
    const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    let invested = 0;
    let currentValue = 0;
    let todaysPnl = 0;

    const activeItems = holdings.length > 0 ? holdings : positions;
    for (const h of activeItems) {
      const q = quoteMap.get(h.symbol.toUpperCase()) || liveQuoteFromSeries(h.symbol);
      const price = q?.price && q.price > 0 ? q.price : h.averagePrice;
      const hInvested = h.quantity * h.averagePrice;
      const hVal = h.quantity * price;
      invested += hInvested;
      currentValue += hVal;
      todaysPnl += (q?.change ?? 0) * h.quantity;
    }

    const overallPnl = currentValue - invested;
    const availableFunds = wallet?.balance ?? 0;
    const totalValue = currentValue + availableFunds;
    const mode: DataMode = this.brokerManager.isPaper()
      ? "PAPER"
      : this.marketData.getMode();

    portfolio.invested = invested;
    portfolio.snapshotValue = currentValue;
    await portfolio.save();

    return {
      totalValue,
      invested,
      currentValue,
      availableFunds,
      todaysPnl,
      todaysPnlPercent: invested ? (todaysPnl / invested) * 100 : 0,
      overallPnl,
      overallPnlPercent: invested ? (overallPnl / invested) * 100 : 0,
      returnPercent: invested ? (overallPnl / invested) * 100 : 0,
      openPositions: holdings.length || positions.length,
      mode,
    };
  }

  async getHoldings(userId: string): Promise<HoldingDto[]> {
    let holdings = await Holding.find({ userId, quantity: { $gt: 0 } });
    if (!holdings.length) {
      const positions = await Position.find({ userId, quantity: { $gt: 0 } });
      if (!positions.length) return [];
      holdings = positions.map((p) => ({
        _id: p._id,
        userId: p.userId,
        instrumentId: p.instrumentId,
        symbol: p.symbol,
        quantity: p.quantity,
        averagePrice: p.averagePrice,
      } as any));
    }
    const quotes = await this.marketData.getQuotes(holdings.map((h) => h.symbol));
    const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    return holdings.map((h) => {
      const q = quoteMap.get(h.symbol.toUpperCase()) || liveQuoteFromSeries(h.symbol);
      const currentPrice = q?.price && q.price > 0 ? q.price : h.averagePrice;
      const invested = h.quantity * h.averagePrice;
      const currentValue = h.quantity * currentPrice;
      const pnl = currentValue - invested;
      return {
        symbol: h.symbol,
        instrumentId: String(h.instrumentId),
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        currentPrice,
        invested,
        currentValue,
        pnl,
        pnlPercent: invested ? (pnl / invested) * 100 : 0,
        dayChange: (q?.change ?? 0) * h.quantity,
        dayChangePercent: q?.changePercent ?? 0,
      };
    });
  }

  async getPositions(userId: string): Promise<PositionDto[]> {
    const positions = await Position.find({ userId, quantity: { $gt: 0 } });
    if (!positions.length) return [];
    const quotes = await this.marketData.getQuotes(positions.map((p) => p.symbol));
    const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    return positions.map((p) => {
      const q = quoteMap.get(p.symbol.toUpperCase()) || liveQuoteFromSeries(p.symbol);
      const currentPrice = q?.price && q.price > 0 ? q.price : p.averagePrice;
      const pnl = (currentPrice - p.averagePrice) * p.quantity;
      return {
        symbol: p.symbol,
        instrumentId: String(p.instrumentId),
        quantity: p.quantity,
        averagePrice: p.averagePrice,
        currentPrice,
        pnl,
        pnlPercent: p.averagePrice
          ? ((currentPrice - p.averagePrice) / p.averagePrice) * 100
          : 0,
        side: p.side,
      };
    });
  }
}
