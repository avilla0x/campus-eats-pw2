// src/middlewares/auth.js — autenticación (JWT) y autorización (roles)
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const encabezado = req.headers.authorization;
  if (!encabezado?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autenticación' });
  }

  const token = encabezado.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.sub, rol: payload.rol }; // la identidad viene del token, nunca del body
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Debe ejecutarse DESPUÉS de autenticar: necesita req.usuario.
export function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}
