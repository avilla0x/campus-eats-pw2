// src/routes/reportes.routes.js
import { Router } from 'express';
import * as controlador from '../controllers/reportes.controller.js';

const router = Router();

router.get('/ventas-dia', controlador.ventasDia);

export default router;
