// src/services/usuarios.service.js
// El passwordHash nunca sale en una respuesta, por eso todas las lecturas llevan select.
import bcrypt from 'bcrypt';
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

const RONDAS_BCRYPT = 10;
const camposPublicos = { id: true, nombre: true, email: true, rol: true, creadoEn: true };

export function listar() {
  return prisma.usuario.findMany({ select: camposPublicos, orderBy: { id: 'asc' } });
}

export async function buscarPorId(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: camposPublicos });
  if (!usuario) throw noEncontrado('Usuario');
  return usuario;
}

export async function crear({ nombre, email, password, rol }) {
  const duplicado = await prisma.usuario.findUnique({ where: { email } });
  if (duplicado) throw conflicto(`Ya existe un usuario con el correo "${email}"`);
  const passwordHash = await bcrypt.hash(password, RONDAS_BCRYPT);
  return prisma.usuario.create({ data: { nombre, email, passwordHash, rol }, select: camposPublicos });
}
