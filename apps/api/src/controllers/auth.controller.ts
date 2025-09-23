import { Request, Response } from 'express';
import { AuthService, signJWT } from '../services/auth.service';
import { config } from '../config';
import { HttpError } from '../utils/errors';
import { invalidateUserCache } from '../middleware/cache';

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const user = await AuthService.register(req.body);
      const token = signJWT(user.id);
      
      res
        .cookie(config.cookieName, token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: config.isProd,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({
          success: true,
          data: user,
          message: 'User registered successfully'
        });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Registration failed');
    }
  },

  async login(req: Request, res: Response) {
    try {
      const user = await AuthService.login(req.body);
      const token = signJWT(user.id);
      
      res
        .cookie(config.cookieName, token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: config.isProd,
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({
          success: true,
          data: user,
          message: 'Login successful'
        });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Login failed');
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(config.cookieName).json({ 
      success: true,
      message: 'Logged out successfully'
    });
  },

  async me(req: Request, res: Response) {
    try {
      const me = await AuthService.me((req as any).user.id);
      res.json({
        success: true,
        data: me
      });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to get user data');
    }
  },

  async stats(req: Request, res: Response) {
    try {
      const stats = await AuthService.getStats((req as any).user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to get user stats');
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthService.updateProfile(userId, req.body);
      
      invalidateUserCache(userId);
      
      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to update profile');
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await AuthService.changePassword(userId, req.body);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to change password');
    }
  },
};