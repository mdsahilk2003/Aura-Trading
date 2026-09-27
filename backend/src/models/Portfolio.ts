import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPortfolio extends Document {
  userId: Types.ObjectId;
  invested: number;
  snapshotValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    invested: { type: Number, default: 0 },
    snapshotValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Portfolio = mongoose.model<IPortfolio>("Portfolio", portfolioSchema);
