import { Request, Response } from 'express';
import { MarketService } from '../services/market.service';

export const MarketController = {
  async stats(_req: Request, res: Response) {
    const data = await MarketService.stats();
    res.json(data);
  },
};