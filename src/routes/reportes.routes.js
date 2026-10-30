// src/routes/reportes.routes.js
import { Router } from 'express';
import * as controlador from '../controllers/reportes.controller.js';
import { autenticar, permitirRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/ventas-dia', autenticar, permitirRoles('ADMIN'), controlador.ventasDia);

export default router;
