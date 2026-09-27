import mongoose, { Document, Schema, Types } from "mongoose";

export type WalletTxnType =
  | "CREDIT"
  | "DEBIT"
  | "ORDER_RESERVE"
  | "ORDER_RELEASE"
  | "TRADE_SETTLE";

export interface IWalletTransaction extends Document {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  type: WalletTxnType;
  amount: number;
  balanceAfter: number;
  reference?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "ORDER_RESERVE", "ORDER_RELEASE", "TRADE_SETTLE"],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reference: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema
);
