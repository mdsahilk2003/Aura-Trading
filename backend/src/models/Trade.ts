import mongoose, { Document, Schema, Types } from "mongoose";
import type { OrderSide } from "@aura/shared";

export interface ITrade extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  instrumentId: Types.ObjectId;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  value: number;
  executedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tradeSchema = new Schema<ITrade>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    instrumentId: {
      type: Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
    },
    symbol: { type: String, required: true, uppercase: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    value: { type: Number, required: true },
    executedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

tradeSchema.index({ userId: 1, executedAt: -1 });

export const Trade = mongoose.model<ITrade>("Trade", tradeSchema);
