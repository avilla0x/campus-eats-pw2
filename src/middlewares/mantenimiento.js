// src/middlewares/mantenimiento.js
// Reto semana 4: con MANTENIMIENTO=true todas las peticiones responden 503.
// Va primero en app.js: si el servidor está en mantenimiento, ninguna otra
// ruta ni middleware debe ejecutarse.
export function mantenimiento(req, res, next) {
  if (process.env.MANTENIMIENTO === 'true') {
    return res.status(503).json({ error: 'En mantenimiento' });
  }
  next();
}
