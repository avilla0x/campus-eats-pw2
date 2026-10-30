# CampusEats

API REST para el proyecto de Programación Web 2 (hasta semana 8: autenticación y roles). Node.js + Express + Prisma 7 + PostgreSQL.

## Arranque desde cero

1. Instalar dependencias:
   ```
   npm install
   ```
2. Crear el contenedor de PostgreSQL (puerto 5433 → 5432):
   ```
   docker run --name campuseats-db -e POSTGRES_USER=campuseats -e POSTGRES_PASSWORD=campuseats -e POSTGRES_DB=campuseats -p 5433:5432 -d postgres:16
   ```
3. Copiar `.env.example` a `.env` y ajustar usuario/clave/puerto si es necesario.
4. Aplicar las migraciones:
   ```
   npx prisma migrate deploy
   ```
5. Cargar los datos de ejemplo (re-ejecutable, usa `upsert`):
   ```
   npx prisma db seed
   ```
6. Levantar la API en modo desarrollo (http://localhost:3000):
   ```
   npm run dev
   ```

## Estructura

```
src/
├── server.js        # arranca el servidor
├── app.js           # configura Express (middlewares y rutas)
├── db.js            # instancia única de PrismaClient
├── errores.js       # ErrorHttp y fábricas (noEncontrado, conflicto, datosInvalidos)
├── routes/          # mapa de URLs -> controllers
├── controllers/     # traduce HTTP <-> negocio, siempre con next(error)
├── services/        # reglas de negocio, no conocen req/res
└── middlewares/      # validar.js (express-validator) y errores.js (manejador central)
```

## Endpoints

- `POST /api/auth/registro`, `POST /api/auth/login` (público)
- `GET /api/productos`, `GET /api/productos/:id` (público) · `POST/PUT/DELETE /api/productos/:id`, `PATCH /api/productos/:id/stock` (ADMIN)
- `POST /api/pedidos` (autenticado) · `GET /api/pedidos/mios` (autenticado) · `GET /api/pedidos` (ADMIN) · `GET /api/pedidos/:id` (dueño o ADMIN) · `PATCH /api/pedidos/:id/estado` (ADMIN)
- `GET/POST /api/usuarios`, `GET /api/usuarios/:id` (ADMIN)
- `GET /api/reportes/ventas-dia` (ADMIN)

## Autenticación (semana 8)

- JWT por header `Authorization: Bearer <token>`. El token se firma con `JWT_SECRET` y expira según `JWT_EXPIRA` (ver `.env.example`).
- Las contraseñas se guardan con `bcrypt` (nunca en texto plano); el `passwordHash` nunca sale en una respuesta.
- La identidad de quien hace la petición sale siempre del token (`req.usuario`), nunca del body.
- Usuarios de ejemplo tras el seed: `admin@campuseats.co` / `admin1234` (ADMIN) y `ana@ucaldas.edu.co` / `ana12345` (CLIENTE).

La colección de Postman está en `docs/postman/` (productos, pedidos y auth).
