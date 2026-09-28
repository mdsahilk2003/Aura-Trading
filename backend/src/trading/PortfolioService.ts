import type { DataMode, HoldingDto, PortfolioDto, PositionDto } from "@aura/shared";
import { Types } from "mongoose";
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

  private buildUserQuery(userId: string) {
    if (Types.ObjectId.isValid(userId)) {
      const objId = new Types.ObjectId(userId);
      return { $or: [{ userId }, { userId: objId }] };
    }
    return { userId };
  }

  async getPortfolio(userId: string): Promise<PortfolioDto> {
    await this.trading.ensureWallet(userId);
    const userQuery = this.buildUserQuery(userId);
    const [wallet, rawHoldings, rawPositions] = await Promise.all([
      Wallet.findOne(userQuery),
      Holding.find(userQuery),
      Position.find(userQuery),
    ]);

    const holdings = rawHoldings.filter((h) => Number(h.quantity) > 0);
    const positions = rawPositions.filter((p) => Number(p.quantity) > 0);

    const userObjId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    let portfolio = await Portfolio.findOne(userQuery);
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: userObjId, invested: 0, snapshotValue: 0 });
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
      const price = q?.price && q.price > 0 ? q.price : Number(h.averagePrice);
      const hQuantity = Number(h.quantity);
      const hAvgPrice = Number(h.averagePrice);
      const hInvested = hQuantity * hAvgPrice;
      const hVal = hQuantity * price;
      invested += hInvested;
      currentValue += hVal;
      todaysPnl += (q?.change ?? 0) * hQuantity;
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
    const userQuery = this.buildUserQuery(userId);
    let rawHoldings = await Holding.find(userQuery);
    let holdings = rawHoldings.filter((h) => Number(h.quantity) > 0);

    if (!holdings.length) {
      let rawPositions = await Position.find(userQuery);
      let positions = rawPositions.filter((p) => Number(p.quantity) > 0);
      if (!positions.length) return [];
      holdings = positions.map((p) => ({
        _id: p._id,
        userId: p.userId,
        instrumentId: p.instrumentId,
        symbol: p.symbol,
        quantity: Number(p.quantity),
        averagePrice: Number(p.averagePrice),
      } as any));
    }
    const quotes = await this.marketData.getQuotes(holdings.map((h) => h.symbol));
    const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    return holdings.map((h) => {
      const q = quoteMap.get(h.symbol.toUpperCase()) || liveQuoteFromSeries(h.symbol);
      const hQuantity = Number(h.quantity);
      const hAvgPrice = Number(h.averagePrice);
      const currentPrice = q?.price && q.price > 0 ? q.price : hAvgPrice;
      const invested = hQuantity * hAvgPrice;
      const currentValue = hQuantity * currentPrice;
      const pnl = currentValue - invested;
      return {
        symbol: h.symbol,
        instrumentId: String(h.instrumentId),
        quantity: hQuantity,
        averagePrice: hAvgPrice,
        currentPrice,
        invested,
        currentValue,
        pnl,
        pnlPercent: invested ? (pnl / invested) * 100 : 0,
        dayChange: (q?.change ?? 0) * hQuantity,
        dayChangePercent: q?.changePercent ?? 0,
      };
    });
  }

  async getPositions(userId: string): Promise<PositionDto[]> {
    const userQuery = this.buildUserQuery(userId);
    let rawPositions = await Position.find(userQuery);
    const positions = rawPositions.filter((p) => Number(p.quantity) > 0);
    if (!positions.length) return [];
    const quotes = await this.marketData.getQuotes(positions.map((p) => p.symbol));
    const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

    return positions.map((p) => {
      const q = quoteMap.get(p.symbol.toUpperCase()) || liveQuoteFromSeries(p.symbol);
      const pQuantity = Number(p.quantity);
      const pAvgPrice = Number(p.averagePrice);
      const currentPrice = q?.price && q.price > 0 ? q.price : pAvgPrice;
      const pnl = (currentPrice - pAvgPrice) * pQuantity;
      return {
        symbol: p.symbol,
        instrumentId: String(p.instrumentId),
        quantity: pQuantity,
        averagePrice: pAvgPrice,
        currentPrice,
        pnl,
        pnlPercent: pAvgPrice ? ((currentPrice - pAvgPrice) / pAvgPrice) * 100 : 0,
        side: p.side,
      };
    });
  }
}
