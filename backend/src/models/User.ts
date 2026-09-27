import mongoose, { Document, Schema, Types } from "mongoose";
import type { UserRole } from "@aura/shared";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  googleId?: string;
  passwordHash?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    googleId: { type: String, sparse: true, unique: true },
    passwordHash: { type: String },
    avatar: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
