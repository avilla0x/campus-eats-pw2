// src/routes/usuarios.routes.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controlador from '../controllers/usuarios.controller.js';
import { validar } from '../middlewares/validar.js';
import { autenticar, permitirRoles } from '../middlewares/auth.js';

const router = Router();

// Todo /api/usuarios es solo para ADMIN (semana 8).
router.use(autenticar, permitirRoles('ADMIN'));

const idValido = param('id')
  .isInt({ min: 1 }).withMessage('El id debe ser entero positivo')
  .toInt();

const reglasCrear = [
  body('nombre').isString().trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('rol').optional().isIn(['CLIENTE', 'ADMIN']).withMessage('rol debe ser CLIENTE o ADMIN'),
];

router.get('/', controlador.listar);
router.get('/:id', idValido, validar, controlador.obtener);
router.post('/', reglasCrear, validar, controlador.crear);

export default router;
