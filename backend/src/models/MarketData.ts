import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMarketData extends Document {
  instrumentId: Types.ObjectId;
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const marketDataSchema = new Schema<IMarketData>(
  {
    instrumentId: {
      type: Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
      index: true,
    },
    symbol: { type: String, required: true, uppercase: true, index: true },
    price: { type: Number, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    previousClose: { type: Number, required: true },
    volume: { type: Number, required: true },
    timestamp: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

marketDataSchema.index({ symbol: 1, timestamp: -1 });

export const MarketData = mongoose.model<IMarketData>("MarketData", marketDataSchema);
