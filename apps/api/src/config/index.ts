import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  mongoDbName: process.env.MONGODB_DBNAME || 'nft_marketplace',
  jwtSecret: (process.env.JWT_SECRET || 'dev-secret') as string,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  cookieName: process.env.COOKIE_NAME || 'token',
  isProd: process.env.NODE_ENV === 'production',
  nonceTtlMs: Number(process.env.NONCE_TTL_MS || 5 * 60 * 1000),
};