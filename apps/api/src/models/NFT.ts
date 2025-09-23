import { Schema, model, Types, Document } from 'mongoose';

export interface IAttribute {
  trait_type: string;
  value: string;
  rarity?: string;
}

export interface INFT extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  imageSeed?: string;
  videoUrl?: string;
  audioUrl?: string;
  creator: Types.ObjectId;
  owner: Types.ObjectId;
  collectionId?: Types.ObjectId;
  attributes: IAttribute[];
  price?: number;
  onSale: boolean;
  tokenId?: number;
  contractAddress?: string;
  fileType: 'image' | 'video' | 'audio' | 'gif' | '3d';
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  rarityScore?: number;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const attributeSchema = new Schema<IAttribute>(
  {
    trait_type: { type: String },
    value: { type: String },
    rarity: { type: String },
  },
  { _id: false }
);

const dimensionsSchema = new Schema(
  {
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const nftSchema = new Schema<INFT>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    imageUrl: { type: String },
    imageSeed: { type: String },
    videoUrl: { type: String },
    audioUrl: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' },
    attributes: { type: [attributeSchema], default: [] },
    price: { type: Number },
    onSale: { type: Boolean, default: false },
    tokenId: { type: Number },
    contractAddress: { type: String },
    fileType: { 
      type: String, 
      enum: ['image', 'video', 'audio', 'gif', '3d'], 
      default: 'image' 
    },
    fileSize: { type: Number },
    dimensions: { type: dimensionsSchema },
    rarityScore: { type: Number, min: 0, max: 100 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

nftSchema.index({ name: 'text', description: 'text' });
nftSchema.index({ onSale: 1, price: 1 });
nftSchema.index({ 'attributes.trait_type': 1, 'attributes.value': 1 });
nftSchema.index({ fileType: 1 });
nftSchema.index({ rarityScore: -1 });
nftSchema.index({ views: -1 });
nftSchema.index({ likes: -1 });
nftSchema.index({ tokenId: 1, contractAddress: 1 });

export const NFT = model<INFT>('NFT', nftSchema);