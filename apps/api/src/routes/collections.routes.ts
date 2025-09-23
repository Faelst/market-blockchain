import { Router } from 'express';
import { CollectionsController } from '../controllers/collections.controller';

const router = Router();

router.get('/', (req, res, next) => CollectionsController.list(req, res).catch(next));
router.get('/:id', (req, res, next) => CollectionsController.get(req, res).catch(next));

export default router;