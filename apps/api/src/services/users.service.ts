/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../models/User";
import { HttpError } from "../utils/errors";
import { NFT } from "../models";
import { Types } from "mongoose";
import { z } from "zod";

const PatchMeSchema = z.object({
  bio: z.string().max(1000).optional(),
  username: z.string().min(3).max(30).optional(),
});

export const UsersService = {
  async getById(id: string) {
    const user = await User.findById(id).select("-passwordHash");
    if (!user) throw HttpError.notFound("Not found");
    return user;
  },

  async patchMe(userId: string, payload: unknown) {
    const { bio, username } = PatchMeSchema.parse(payload ?? {});
    const $set: Record<string, unknown> = {};
    if (bio !== undefined) $set.bio = bio;
    if (username !== undefined) $set.username = username;
    if (Object.keys($set).length === 0) {
      throw HttpError.badRequest("No changes provided.");
    }
    try {
      const updated = await User.findByIdAndUpdate(
        userId,
        { $set },
        { new: true, runValidators: true, context: "query" }
      ).select("-passwordHash");
      if (!updated) throw HttpError.notFound("User not found.");
      return updated;
    } catch (err: any) {
      if (err?.code === 11000) {
        const key = Object.keys(err.keyValue || {})[0] || "field";
        throw HttpError.conflict(`${key} already in use.`);
      }
      throw err;
    }
  },

  async getFavorites(userId: string) {
    const user = await User.findById(userId).select("favorites");
    if (!user) throw HttpError.notFound("User not found.");

    const ids = user.favorites?.map(String) ?? [];
    if (ids.length === 0) return [];

    const nfts = await NFT.find({ _id: { $in: ids } })
      .populate("creator owner collectionId")
      .lean();

    const order = new Map(ids.map((id, i) => [id, i]));
    const items = nfts
      .map((n: any) => ({ ...n, collection: n.collectionId }))
      .sort(
        (a: any, b: any) =>
          (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0)
      );

    return items;
  },

  async addFavorite(userId: string, nftId: string) {
    if (!Types.ObjectId.isValid(nftId))
      throw HttpError.badRequest("Invalid NFT id");

    const exists = await NFT.exists({ _id: nftId });
    if (!exists) throw HttpError.notFound("NFT not found");

    const res = await User.updateOne(
      { _id: userId },
      { $addToSet: { favorites: new Types.ObjectId(nftId) } }
    );
    if (res.matchedCount === 0) throw HttpError.notFound("User not found.");

    return { ok: true };
  },

  async removeFavorite(userId: string, nftId: string) {
    if (!Types.ObjectId.isValid(nftId))
      throw HttpError.badRequest("Invalid NFT id");

    const res = await User.updateOne(
      { _id: userId },
      { $pull: { favorites: new Types.ObjectId(nftId) } }
    );
    if (res.matchedCount === 0) throw HttpError.notFound("User not found.");

    return { ok: true };
  },
};
