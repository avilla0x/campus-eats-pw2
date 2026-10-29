// src/middlewares/apiKey.js
// Reto semana 4: protege el DELETE de productos con una clave fija en el header x-api-key.
const CLAVE_ESPERADA = 'secreta123';

export function requiereApiKey(req, res, next) {
  if (req.headers['x-api-key'] !== CLAVE_ESPERADA) {
    return res.status(401).json({ error: 'API key inválida' });
  }
  next();
}
