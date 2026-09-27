import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
