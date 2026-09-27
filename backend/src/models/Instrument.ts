import mongoose, { Document, Schema, Types } from "mongoose";

export interface IInstrument extends Document {
  _id: Types.ObjectId;
  symbol: string;
  name: string;
  exchange: string;
  segment: string;
  lotSize: number;
  tickSize: number;
  isin?: string;
  sector?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const instrumentSchema = new Schema<IInstrument>(
  {
    symbol: { type: String, required: true, uppercase: true, unique: true, index: true },
    name: { type: String, required: true, index: "text" },
    exchange: { type: String, required: true, default: "NSE" },
    segment: { type: String, required: true, default: "EQ" },
    lotSize: { type: Number, default: 1 },
    tickSize: { type: Number, default: 0.05 },
    isin: { type: String },
    sector: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Instrument = mongoose.model<IInstrument>("Instrument", instrumentSchema);
