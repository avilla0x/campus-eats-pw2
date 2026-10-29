// src/services/pedidos.service.js
// Capa de negocio: pedidos, sus items y la transacción que los crea.
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

const ESTADOS = ['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'];
const ESTADOS_FINALES = ['ENTREGADO', 'CANCELADO'];

const resumenPedido = {
  usuario: { select: { nombre: true } },
  items: { include: { producto: { select: { nombre: true } } } },
};

export async function crear({ usuarioId, items }) {
  return prisma.$transaction(async (tx) => {
    const itemsCreados = [];
    let total = 0;

    for (const { productoId, cantidad } of items) {
      const producto = await tx.producto.findUnique({ where: { id: productoId } });
      if (!producto) throw noEncontrado(`Producto ${productoId}`);

      const resultado = await tx.producto.updateMany({
        where: { id: productoId, stock: { gte: cantidad } }, // condición en el WHERE: evita la carrera
        data: { stock: { decrement: cantidad } },
      });
      if (resultado.count === 0) {
        throw conflicto(`Stock insuficiente de "${producto.nombre}": hay ${producto.stock} y se piden ${cantidad}`);
      }

      total += producto.precio * cantidad;
      itemsCreados.push({ productoId, cantidad, precioUnitario: producto.precio });
    }

    return tx.pedido.create({
      data: { usuarioId, total, items: { create: itemsCreados } },
      include: resumenPedido,
    });
  });
}

export async function listar({ estado, pagina = 1, porPagina = 10, desde }) {
  const where = {
    ...(estado && { estado }),
    ...(desde && { creadoEn: { gte: new Date(desde) } }),
  };

  const [datos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: resumenPedido,
      orderBy: { creadoEn: 'desc' },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.pedido.count({ where }),
  ]);

  return { datos, paginacion: { pagina, porPagina, total, totalPaginas: Math.ceil(total / porPagina) } };
}

export async function buscarPorId(id) {
  const pedido = await prisma.pedido.findUnique({ where: { id }, include: resumenPedido });
  if (!pedido) throw noEncontrado('Pedido');
  return pedido;
}

export async function cambiarEstado(id, estado) {
  const pedido = await buscarPorId(id);
  if (ESTADOS_FINALES.includes(pedido.estado)) {
    throw conflicto(`Un pedido ${pedido.estado} ya no puede cambiar de estado`);
  }
  return prisma.pedido.update({ where: { id }, data: { estado }, include: resumenPedido });
}

export async function ventasDia() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const filtroHoy = { creadoEn: { gte: hoy }, estado: { not: 'CANCELADO' } };

  const resumen = await prisma.pedido.aggregate({
    where: filtroHoy,
    _sum: { total: true },
    _count: { id: true },
  });

  const porProducto = await prisma.pedidoItem.groupBy({
    by: ['productoId'],
    where: { pedido: filtroHoy },
    _sum: { cantidad: true },
  });

  const productos = await prisma.producto.findMany({
    where: { id: { in: porProducto.map((p) => p.productoId) } },
    select: { id: true, nombre: true },
  });
  const nombrePorId = new Map(productos.map((p) => [p.id, p.nombre]));

  return {
    fecha: hoy.toISOString().slice(0, 10),
    totalVendido: resumen._sum.total ?? 0,
    pedidos: resumen._count.id,
    unidadesPorProducto: porProducto.map((p) => ({
      productoId: p.productoId,
      nombre: nombrePorId.get(p.productoId),
      unidades: p._sum.cantidad,
    })),
  };
}

export const ESTADOS_VALIDOS = ESTADOS;
export const TRANSICIONES_VALIDAS = ESTADOS.slice(1);
