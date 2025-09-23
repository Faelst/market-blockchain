import { Request, Response } from 'express';
import { CollectionsService } from '../services/collections.service';

export const CollectionsController = {
  async list(req: Request, res: Response) {
    const query = { ...req.query };
    if ((req as any).user && query.creator === 'true') {
      query.userId = (req as any).user.id;
    }
    const data = await CollectionsService.list(query);
    res.json(data);
  },
  async get(req: Request, res: Response) {
    const data = await CollectionsService.getDetail(req.params.id);
    res.json({ collection: data.collection, nfts: data.nfts });
  },
};