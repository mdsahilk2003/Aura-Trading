import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOAuthAccount extends Document {
  userId: Types.ObjectId;
  provider: "google";
  providerAccountId: string;
  createdAt: Date;
  updatedAt: Date;
}

const oauthAccountSchema = new Schema<IOAuthAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["google"], required: true },
    providerAccountId: { type: String, required: true },
  },
  { timestamps: true }
);

oauthAccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const OAuthAccount = mongoose.model<IOAuthAccount>(
  "OAuthAccount",
  oauthAccountSchema
);
