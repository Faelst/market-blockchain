import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';

const requests = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests', skipSuccessfulRequests = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = (req.body && (req.body.email || req.body.username)) || '';
    const routeKey = `${req.method}:${req.path}`;
    const key = `${req.ip || 'unknown'}|${routeKey}|${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    for (const [k, v] of requests.entries()) {
      if (v.resetTime < now) {
        requests.delete(k);
      }
    }

    const current = requests.get(key);
    
    if (!current) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.resetTime < now) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return next(HttpError.tooManyRequests(message));
    }

    current.count++;
    
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function(body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          current.count = Math.max(0, current.count - 1);
        }
        return originalSend.call(this, body);
      };
    }
    
    next();
  };
}

export const authRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many API requests',
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many uploads',
});

export const buyRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Too many purchase attempts',
});