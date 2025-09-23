import { Schema, model, Types, Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  creator: Types.ObjectId;
  category?: string;
  bannerSeed?: string;
  bannerUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  totalSupply?: number;
  floorPrice?: number;
  volumeTraded?: number;
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, index: true },
    bannerSeed: { type: String },
    bannerUrl: { type: String },
    logoUrl: { type: String },
    websiteUrl: { type: String },
    twitterUrl: { type: String },
    discordUrl: { type: String },
    totalSupply: { type: Number, default: 0 },
    floorPrice: { type: Number, default: 0 },
    volumeTraded: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

collectionSchema.index({ name: 'text', description: 'text' });
collectionSchema.index({ verified: 1 });
collectionSchema.index({ featured: 1 });
collectionSchema.index({ floorPrice: -1 });
collectionSchema.index({ volumeTraded: -1 });
collectionSchema.index({ totalSupply: -1 });

export const Collection = model<ICollection>('Collection', collectionSchema);