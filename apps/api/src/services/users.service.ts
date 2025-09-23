import { z } from 'zod';
import { User } from '../models/User';
import { HttpError } from '../utils/errors';

const PatchMeSchema = z.object({
  bio: z.string().max(1000).optional(),
  username: z.string().min(3).max(30).optional(),
});

export const UsersService = {
  async getById(id: string) {
    const user = await User.findById(id).select('-passwordHash');
    if (!user) throw HttpError.notFound('Not found');
    return user;
  },

  async patchMe(userId: string, payload: unknown) {
    const { bio, username } = PatchMeSchema.parse(payload ?? {});
    const $set: Record<string, unknown> = {};
    if (bio !== undefined) $set.bio = bio;
    if (username !== undefined) $set.username = username;
    if (Object.keys($set).length === 0) {
      throw HttpError.badRequest('No changes provided.');
    }
    try {
      const updated = await User.findByIdAndUpdate(
        userId,
        { $set },
        { new: true, runValidators: true, context: 'query' }
      ).select('-passwordHash');
      if (!updated) throw HttpError.notFound('User not found.');
      return updated;
    } catch (err: any) {
      if (err?.code === 11000) {
        const key = Object.keys(err.keyValue || {})[0] || 'field';
        throw HttpError.conflict(`${key} already in use.`);
      }
      throw err;
    }
  },
};