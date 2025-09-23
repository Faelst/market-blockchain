import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/', requireAuth, UploadController.middleware, (req, res, next) =>
  UploadController.upload(req, res).catch(next)
);

export default router;