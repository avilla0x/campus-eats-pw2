// src/controllers/reportes.controller.js
import * as pedidosServicio from '../services/pedidos.service.js';

export async function ventasDia(req, res, next) {
  try {
    res.json(await pedidosServicio.ventasDia());
  } catch (error) {
    next(error);
  }
}
