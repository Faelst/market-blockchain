import { Router } from 'express';
import { NftsController } from '../controllers/nfts.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', (req, res, next) => NftsController.list(req, res).catch(next));
router.get('/:id', (req, res, next) => NftsController.get(req, res).catch(next));
router.post('/', requireAuth, (req, res, next) => NftsController.mint(req, res).catch(next));
router.post('/:id/list', requireAuth, (req, res, next) =>
  NftsController.listForSale(req, res).catch(next)
);
router.post('/:id/unlist', requireAuth, (req, res, next) =>
  NftsController.unlist(req, res).catch(next)
);
router.post('/:id/buy', requireAuth, (req, res, next) =>
  NftsController.buy(req, res).catch(next)
);
router.get('/:id/transactions', (req, res, next) =>
  NftsController.transactions(req, res).catch(next)
);

export default router;