# CampusEats · Semana 5 — Notas para sustentar

## Auditoría REST (paso 6)

| Método | Ruta | Éxito | Errores posibles | ¿Cumple? |
|---|---|---|---|---|
| GET | `/api/productos?disponibles&pagina&limite` | 200 + `{ datos, total, pagina, paginas, limite }` | 400 (query inválida) | ✅ |
| GET | `/api/productos/:id` | 200 + objeto | 400 (id), 404 | ✅ |
| POST | `/api/productos` | 201 + objeto creado | 400 (JSON / datos), 409 (nombre) | ✅ |
| PUT | `/api/productos/:id` | 200 + objeto | 400, 404, 409 | ✅ |
| DELETE | `/api/productos/:id` | **204 sin cuerpo** | 400, 404 | ✅ |
| PATCH | `/api/productos/:id/stock` | 200 + objeto | 400, 404, 409 (stock insuficiente) | ✅ |

- Recurso en **plural y minúsculas** (`productos`), **sin verbos** en la URL: la acción la dice el método HTTP.
- `stock` es un **sub-recurso** del producto, por eso `PATCH /productos/:id/stock` y no `/ajustarStock`.
- Filtros y paginación por **query string**, no en la ruta.
- **PUT** reemplaza el recurso completo → exige `nombre`, `precio` y `stock`.
  **PATCH** cambia solo una parte → se usa para el stock.
- Todos los errores salen con el mismo formato: `{ "error": "...", "detalles"?: [{ "campo", "mensaje" }] }`.
- Decisión: `GET /api/productos` siempre responde el objeto paginado (no a veces arreglo y a veces objeto),
  para que el cliente tenga una sola forma de leerlo.

## ¿Dónde se detecta cada error?

| Capa | Archivo | Ejemplo | Código |
|---|---|---|---|
| Formato | `express.json()` en `app.js` | `{"precio":` | 400 `JSON malformado` |
| Validación | reglas en `productos.routes.js` + `middlewares/validar.js` | `"precio":"mil"`, id `abc` | 400 + `detalles` |
| Negocio | `services/productos.service.js` | nombre repetido, stock insuficiente, id inexistente | 409 / 404 |
| Inesperado | `middlewares/errores.js` | `throw new Error()` | 500 genérico (stack solo en consola) |

## Laboratorio — lo que observé

1. **Content-Type decide.** Solo `application/json` llena `req.body`. Con `text/plain` o
   `x-www-form-urlencoded` (con cuerpo JSON) `express.json()` no lo parsea, `req.body` queda vacío y
   el validador responde 400 "El nombre es obligatorio". *Ojo:* el material dice que `text/plain` llega
   como texto crudo; eso solo pasa si se registra `express.text()`, que este proyecto no usa.
2. **Validación vs negocio.** A (JSON roto) → 400 en el parser; B (`"mil"`) → 400 en el validador;
   C (nombre repetido) → 409 en el service.
3. **Sin `ErrorHttp`.** Un `throw new Error()` común cae en la rama de "inesperado" → 500 controlado.
   Sin el manejador central, Express respondería con su página HTML de error por defecto.
   *Detalle:* el JSON malformado también es un error "no nuestro"; por eso el manejador revisa
   `error.type === 'entity.parse.failed'` y responde 400 en vez de 500.
4. **Orden de rutas.** Express evalúa en **orden de declaración**. Lo comprobé:
   - `/estado/activos` (dos segmentos) **nunca** choca con `/:id`, porque `:id` captura un solo
     segmento. Da igual el orden. (El material afirma lo contrario; no es así.)
   - Una ruta estática de **un** segmento, como `/disponibles`, sí choca: si `/:id` va antes, la
     atiende `/:id` con `id = "disponibles"` (y nuestro validador respondería 400).
   - Regla: **las rutas concretas van antes que las parametrizadas.**

## Postman

- `docs/postman/CampusEats-Semana5.postman_collection.json` (copia en `docs/postman-collection.json`, que es
  la ruta que pide el material).
- Variable de colección `{{base_url}}` = `http://localhost:3000`. "Crear" guarda el id en `{{producto_id}}`.
- Carpetas: Operaciones CRUD (5), Errores (5), Retos (5). Cada petición tiene un test del código esperado.
  Se puede correr entera con el **Runner** (verificado: 15 peticiones, 27 aserciones, 0 fallos).
