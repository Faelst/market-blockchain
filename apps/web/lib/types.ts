export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  bio?: string;
  avatarSeed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  ownedNfts: number;
  createdNfts: number;
  createdCollections: number;
  totalEarned: number;
  totalSpent: number;
}

export interface Attribute {
  trait_type: string;
  value: string;
  rarity?: string;
}

export interface NFT {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageSeed?: string;
  videoUrl?: string;
  audioUrl?: string;
  creator: User;
  owner: User;
  collectionId?: string;
  collection?: Collection;
  attributes: Attribute[];
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
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  creator: User;
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
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'mint' | 'sale' | 'transfer' | 'list' | 'unlist';

export interface Transaction {
  id: string;
  type: TransactionType;
  nft: NFT;
  from?: User;
  to?: User;
  price?: number;
  createdAt: string;
}

export interface MarketStats {
  timestamp: string;
  totals: {
    sales24h: number;
    volume24h: number;
  };
  topCollections: Array<{
    collectionId: string;
    collection?: Collection;
    volume: number;
    sales: number;
  }>;
  trendingNfts: NFT[];
  featured: NFT[];
}

export interface NFTQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: 'new' | 'price_asc' | 'price_desc';
}

export interface CollectionQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  bio?: string;
}

export interface CreateNFTForm {
  name: string;
  description?: string;
  collectionId?: string;
  price?: number;
  attributes?: Attribute[];
  imageSeed?: string;
  imageUrl?: string;
}

export interface CreateCollectionForm {
  name: string;
  description?: string;
  category?: string;
  bannerSeed?: string;
}

export interface UpdateProfileForm {
  username?: string;
  bio?: string;
  avatarSeed?: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
}