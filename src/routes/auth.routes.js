// src/routes/auth.routes.js
import { Router } from 'express';
import { body } from 'express-validator';
import * as controlador from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglasCredenciales = [
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

router.post(
  '/registro',
  body('nombre').isString().trim().notEmpty().withMessage('El nombre es obligatorio'),
  reglasCredenciales,
  validar,
  controlador.registrar
);

router.post('/login', reglasCredenciales, validar, controlador.login);

export default router;
