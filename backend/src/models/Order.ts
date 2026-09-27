import mongoose, { Document, Schema, Types } from "mongoose";
import type { OrderSide, OrderStatus, OrderType } from "@aura/shared";

export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  brokerOrderId?: string;
  instrumentId: Types.ObjectId;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  price?: number;
  triggerPrice?: number;
  averagePrice?: number;
  status: OrderStatus;
  rejectionReason?: string;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    brokerOrderId: { type: String, index: true },
    instrumentId: {
      type: Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
    },
    symbol: { type: String, required: true, uppercase: true, index: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    orderType: {
      type: String,
      enum: ["MARKET", "LIMIT", "STOP_LOSS", "STOP_LOSS_LIMIT"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    filledQuantity: { type: Number, default: 0, min: 0 },
    price: { type: Number },
    triggerPrice: { type: Number },
    averagePrice: { type: Number },
    status: {
      type: String,
      enum: [
        "PENDING",
        "OPEN",
        "PARTIALLY_FILLED",
        "FILLED",
        "CANCELLED",
        "REJECTED",
        "FAILED",
      ],
      default: "PENDING",
      index: true,
    },
    rejectionReason: { type: String },
    executedAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
