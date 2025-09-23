export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
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
  creator: User;
  owner: User;
  collectionId?: string;
  collection?: Collection;
  attributes: Attribute[];
  price?: number;
  onSale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNFTRequest {
  name: string;
  description?: string;
  collectionId?: string;
  price?: number;
  attributes?: Attribute[];
  imageSeed?: string;
  imageUrl?: string;
}

export interface UpdateNFTRequest {
  name?: string;
  description?: string;
  price?: number;
  onSale?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  creator: User;
  category?: string;
  bannerSeed?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  category?: string;
  bannerSeed?: string;
}

export type TransactionType = 'mint' | 'sale' | 'transfer' | 'list' | 'unlist';

export interface Transaction {
  id: string;
  type: TransactionType;
  nft: NFT;
  from?: User;
  to?: User;
  price?: number;
  createdAt: Date;
}

export interface MarketStats {
  timestamp: Date;
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

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}
