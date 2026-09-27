import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWatchlist extends Document {
  userId: Types.ObjectId;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    symbols: [{ type: String, uppercase: true }],
  },
  { timestamps: true }
);

export const Watchlist = mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
