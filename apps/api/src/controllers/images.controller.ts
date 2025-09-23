import { Request, Response } from 'express';
import { ImagesService } from '../services/images.service';

export const ImagesController = {
  async generate(req: Request, res: Response) {
    const seed = req.params.seed;
    const size = String(req.query.size || '');
    const svg = ImagesService.generate(seed, size);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  },
};