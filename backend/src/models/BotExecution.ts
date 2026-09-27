import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBotExecution extends Document {
  botId: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: string;
  signal: "BUY" | "SELL" | "HOLD";
  reason: string;
  orderId?: Types.ObjectId;
  pnl?: number;
  createdAt: Date;
  updatedAt: Date;
}

const botExecutionSchema = new Schema<IBotExecution>(
  {
    botId: { type: Schema.Types.ObjectId, ref: "TradingBot", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    signal: { type: String, enum: ["BUY", "SELL", "HOLD"], required: true },
    reason: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    pnl: { type: Number },
  },
  { timestamps: true }
);

botExecutionSchema.index({ userId: 1, createdAt: -1 });

export const BotExecution = mongoose.model<IBotExecution>(
  "BotExecution",
  botExecutionSchema
);
