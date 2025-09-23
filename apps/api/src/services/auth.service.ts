import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { config } from '../config';
import { HttpError } from '../utils/errors';

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  bio: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(24).optional(),
  bio: z.string().max(500).optional(),
  avatarSeed: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
});

export type JwtPayload = { id: string };

export function signJWT(id: string) {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function sanitizeUser(user: any) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    balance: user.balance,
    bio: user.bio,
    avatarSeed: user.avatarSeed,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const AuthService = {
  async register(payload: unknown) {
    const data = RegisterSchema.parse(payload);
    const exists = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (exists) {
      throw HttpError.badRequest('Email or username already in use', 'DUPLICATE_USER');
    }

    const hash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      email: data.email,
      username: data.username,
      passwordHash: hash,
      avatarSeed: data.username,
      bio: data.bio,
      balance: 250,
    });
    return sanitizeUser(user);
  },

  async login(payload: unknown) {
    const data = LoginSchema.parse(payload);
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw HttpError.badRequest('Invalid credentials', 'INVALID_CREDENTIALS');
    }
    
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      throw HttpError.badRequest('Invalid credentials', 'INVALID_CREDENTIALS');
    }
    
    return sanitizeUser(user);
  },

  async me(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw HttpError.unauthorized('User not found', 'USER_NOT_FOUND');
    }
    return sanitizeUser(user);
  },

  async getStats(id: string) {
    const user = await User.findById(id);
    if (!user) {
      throw HttpError.unauthorized('User not found', 'USER_NOT_FOUND');
    }

    const { NFT } = await import('../models/NFT');
    const { Collection } = await import('../models/Collection');
    const { Transaction } = await import('../models/Transaction');

    const [ownedNfts, createdNfts, createdCollections, transactions] = await Promise.all([
      NFT.countDocuments({ owner: id }),
      NFT.countDocuments({ creator: id }),
      Collection.countDocuments({ creator: id }),
      Transaction.find({ $or: [{ from: id }, { to: id }] }).lean()
    ]);

    let totalEarned = 0;
    let totalSpent = 0;

    for (const tx of transactions) {
      if (tx.type === 'sale' && tx.to?.toString() === id) {
        totalEarned += tx.price || 0;
      } else if (tx.type === 'sale' && tx.from?.toString() === id) {
        totalSpent += tx.price || 0;
      }
    }

    return {
      ownedNfts,
      createdNfts,
      createdCollections,
      totalEarned,
      totalSpent
    };
  },

  async updateProfile(userId: string, payload: unknown) {
    const data = UpdateProfileSchema.parse(payload);
    
    if (data.username) {
      const existingUser = await User.findOne({
        username: data.username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw HttpError.badRequest('Username already taken', 'USERNAME_TAKEN');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw HttpError.notFound('User not found', 'USER_NOT_FOUND');
    }

    return sanitizeUser(user);
  },

  async changePassword(userId: string, payload: unknown) {
    const data = ChangePasswordSchema.parse(payload);
    
    const user = await User.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw HttpError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);
    await User.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });
  },

  async getUserStats(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw HttpError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const { NFT, Transaction } = await import('../models');
    
    const [ownedNfts, createdNfts, totalSales, totalSpent] = await Promise.all([
      NFT.countDocuments({ owner: userId }),
      NFT.countDocuments({ creator: userId }),
      Transaction.aggregate([
        { $match: { to: userId, type: 'sale' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      Transaction.aggregate([
        { $match: { from: userId, type: 'sale' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    return {
      ownedNfts,
      createdNfts,
      totalEarned: totalSales[0]?.total || 0,
      totalSpent: totalSpent[0]?.total || 0,
      balance: user.balance,
    };
  },
};