// src/services/auth.service.js — registro y login
// bcrypt: hash de una sola vía con sal; para "verificar" se vuelve a hashear y se compara.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { conflicto, ErrorHttp } from '../errores.js';

const RONDAS_BCRYPT = 10;
const camposPublicos = { id: true, nombre: true, email: true, rol: true, creadoEn: true };

export async function registrar({ nombre, email, password }) {
  const duplicado = await prisma.usuario.findUnique({ where: { email } });
  if (duplicado) throw conflicto(`Ya existe un usuario con el correo "${email}"`);

  const passwordHash = await bcrypt.hash(password, RONDAS_BCRYPT);
  return prisma.usuario.create({
    data: { nombre, email, passwordHash }, // rol se queda en el default (CLIENTE)
    select: camposPublicos,
  });
}

export async function login({ email, password }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  // mismo mensaje si el correo no existe o si la contraseña falla: no revelar cuál de los dos
  const credencialesInvalidas = new ErrorHttp(401, 'Credenciales inválidas');
  if (!usuario) throw credencialesInvalidas;

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) throw credencialesInvalidas;

  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRA,
  });

  return { token };
}
