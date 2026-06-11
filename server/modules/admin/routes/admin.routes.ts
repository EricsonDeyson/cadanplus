import { Router } from 'express';
import { requireAdmin } from '../../../middlewares/requireAdmin';
import { requireAuth } from '../../../middlewares/requireAuth';
import * as adminController from '../controllers/admin.controller';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get('/groups', adminController.getGroups);
adminRoutes.post('/groups', adminController.createGroup);
adminRoutes.patch('/groups/:id', adminController.updateGroup);
adminRoutes.delete('/groups/:id', adminController.deleteGroup);
adminRoutes.patch('/modules/:id/group', adminController.moveModule);
