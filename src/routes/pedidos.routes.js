// src/routes/pedidos.routes.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/pedidos.controller.js';
import { validar } from '../middlewares/validar.js';
import { ESTADOS_VALIDOS, TRANSICIONES_VALIDAS } from '../services/pedidos.service.js';

const router = Router();

const idValido = param('id')
  .isInt({ min: 1 }).withMessage('El id debe ser entero positivo')
  .toInt();

const reglasCrear = [
  body('usuarioId').isInt({ min: 1 }).withMessage('usuarioId debe ser entero positivo').toInt(),
  body('items').isArray({ min: 1 }).withMessage('items debe ser un arreglo con al menos un elemento'),
  body('items.*.productoId').isInt({ min: 1 }).withMessage('productoId debe ser entero positivo').toInt(),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('cantidad debe ser entero positivo').toInt(),
];

const reglasListar = [
  query('estado').optional().isIn(ESTADOS_VALIDOS).withMessage(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`),
  query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser entero ≥ 1').toInt(),
  query('porPagina').optional().isInt({ min: 1, max: 50 }).withMessage('porPagina debe ser entero entre 1 y 50').toInt(),
  query('desde').optional().isISO8601().withMessage('desde debe tener formato AAAA-MM-DD'),
];

router.post('/', reglasCrear, validar, controlador.crear);
router.get('/', reglasListar, validar, controlador.listar);
router.get('/:id', idValido, validar, controlador.obtener);
router.patch(
  '/:id/estado',
  idValido,
  body('estado').isIn(TRANSICIONES_VALIDAS).withMessage(`estado debe ser uno de: ${TRANSICIONES_VALIDAS.join(', ')}`),
  validar,
  controlador.cambiarEstado
);

export default router;
