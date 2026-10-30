// prisma/seed.js — re-ejecutable: usa upsert, nunca create.
// Flujo recomendado: `npx prisma migrate reset` (borra y aplica migraciones + corre este seed).
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const RONDAS_BCRYPT = 10;
const hash = (password) => bcrypt.hash(password, RONDAS_BCRYPT);

const usuarios = [
  { nombre: 'Admin Cafetería', email: 'admin@campuseats.co', passwordHash: await hash('admin1234'), rol: 'ADMIN' },
  { nombre: 'Ana Estudiante', email: 'ana@ucaldas.edu.co', passwordHash: await hash('ana12345'), rol: 'CLIENTE' },
];

const productos = [
  { nombre: 'Almuerzo del día', precio: 12000, stock: 25, categoria: 'Almuerzos' },
  { nombre: 'Jugo natural', precio: 4000, stock: 50, categoria: 'Bebidas' },
  { nombre: 'Café campesino', precio: 2500, stock: 100, categoria: 'Bebidas' },
  { nombre: 'Empanada', precio: 2000, stock: 40, categoria: 'Snacks' },
  { nombre: 'Sandwich de pollo', precio: 9500, stock: 15, categoria: 'Almuerzos' },
];

async function main() {
  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: { passwordHash: usuario.passwordHash }, // así un usuario viejo no queda con el hash anterior
      create: usuario,
    });
  }

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { nombre: producto.nombre },
      update: {},
      create: producto,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
