import { Router } from 'express';
import { requireAuth } from '../../../middlewares/requireAuth';
import * as authController from '../controllers/auth.controller';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', requireAuth, authController.me);
authRoutes.post('/change-password', requireAuth, authController.changePassword);
authRoutes.post('/avatar', requireAuth, authController.updateAvatar);
