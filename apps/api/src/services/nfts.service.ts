import { z } from 'zod';
import { NFT } from '../models/NFT';
import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { Transaction } from '../models/Transaction';
import { HttpError } from '../utils/errors';

const MintSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  collectionId: z.string().optional(),
  price: z.number().optional(),
  attributes: z
    .array(
      z.object({
        trait_type: z.string(),
        value: z.string(),
        rarity: z.string().optional(),
      })
    )
    .optional(),
  imageSeed: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  fileType: z.enum(['image', 'video', 'audio', 'gif', '3d']).default('image'),
  fileSize: z.number().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
});

export const NftsService = {
  calculateRarityScore(attributes: any[]): number {
    const rarityWeights = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Epic': 4,
      'Legendary': 5,
      'Mythic': 6
    };
    
    const totalScore = attributes.reduce((sum, attr) => {
      return sum + (rarityWeights[attr.rarity as keyof typeof rarityWeights] || 1);
    }, 0);
    
    return Math.min(100, Math.round((totalScore / attributes.length) * 10));
  },

  async list(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 12, 48);
    const q = (query.q as string) || '';
    const category = (query.category as string) || undefined;
    const rarity = (query.rarity as string) || undefined;
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
    const onSale =
      query.onSale !== undefined ? query.onSale === 'true' : undefined;
    const sort = (query.sort as string) || 'new';
    const owner = query.owner === 'true' ? query.userId : undefined;
    const creator = query.creator === 'true' ? query.userId : undefined;

    const filter: any = {};
    if (q) filter.$text = { $search: q };
    if (onSale !== undefined) filter.onSale = onSale;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    if (category) {
      const colls = await Collection.find({ category }).select('_id').lean();
      filter.collectionId = { $in: colls.map((c) => c._id) };
    }
    if (rarity) {
      filter['attributes.rarity'] = rarity;
    }
    if (owner) {
      filter.owner = owner;
    }
    if (creator) {
      filter.creator = creator;
    }

    const sortMap: any = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      new: { createdAt: -1 },
    };

    const cursor = NFT.find(filter)
      .populate('creator owner collectionId')
      .skip((page - 1) * limit)
      .limit(limit);
    const [rawItems, total] = await Promise.all([
      cursor.sort(sortMap[sort] || sortMap['new']).lean(),
      NFT.countDocuments(filter),
    ]);

    const items = rawItems.map((n: any) => ({ ...n, collection: n.collectionId }));
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getDetail(id: string) {
    const nftRaw: any = await NFT.findById(id)
      .populate('creator owner collectionId')
      .lean();
    if (!nftRaw) throw HttpError.notFound('Not found');
    const nft = { ...nftRaw, collection: nftRaw.collectionId };
    const history = await Transaction.find({ nft: nftRaw._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return { nft, history };
  },

  async mint(userId: string, payload: unknown) {
    const data = MintSchema.parse(payload);
    const user = await User.findById(userId);
    if (!user) throw HttpError.unauthorized('Unauthorized');

    let collection = undefined;
    if (data.collectionId) {
      collection = await Collection.findById(data.collectionId);
    }

    const nft = await NFT.create({
      name: data.name,
      description: data.description,
      imageSeed: data.imageSeed || data.name,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      audioUrl: data.audioUrl,
      creator: user._id,
      owner: user._id,
      collectionId: collection?._id,
      attributes: data.attributes || [],
      price: data.price,
      onSale: Boolean(data.price),
      fileType: data.fileType,
      fileSize: data.fileSize,
      dimensions: data.dimensions,
      tokenId: Date.now(),
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      rarityScore: data.attributes ? NftsService.calculateRarityScore(data.attributes) : 0,
      views: 0,
      likes: 0,
    });

    await Transaction.create({
      type: 'mint',
      nft: nft._id,
      to: user._id,
    });

    return nft;
  },

  async listForSale(userId: string, nftId: string, priceInput: any) {
    const price = Number(priceInput);
    if (!price || price <= 0) throw HttpError.badRequest('Invalid price');
    const nft = await NFT.findById(nftId);
    if (!nft) throw HttpError.notFound('Not found');
    if (nft.owner.toString() !== userId)
      throw HttpError.forbidden('Not owner');

    nft.price = price;
    nft.onSale = true;
    await nft.save();

    await Transaction.create({
      type: 'list',
      nft: nft._id,
      from: nft.owner,
      price,
    });

    return nft;
  },

  async unlist(userId: string, nftId: string) {
    const nft = await NFT.findById(nftId);
    if (!nft) throw HttpError.notFound('Not found');
    if (nft.owner.toString() !== userId)
      throw HttpError.forbidden('Not owner');

    nft.onSale = false;
    await nft.save();

    await Transaction.create({
      type: 'unlist',
      nft: nft._id,
      from: nft.owner,
    });

    return nft;
  },

  async buy(userId: string, nftId: string) {
    const buyer = await User.findById(userId);
    const nft = await NFT.findById(nftId);
    if (!buyer || !nft) throw HttpError.notFound('Not found');
    if (!nft.onSale || !nft.price)
      throw HttpError.badRequest('NFT is not for sale');
    if (buyer._id.toString() === nft.owner.toString())
      throw HttpError.badRequest('You own this NFT');

    const seller = await User.findById(nft.owner);
    if (!seller) throw HttpError.badRequest('Seller missing');

    if (buyer.balance < nft.price)
      throw HttpError.badRequest('Insufficient balance');

    buyer.balance -= nft.price;
    seller.balance += nft.price;
    await buyer.save();
    await seller.save();

    nft.owner = buyer._id as any;
    nft.onSale = false;
    await nft.save();

    await Transaction.create({
      type: 'sale',
      nft: nft._id,
      from: seller._id,
      to: buyer._id,
      price: nft.price,
    });

    return { ok: true };
  },

  async transactions(nftId: string) {
    const items = await Transaction.find({ nft: nftId })
      .sort({ createdAt: -1 })
      .lean();
    return items;
  },
};