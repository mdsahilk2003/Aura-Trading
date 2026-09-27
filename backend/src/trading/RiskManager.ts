import { ERROR_CODES, RISK_DEFAULTS, type PlaceOrderRequest } from "@aura/shared";
import { AppError } from "../utils/errors";
import { Order } from "../models/Order";
import { TradingBot } from "../models/TradingBot";
import { Wallet } from "../models/Wallet";

export interface RiskContext {
  userId: string;
  order: PlaceOrderRequest;
  estimatedValue: number;
  availableFunds: number;
  isBot?: boolean;
}

export class RiskManager {
  async validate(ctx: RiskContext): Promise<void> {
    const { order, estimatedValue, availableFunds, userId, isBot } = ctx;

    if (order.side === "BUY" && estimatedValue > availableFunds) {
      throw new AppError(
        "Insufficient funds for this order",
        422,
        ERROR_CODES.INSUFFICIENT_FUNDS
      );
    }

    const wallet = await Wallet.findOne({ userId });
    const equity = wallet?.balance ?? availableFunds;
    const maxPosition = equity * (RISK_DEFAULTS.maxPositionPercent / 100);
    if (order.side === "BUY" && estimatedValue > maxPosition) {
      throw new AppError(
        `Order exceeds maximum position size (${RISK_DEFAULTS.maxPositionPercent}%)`,
        422,
        ERROR_CODES.RISK_REJECTED
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const tradesToday = await Order.countDocuments({
      userId,
      createdAt: { $gte: startOfDay },
      status: { $nin: ["CANCELLED", "REJECTED", "FAILED"] },
    });
    if (tradesToday >= RISK_DEFAULTS.maxTradesPerDay) {
      throw new AppError(
        "Daily trade limit reached",
        422,
        ERROR_CODES.RISK_REJECTED
      );
    }

    if (isBot) {
      const bot = await TradingBot.findOne({ userId });
      if (bot) {
        const today = new Date().toDateString();
        if (bot.dailyLossResetAt.toDateString() !== today) {
          bot.dailyLoss = 0;
          bot.dailyLossResetAt = new Date();
          await bot.save();
        }
        if (bot.dailyLoss >= bot.maxDailyLoss) {
          throw new AppError(
            "Bot maximum daily loss reached",
            422,
            ERROR_CODES.RISK_REJECTED
          );
        }
      }
    }
  }
}
