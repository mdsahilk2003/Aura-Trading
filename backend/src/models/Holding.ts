import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHolding extends Document {
  userId: Types.ObjectId;
  instrumentId: Types.ObjectId;
  symbol: string;
  quantity: number;
  averagePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const holdingSchema = new Schema<IHolding>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instrumentId: {
      type: Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
    },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    averagePrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Holding = mongoose.model<IHolding>("Holding", holdingSchema);
