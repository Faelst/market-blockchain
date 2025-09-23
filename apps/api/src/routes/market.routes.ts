import { Router } from 'express';
import { MarketController } from '../controllers/market.controller';

const router = Router();

router.get('/stats', (req, res, next) => MarketController.stats(req, res).catch(next));

export default router;