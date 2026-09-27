import mongoose, { Document, Schema } from "mongoose";
import type { BotStrategy } from "@aura/shared";

export interface IStrategy extends Document {
  key: BotStrategy;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const strategySchema = new Schema<IStrategy>(
  {
    key: {
      type: String,
      enum: ["MA_CROSSOVER", "RSI", "MOMENTUM"],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Strategy = mongoose.model<IStrategy>("Strategy", strategySchema);
