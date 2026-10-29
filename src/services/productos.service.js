// src/services/productos.service.js
// Capa de negocio: reglas del dominio. NO conoce req, res ni códigos HTTP.
// Semana 6: el arreglo en memoria se reemplaza por PostgreSQL vía Prisma.
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

export function listar({ disponibles, buscar } = {}) {
  const condiciones = [];
  if (disponibles) condiciones.push({ stock: { gt: 0 } });
  if (buscar) condiciones.push({ nombre: { contains: buscar, mode: 'insensitive' } });

  return prisma.producto.findMany({
    where: condiciones.length ? { AND: condiciones } : undefined,
    orderBy: { id: 'asc' },
  });
}

export async function buscarPorId(id) {
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) throw noEncontrado('Producto');
  return producto;
}

export async function crear({ nombre, precio, stock = 0 }) {
  const duplicado = await prisma.producto.findUnique({ where: { nombre } });
  if (duplicado) throw conflicto(`Ya existe un producto llamado "${nombre}"`);
  return prisma.producto.create({ data: { nombre, precio, stock } });
}

export async function actualizar(id, { nombre, precio, stock, disponible }) {
  await buscarPorId(id); // lanza 404 si no existe
  return prisma.producto.update({
    where: { id },
    data: { nombre, precio, stock, disponible }, // los undefined se ignoran
  });
}

export async function ajustarStock(id, delta) {
  await buscarPorId(id); // lanza 404 si no existe

  const resultado = await prisma.producto.updateMany({
    where: { id, stock: { gte: -delta } }, // la condición va en el WHERE: evita la carrera
    data: { stock: { increment: delta } },
  });

  if (resultado.count === 0) {
    const producto = await buscarPorId(id);
    throw conflicto(`Stock insuficiente: hay ${producto.stock} y se piden ${-delta}`);
  }

  return prisma.producto.findUnique({ where: { id } });
}

export async function eliminar(id) {
  await buscarPorId(id);
  await prisma.producto.delete({ where: { id } });
}