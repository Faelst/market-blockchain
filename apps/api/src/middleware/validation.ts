import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from '../utils/errors';

export const schemas = {
  register: z.object({
    email: z.string().email('Invalid email format'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(24, 'Username must be less than 24 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
    bio: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  createNFT: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    collectionId: z.string().optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    attributes: z.array(z.object({
      trait_type: z.string().min(1, 'Trait type is required'),
      value: z.string().min(1, 'Value is required'),
      rarity: z.string().optional(),
    })).optional(),
    imageSeed: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
  }),

  updateNFT: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    price: z.number().min(0).optional(),
    onSale: z.boolean().optional(),
  }),

  createCollection: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    category: z.string().max(50, 'Category must be less than 50 characters').optional(),
    bannerSeed: z.string().optional(),
  }),

  listForSale: z.object({
    price: z.number().min(0.001, 'Price must be at least 0.001 ETH'),
  }),

  nftQuery: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
    q: z.string().optional(),
    category: z.string().optional(),
    rarity: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    onSale: z.coerce.boolean().optional(),
    sort: z.enum(['new', 'price_asc', 'price_desc']).default('new'),
  }),

  collectionQuery: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
    q: z.string().optional(),
    category: z.string().optional(),
  }),

  updateProfile: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(24, 'Username must be less than 24 characters').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    avatarSeed: z.string().optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'New password must contain uppercase, lowercase, number and special character'
    ),
  }),
};

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(HttpError.badRequest(errorMessage));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(HttpError.badRequest(errorMessage));
      }
      next(error);
    }
  };
}
