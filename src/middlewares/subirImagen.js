// src/middlewares/subirImagen.js — recibe la foto de un producto (multipart/form-data)
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { ErrorHttp } from '../errores.js';

const almacenamiento = multer.diskStorage({
  destination: 'uploads/productos',        // con una ruta en texto, Multer crea la carpeta si no existe
  filename: (req, file, cb) => {
    // Nombre aleatorio + extensión original: nunca confíes en el nombre del cliente
    const nombre = crypto.randomUUID() + path.extname(file.originalname).toLowerCase();
    cb(null, nombre);
  },
});

export const subirImagen = multer({
  storage: almacenamiento,
  limits: { fileSize: 2 * 1024 * 1024 },   // máximo 2 MB
  fileFilter: (req, file, cb) => {
    // Solo imágenes: se revisa el tipo MIME que DECLARA el cliente (experimento del paso 4)
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!permitidos.includes(file.mimetype)) {
      // 415 Unsupported Media Type: un ErrorHttp, así lo responde el manejador de siempre
      return cb(new ErrorHttp(415, 'Solo se permiten imágenes JPG, PNG o WebP'));
    }
    cb(null, true);
  },
});