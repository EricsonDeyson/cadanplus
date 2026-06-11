import { Router } from 'express';
import { requireAuth } from '../../../middlewares/requireAuth';
import * as modulesController from '../controllers/modules.controller';

export const modulesRoutes = Router();

modulesRoutes.get('/', requireAuth, modulesController.listModules);
