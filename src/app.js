// src/app.js — configura Express (sin arrancarlo)
import express from 'express';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import productosRouter from './routes/productos.routes.js';
import pedidosRouter from './routes/pedidos.routes.js';
import reportesRouter from './routes/reportes.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';
import { manejarErrores } from './middlewares/errores.js';
import { mantenimiento } from './middlewares/mantenimiento.js';

const app = express();

// Primero de todos: si está en mantenimiento, ninguna otra petición se procesa.
app.use(mantenimiento);

app.use(morgan('dev'));
app.use(express.json());

// Semana 9: las fotos subidas se sirven como archivos estáticos
app.use('/imagenes/productos', express.static('uploads/productos'));
app.get('/', (req, res) => res.json({ nombre: 'CampusEats API', version: '1.0' }));
app.use('/api/auth', authRouter);
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/usuarios', usuariosRouter);

// 404 para rutas inexistentes (después de todas las rutas)
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Manejador de errores: SIEMPRE el último
app.use(manejarErrores);

export default app;
