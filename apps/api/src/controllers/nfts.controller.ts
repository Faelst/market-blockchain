import { Request, Response } from 'express';
import { NftsService } from '../services/nfts.service';

export const NftsController = {
  async list(req: Request, res: Response) {
    const query = { ...req.query };
    if ((req as any).user && (query.owner === 'true' || query.creator === 'true')) {
      query.userId = (req as any).user.id;
    }
    const data = await NftsService.list(query);
    res.json(data);
  },

  async get(req: Request, res: Response) {
    const data = await NftsService.getDetail(req.params.id);
    res.json(data);
  },

  async mint(req: Request, res: Response) {
    const nft = await NftsService.mint((req as any).user.id, req.body);
    res.status(201).json(nft);
  },

  async listForSale(req: Request, res: Response) {
    const nft = await NftsService.listForSale(
      (req as any).user.id,
      req.params.id,
      req.body.price
    );
    res.json(nft);
  },

  async unlist(req: Request, res: Response) {
    const nft = await NftsService.unlist((req as any).user.id, req.params.id);
    res.json(nft);
  },

  async buy(req: Request, res: Response) {
    const result = await NftsService.buy((req as any).user.id, req.params.id);
    res.json(result);
  },

  async transactions(req: Request, res: Response) {
    const items = await NftsService.transactions(req.params.id);
    res.json(items);
  },
};