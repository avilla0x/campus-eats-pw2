// src/controllers/auth.controller.js
import * as servicio from '../services/auth.service.js';

export async function registrar(req, res, next) {
  try {
    const usuario = await servicio.registrar(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    res.json(await servicio.login(req.body));
  } catch (error) {
    next(error);
  }
}
