// src/middlewares/errores.js
// Manejador central de errores. Tiene 4 parámetros: así Express lo reconoce
// como middleware de errores. Se registra al FINAL de app.js.
import { ErrorHttp } from '../errores.js';

// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, next) {
  // 1) Errores "nuestros": ya traen su código HTTP
  if (error instanceof ErrorHttp) {
    const cuerpo = { error: error.message };
    if (error.detalles) cuerpo.detalles = error.detalles;
    return res.status(error.codigo).json(cuerpo);
  }

  // 2) JSON malformado: lo lanza express.json() antes de llegar a las rutas
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON malformado' });
  }

  // 3) Cualquier otro error es inesperado: se registra en el servidor y
  //    al cliente se le da un mensaje genérico (nunca el stack trace)
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}
