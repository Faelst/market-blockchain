import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 120,
  useClones: false
});

interface CacheOptions {
  ttl?: number;
  key?: string;
  condition?: (req: Request) => boolean;
}

export function createCache(options: CacheOptions = {}) {
  const { ttl = 300, key, condition } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (condition && !condition(req)) {
      return next();
    }

    const cacheKey = key || `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      cache.set(cacheKey, data, ttl);
      return originalJson(data);
    };

    next();
  };
}

export const marketStatsCache = createCache({
  ttl: 60,
  condition: (req) => req.path === '/market/stats'
});

export const nftListCache = createCache({
  ttl: 120,
  condition: (req) => req.path === '/nfts' && !req.query.q
});

export const collectionListCache = createCache({
  ttl: 300,
  condition: (req) => req.path === '/collections'
});

export function invalidateCache(pattern: string) {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
    }
  });
}

export function invalidateUserCache(userId: string) {
  invalidateCache(`.*user.*${userId}.*`);
}

export function invalidateNFTCache(nftId?: string) {
  if (nftId) {
    invalidateCache(`.*nft.*${nftId}.*`);
  }
  invalidateCache('.*nfts.*');
  invalidateCache('.*market.*');
}

export function invalidateCollectionCache(collectionId?: string) {
  if (collectionId) {
    invalidateCache(`.*collection.*${collectionId}.*`);
  }
  invalidateCache('.*collections.*');
}

export function clearAllCache() {
  cache.flushAll();
}
