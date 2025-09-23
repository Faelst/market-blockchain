import { Router } from 'express';
import { ImagesController } from '../controllers/images.controller';

const router = Router();
router.get('/:seed.svg', (req, res, next) => ImagesController.generate(req, res).catch(next));

export default router;