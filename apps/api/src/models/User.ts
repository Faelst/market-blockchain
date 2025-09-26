import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  bio?: string;
  avatarSeed?: string;
  balance: number;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    bio: { type: String },
    avatarSeed: { type: String },
    balance: { type: Number, default: 100 },
    favorites: [{ type: Schema.Types.ObjectId, ref: "NFT", default: [] }],
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
