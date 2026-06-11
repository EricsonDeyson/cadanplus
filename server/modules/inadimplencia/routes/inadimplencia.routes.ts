import { Router } from 'express';
import { requireAuth } from '../../../middlewares/requireAuth';
import { requireModule } from '../../../middlewares/requireModule';
import * as inadimplenciaController from '../controllers/inadimplencia.controller';

export const inadimplenciaRoutes = Router();

inadimplenciaRoutes.use(requireAuth, requireModule('inadimplencia'));

inadimplenciaRoutes.get('/overview', inadimplenciaController.overview);
inadimplenciaRoutes.get('/equipes', inadimplenciaController.equipes);
inadimplenciaRoutes.get(
  '/equipes/:equipeId/representantes',
  inadimplenciaController.representantesByEquipe,
);
inadimplenciaRoutes.get(
  '/representantes/:representanteId/clientes',
  inadimplenciaController.clientesByRepresentante,
);
