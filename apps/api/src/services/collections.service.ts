import { Collection } from '../models/Collection';
import { NFT } from '../models/NFT';

export const CollectionsService = {
  async list(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 12, 48);
    const q = (query.q as string) || '';
    const category = (query.category as string) || undefined;
    const creator = query.creator === 'true' ? query.userId : undefined;

    const filter: any = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (creator) filter.creator = creator;

    const [items, total] = await Promise.all([
      Collection.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Collection.countDocuments(filter),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getDetail(id: string) {
    const col = await Collection.findById(id).lean();
    if (!col) throw new Error('Not found');
    const nfts = await NFT.find({ collectionId: col._id })
      .sort({ createdAt: -1 })
      .limit(24)
      .lean();
    return { collection: col, nfts };
  },
};