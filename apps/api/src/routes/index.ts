import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import nftsRoutes from './nfts.routes';
import collectionsRoutes from './collections.routes';
import marketRoutes from './market.routes';
import imagesRoutes from './images.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/nfts', nftsRoutes);
router.use('/collections', collectionsRoutes);
router.use('/market', marketRoutes);
router.use('/image', imagesRoutes);
router.use('/upload', uploadRoutes);

export default router;