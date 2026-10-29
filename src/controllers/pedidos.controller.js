// src/controllers/pedidos.controller.js
import * as servicio from '../services/pedidos.service.js';

export async function crear(req, res, next) {
  try {
    const pedido = await servicio.crear(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
}

export async function listar(req, res, next) {
  try {
    const { estado, pagina, porPagina, desde } = req.query;
    res.json(await servicio.listar({ estado, pagina, porPagina, desde }));
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const pedido = await servicio.buscarPorId(Number(req.params.id));
    res.json(pedido);
  } catch (error) {
    next(error);
  }
}

export async function cambiarEstado(req, res, next) {
  try {
    const pedido = await servicio.cambiarEstado(Number(req.params.id), req.body.estado);
    res.json(pedido);
  } catch (error) {
    next(error);
  }
}
