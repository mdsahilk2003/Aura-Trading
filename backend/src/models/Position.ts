import mongoose, { Document, Schema, Types } from "mongoose";
import type { OrderSide } from "@aura/shared";

export interface IPosition extends Document {
  userId: Types.ObjectId;
  instrumentId: Types.ObjectId;
  symbol: string;
  quantity: number;
  averagePrice: number;
  side: OrderSide;
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new Schema<IPosition>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instrumentId: {
      type: Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
    },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true },
    averagePrice: { type: Number, required: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
  },
  { timestamps: true }
);

positionSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Position = mongoose.model<IPosition>("Position", positionSchema);
