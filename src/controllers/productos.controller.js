// src/controllers/productos.controller.js
// Capa de presentación: traduce HTTP ↔ negocio.
// Solo responde los casos exitosos; cualquier error va a next(error)
// y lo resuelve el manejador central (src/middlewares/errores.js).
// req.params.id ya llega como número: lo convirtió .toInt() en la ruta.
import * as servicio from '../services/productos.service.js';

export async function listar(req, res, next) {
  try {
    const { disponibles, pagina, limite, buscar } = req.query;
    res.json(await servicio.listar({ disponibles: disponibles === 'true', pagina, limite, buscar }));
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const producto = await servicio.buscarPorId(Number(req.params.id));
    res.json(producto);
  } catch (error) {
    next(error); // el 404 lo lanza el service
  }
}

export async function crear(req, res, next) {
  try {
    const producto = await servicio.crear(req.body);
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const producto = await servicio.actualizar(Number(req.params.id), req.body);
    res.json(producto);
  } catch (error) {
    next(error);
  }
}

export async function ajustarStock(req, res, next) {
  try {
    const producto = await servicio.ajustarStock(Number(req.params.id), req.body.delta);
    res.json(producto);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    await servicio.eliminar(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// src/controllers/productos.controller.js
export async function subirFoto(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Adjunta un archivo en el campo "imagen"' });
    }
    // Guardamos la RUTA pública en la BD, nunca el archivo dentro de la BD
    const producto = await servicio.cambiarImagen(
      Number(req.params.id),
      `/imagenes/productos/${req.file.filename}`
    );
    res.json(producto);
  } catch (error) {
    next(error);
  }
}