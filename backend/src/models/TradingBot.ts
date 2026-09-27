import mongoose, { Document, Schema, Types } from "mongoose";
import type { BotStatus, BotStrategy, DataMode } from "@aura/shared";

export interface ITradingBot extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: BotStatus;
  strategy: BotStrategy;
  capital: number;
  maxDailyLoss: number;
  symbols: string[];
  mode: DataMode;
  trades: number;
  wins: number;
  pnl: number;
  dailyLoss: number;
  dailyLossResetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tradingBotSchema = new Schema<ITradingBot>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["IDLE", "RUNNING", "STOPPED", "ERROR"],
      default: "IDLE",
    },
    strategy: {
      type: String,
      enum: ["MA_CROSSOVER", "RSI", "MOMENTUM"],
      default: "MA_CROSSOVER",
    },
    capital: { type: Number, default: 100000 },
    maxDailyLoss: { type: Number, default: 5000 },
    symbols: [{ type: String, uppercase: true }],
    mode: { type: String, enum: ["LIVE", "DEMO", "PAPER"], default: "PAPER" },
    trades: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    pnl: { type: Number, default: 0 },
    dailyLoss: { type: Number, default: 0 },
    dailyLossResetAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TradingBot = mongoose.model<ITradingBot>("TradingBot", tradingBotSchema);
