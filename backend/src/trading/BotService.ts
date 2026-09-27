import type { BotDto, BotStrategy, ChartTimeframe } from "@aura/shared";
import { WS_EVENTS } from "@aura/shared";
import type { Server as SocketServer } from "socket.io";
import type { MarketDataService } from "../market-data/MarketDataService";
import type { TradingService } from "./TradingService";
import { TradingBot } from "../models/TradingBot";
import { BotExecution } from "../models/BotExecution";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";

export class BotService {
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private marketData: MarketDataService,
    private trading: TradingService,
    private io?: SocketServer
  ) {}

  setIo(io: SocketServer) {
    this.io = io;
  }

  async getBot(userId: string): Promise<BotDto> {
    let bot = await TradingBot.findOne({ userId });
    if (!bot) {
      bot = await TradingBot.create({
        userId,
        status: "IDLE",
        strategy: "MA_CROSSOVER",
        capital: 100000,
        maxDailyLoss: 5000,
        symbols: ["RELIANCE"],
        mode: "PAPER",
      });
    }
    return this.toDto(bot);
  }

  async start(
    userId: string,
    input: {
      strategy: BotStrategy;
      capital: number;
      maxDailyLoss: number;
      symbols: string[];
    }
  ): Promise<BotDto> {
    let bot = await TradingBot.findOne({ userId });
    if (!bot) {
      bot = await TradingBot.create({ userId, ...input, mode: "PAPER" });
    } else {
      bot.strategy = input.strategy;
      bot.capital = input.capital;
      bot.maxDailyLoss = input.maxDailyLoss;
      bot.symbols = input.symbols.map((s) => s.toUpperCase());
      bot.mode = "PAPER";
      bot.status = "RUNNING";
      await bot.save();
    }
    bot.status = "RUNNING";
    await bot.save();

    this.schedule(userId, bot.id);
    await Notification.create({
      userId,
      type: "BOT_STARTED",
      title: "Trading bot started",
      message: `Paper bot running ${bot.strategy} on ${bot.symbols.join(", ")}`,
      read: false,
    });
    await AuditLog.create({
      userId,
      action: "BOT_START",
      resource: "TradingBot",
      resourceId: bot.id,
    });

    const dto = this.toDto(bot);
    this.io?.to(`user:${userId}`).emit(WS_EVENTS.BOT_UPDATE, dto);
    return dto;
  }

  async stop(userId: string): Promise<BotDto> {
    const bot = await TradingBot.findOne({ userId });
    if (!bot) return this.getBot(userId);
    bot.status = "STOPPED";
    await bot.save();
    const timer = this.timers.get(userId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(userId);
    }
    await Notification.create({
      userId,
      type: "BOT_STOPPED",
      title: "Trading bot stopped",
      message: "Paper trading bot has been stopped",
      read: false,
    });
    const dto = this.toDto(bot);
    this.io?.to(`user:${userId}`).emit(WS_EVENTS.BOT_UPDATE, dto);
    return dto;
  }

  async performance(userId: string) {
    const bot = await this.getBot(userId);
    const executions = await BotExecution.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return {
      bot,
      executions: executions.map((e) => ({
        id: e.id,
        symbol: e.symbol,
        signal: e.signal,
        reason: e.reason,
        pnl: e.pnl ?? 0,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }

  private schedule(userId: string, _botId: string) {
    const existing = this.timers.get(userId);
    if (existing) clearInterval(existing);
    const timer = setInterval(() => {
      void this.tick(userId);
    }, 30_000);
    this.timers.set(userId, timer);
    void this.tick(userId);
  }

  private async tick(userId: string) {
    const bot = await TradingBot.findOne({ userId });
    if (!bot || bot.status !== "RUNNING") return;

    for (const symbol of bot.symbols) {
      const history = await this.marketData.getHistoricalData(
        symbol,
        "1D" as ChartTimeframe
      );
      const closes = history.bars.map((b) => b.close);
      const signal = this.evaluate(bot.strategy, closes);
      await BotExecution.create({
        botId: bot._id,
        userId,
        symbol,
        signal: signal.action,
        reason: signal.reason,
      });

      if (signal.action === "HOLD") continue;

      try {
        const qty = Math.max(1, Math.floor(bot.capital / (closes.at(-1) ?? 1) / 20));
        const order = await this.trading.placeOrder(
          userId,
          {
            symbol,
            side: signal.action,
            orderType: "MARKET",
            quantity: qty,
          },
          { isBot: true }
        );
        bot.trades += 1;
        if (order.status === "FILLED") {
          // Simplified win tracking: buy = pending, sell marks a cycle
          if (signal.action === "SELL") bot.wins += 1;
        }
        await bot.save();
      } catch {
        // Risk/funds rejection — recorded via execution reason only
      }
    }

    this.io?.to(`user:${userId}`).emit(WS_EVENTS.BOT_UPDATE, this.toDto(bot));
  }

  private evaluate(
    strategy: BotStrategy,
    closes: number[]
  ): { action: "BUY" | "SELL" | "HOLD"; reason: string } {
    if (closes.length < 20) {
      return { action: "HOLD", reason: "Insufficient data" };
    }
    const last = closes[closes.length - 1];
    const sma = (n: number) =>
      closes.slice(-n).reduce((a, b) => a + b, 0) / Math.min(n, closes.length);

    if (strategy === "MA_CROSSOVER") {
      const fast = sma(5);
      const slow = sma(20);
      if (fast > slow * 1.001) return { action: "BUY", reason: `MA cross up (${fast.toFixed(2)} > ${slow.toFixed(2)})` };
      if (fast < slow * 0.999) return { action: "SELL", reason: `MA cross down (${fast.toFixed(2)} < ${slow.toFixed(2)})` };
      return { action: "HOLD", reason: "No MA crossover" };
    }

    if (strategy === "RSI") {
      const gains: number[] = [];
      const losses: number[] = [];
      for (let i = closes.length - 14; i < closes.length; i += 1) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains.push(diff);
        else losses.push(-diff);
      }
      const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / 14 || 0.0001;
      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      if (rsi < 30) return { action: "BUY", reason: `RSI oversold (${rsi.toFixed(1)})` };
      if (rsi > 70) return { action: "SELL", reason: `RSI overbought (${rsi.toFixed(1)})` };
      return { action: "HOLD", reason: `RSI neutral (${rsi.toFixed(1)})` };
    }

    // MOMENTUM
    const prev = closes[closes.length - 6];
    const mom = ((last - prev) / prev) * 100;
    if (mom > 1.5) return { action: "BUY", reason: `Positive momentum ${mom.toFixed(2)}%` };
    if (mom < -1.5) return { action: "SELL", reason: `Negative momentum ${mom.toFixed(2)}%` };
    return { action: "HOLD", reason: `Flat momentum ${mom.toFixed(2)}%` };
  }

  private toDto(bot: InstanceType<typeof TradingBot>): BotDto {
    return {
      id: bot.id,
      status: bot.status,
      strategy: bot.strategy,
      capital: bot.capital,
      trades: bot.trades,
      winRate: bot.trades ? (bot.wins / bot.trades) * 100 : 0,
      pnl: bot.pnl,
      maxDailyLoss: bot.maxDailyLoss,
      mode: bot.mode,
      symbols: bot.symbols,
      updatedAt: bot.updatedAt.toISOString(),
    };
  }
}
