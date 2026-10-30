// src/controllers/pedidos.controller.js
import * as servicio from '../services/pedidos.service.js';
import { noEncontrado } from '../errores.js';

export async function crear(req, res, next) {
  try {
    // la identidad se toma del token, nunca del body (semana 8, laboratorio #4)
    const pedido = await servicio.crear({ usuarioId: req.usuario.id, items: req.body.items });
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

export async function listarMios(req, res, next) {
  try {
    const { estado, pagina, porPagina, desde } = req.query;
    res.json(await servicio.listar({ estado, pagina, porPagina, desde, usuarioId: req.usuario.id }));
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const pedido = await servicio.buscarPorId(Number(req.params.id));
    // dueño o ADMIN; cualquier otro cliente recibe 404 (no 403: no delata que el pedido existe)
    if (req.usuario.rol !== 'ADMIN' && pedido.usuarioId !== req.usuario.id) {
      throw noEncontrado('Pedido');
    }
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
