# CampusEats

API REST para el proyecto de Programación Web 2 (hasta semana 7 / Hito 2, avance 1). Node.js + Express + Prisma 7 + PostgreSQL.

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

- `GET/POST /api/productos`, `GET/PUT/DELETE /api/productos/:id`, `PATCH /api/productos/:id/stock` (`{ "delta": N }`)
- `POST /api/pedidos`, `GET /api/pedidos`, `GET /api/pedidos/:id`, `PATCH /api/pedidos/:id/estado`
- `GET /api/reportes/ventas-dia`

La colección de Postman está en `docs/postman/` (una para productos, otra para pedidos).
