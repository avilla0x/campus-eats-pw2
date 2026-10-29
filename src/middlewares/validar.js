// src/middlewares/validar.js
// Recoge los errores que dejaron las reglas de express-validator.
// Si hay alguno, corta la cadena con datosInvalidos (400) y lo pasa al
// manejador central, así TODOS los errores salen con el mismo formato:
//   { "error": "Datos inválidos", "detalles": [{ "campo", "mensaje" }] }
import { validationResult } from 'express-validator';
import { datosInvalidos } from '../errores.js';

export function validar(req, res, next) {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();

  const detalles = resultado
    .array({ onlyFirstError: true }) // un mensaje por campo
    .map((e) => ({ campo: e.path, mensaje: e.msg }));
  next(datosInvalidos(detalles));
}
