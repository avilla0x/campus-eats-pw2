// src/routes/productos.routes.js
// Mapa de URLs: qué método + ruta ejecuta qué controller.
// Cada ruta sigue la cadena: reglas → validar → controller.
//
// Reflexión (taller, punto 12): ¿qué error se detecta en cada capa?
//  1. Formato  (express.json en app.js): JSON mal escrito → 400 "JSON malformado".
//  2. Validación (estas reglas + validar.js): JSON bien escrito pero con datos
//     de forma incorrecta (precio "mil", id "abc", falta el nombre) → 400 con detalles.
//  3. Negocio (service): datos bien formados que violan una regla del dominio
//     (nombre repetido, stock insuficiente, id que no existe) → 409 / 404.
// Separarlo importa para el mantenimiento: cada capa cambia por una sola razón.
// Si mañana cambia la base de datos (semana 6), las reglas de formato no se
// tocan; si cambia un límite de caracteres, el service no se toca.
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/productos.controller.js';
import { validar } from '../middlewares/validar.js';
import { requiereApiKey } from '../middlewares/apiKey.js';
import { autenticar, permitirRoles } from '../middlewares/auth.js';

const router = Router();

// ---------- Reglas reutilizables ----------
const idValido = param('id')
  .isInt({ min: 1 }).withMessage('El id debe ser entero positivo')
  .toInt();

const nombre = body('nombre')
  .exists({ values: 'null' }).withMessage('El nombre es obligatorio').bail()
  .isString().withMessage('El nombre debe ser texto').bail()
  .trim()
  .notEmpty().withMessage('El nombre es obligatorio')
  .isLength({ max: 80 }).withMessage('Máximo 80 caracteres');

const precio = body('precio')
  .isInt({ min: 0 }).withMessage('El precio debe ser entero ≥ 0')
  .toInt();

const stock = () => body('stock')
  .isInt({ min: 0 }).withMessage('El stock debe ser entero ≥ 0')
  .toInt();

// POST: stock es opcional (por defecto 0)
const reglasCrear = [nombre, precio, stock().optional()];
// PUT reemplaza el recurso COMPLETO → todos los campos son obligatorios
const reglasReemplazar = [nombre, precio, stock()];

const reglasListar = [
  query('disponibles')
    .optional()
    .isIn(['true', 'false']).withMessage('disponibles debe ser "true" o "false"'),
  query('pagina')
    .optional()
    .isInt({ min: 1 }).withMessage('pagina debe ser entero ≥ 1')
    .toInt(),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limite debe ser entero entre 1 y 100')
    .toInt(),
  query('buscar')
    .optional()
    .isString().withMessage('buscar debe ser texto')
    .trim(),
];

// ---------- Rutas ----------
// Política de acceso (semana 8): lectura pública, escritura solo ADMIN.
const soloAdmin = [autenticar, permitirRoles('ADMIN')];

router.get('/', reglasListar, validar, controlador.listar);
router.get('/:id', idValido, validar, controlador.obtener);
router.post('/', soloAdmin, reglasCrear, validar, controlador.crear);
router.put('/:id', soloAdmin, idValido, reglasReemplazar, validar, controlador.actualizar);
router.delete('/:id', soloAdmin, requiereApiKey, idValido, validar, controlador.eliminar);

// Reto: ajustar stock con un delta (+ entrada de mercancía, − venta)
router.patch(
  '/:id/stock',
  soloAdmin,
  idValido,
  body('delta')
    .isInt().withMessage('delta debe ser un entero')
    .not().equals('0').withMessage('delta no puede ser 0')
    .toInt(),
  validar,
  controlador.ajustarStock
);

export default router;
