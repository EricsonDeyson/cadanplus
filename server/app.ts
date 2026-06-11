import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { authRoutes } from './modules/auth/routes/auth.routes';
import { healthRoutes } from './modules/health/routes/health.routes';
import { modulesRoutes } from './modules/modules/routes/modules.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
// Limite de 6mb para comportar upload de avatar em base64
app.use(express.json({ limit: '6mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/modules', modulesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
