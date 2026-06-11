import { Router } from 'express';
import { env } from '../../../config/env';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.json({ status: 'ok', app: env.APP_NAME, env: env.NODE_ENV, timestamp: new Date().toISOString() });
});
