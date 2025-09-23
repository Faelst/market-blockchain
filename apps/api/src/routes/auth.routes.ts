import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/register', 
  authRateLimit,
  validate(schemas.register),
  (req, res, next) => AuthController.register(req, res).catch(next)
);

router.post('/login', 
  authRateLimit,
  validate(schemas.login),
  (req, res, next) => AuthController.login(req, res).catch(next)
);

router.post('/logout', (req, res, next) => AuthController.logout(req, res).catch(next));

router.get('/me', requireAuth, (req, res, next) => AuthController.me(req, res).catch(next));
router.get('/stats', requireAuth, (req, res, next) => AuthController.stats(req, res).catch(next));
router.put('/profile', 
  requireAuth,
  validate(schemas.updateProfile),
  (req, res, next) => AuthController.updateProfile(req, res).catch(next)
);
router.put('/change-password', 
  requireAuth,
  validate(schemas.changePassword),
  (req, res, next) => AuthController.changePassword(req, res).catch(next)
);

export default router;