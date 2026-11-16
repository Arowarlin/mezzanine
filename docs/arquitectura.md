# Arquitectura — Casa Veranda

> Nombre provisional. La marca real se cambia en `server/src/config/restaurant.ts` y en la tabla `settings`.

## 1. Alcance

Sitio público de restaurante + panel administrativo, en un solo repositorio con dos aplicaciones:

| Aplicación | Responsabilidad | Puerto |
|---|---|---|
| `client/` | SPA React: Inicio, Menú, Nosotros, Galería, Reservaciones, Pedidos, Contacto, Panel | 5173 (dev) |
| `server/` | API REST Express + acceso a MariaDB + archivos subidos | 4000 (dev) |

En producción el build del cliente se sirve desde el propio Express (un solo despliegue, un solo dominio, sin CORS).

## 2. Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Lucide React + React Router.
- **Backend**: Node.js 24 + Express 5 + TypeScript.
- **Base de datos**: MariaDB 10.4 (compatible MySQL), instancia **propia del proyecto** en el puerto 3307, datos en `.db/data` (ignorado por git).
- **Driver**: `mysql2/promise` con pool y **consultas siempre parametrizadas**.
- **Validación**: Zod en servidor y reutilizada en el cliente.
- **Autenticación**: JWT firmado, transportado en cookie `httpOnly` + `SameSite=Lax`; contraseñas con `bcryptjs`.
- **Subidas**: `multer` a disco, validación de tipo y tamaño, nombre generado.
- **Pruebas**: Vitest + Supertest (API), Vitest + Testing Library (componentes críticos).

Sin ORM: el esquema se versiona en SQL (`server/src/db/migrations`) y las consultas viven en repositorios tipados. Esto mantiene el SQL explícito, portable y fácil de auditar.

## 3. Estructura

```
restaurante-web/
├─ client/
│  ├─ src/
│  │  ├─ components/      # UI reutilizable (botones, tarjetas, layout, carrito)
│  │  ├─ pages/           # una carpeta por página pública
│  │  ├─ pages/admin/     # login + secciones del panel
│  │  ├─ context/         # carrito, sesión, notificaciones
│  │  ├─ lib/             # cliente HTTP, formato de dinero/fechas, marca
│  │  └─ types/           # tipos compartidos con la API
│  └─ public/             # imágenes estáticas de marca
├─ server/
│  ├─ src/
│  │  ├─ config/          # entorno validado, datos del restaurante
│  │  ├─ db/              # pool, migrador, seed, migraciones SQL
│  │  ├─ modules/         # auth, categorias, productos, pedidos, reservas, clientes, ajustes, subidas, estadisticas
│  │  ├─ middleware/      # auth, errores, validacion, rate limit, subidas
│  │  ├─ lib/             # dinero, codigos, fechas, errores HTTP
│  │  ├─ app.ts           # composicion de Express
│  │  └─ index.ts         # arranque y apagado ordenado
│  ├─ public/uploads/     # imagenes subidas (ignoradas por git)
│  └─ tests/              # pruebas de API
├─ scripts/db.mjs         # arranca/para la instancia MariaDB del proyecto
└─ docs/                  # arquitectura y bitacora de fases
```

## 4. Modelo de datos

Dinero en **enteros de centavos** (`price_cents`, `total_cents`) para evitar errores de coma flotante. Moneda configurable en `settings` (por defecto `DOP`).

- `users` — administradores: nombre, email único, `password_hash`, rol, activo.
- `categories` — nombre, slug único, descripción, imagen, orden, activa.
- `products` — categoría, nombre, slug único, descripción, precio, imagen, destacado, disponible, orden.
- `customers` — nombre, teléfono (clave natural), email, notas.
- `orders` — código público único, cliente, tipo (`delivery`/`pickup`), estado, subtotal, envío, total, dirección, notas, fecha deseada.
- `order_items` — copia congelada de nombre y precio del producto + cantidad + notas.
- `reservations` — código, cliente, fecha, hora, personas, notas, estado.
- `gallery_images` — url, título, orden, activa.
- `settings` — pares clave/valor: marca, teléfono, WhatsApp, dirección, horario, costo de envío, capacidad por franja.

Los pedidos guardan **snapshot** de nombre y precio: cambiar el menú mañana no altera el historial.

## 5. API REST

Público:
- `GET /api/public/settings`
- `GET /api/public/categories`
- `GET /api/public/products?q=&category=&featured=&available=`
- `GET /api/public/gallery`
- `GET /api/public/reservations/slots?date=YYYY-MM-DD`
- `POST /api/public/orders`
- `POST /api/public/reservations`

Autenticación:
- `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`

Administración (cookie válida + rol):
- `GET /api/admin/stats`
- `GET|POST|PATCH|DELETE /api/admin/products[/:id]`
- `GET|POST|PATCH|DELETE /api/admin/categories[/:id]`
- `GET /api/admin/orders` · `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/reservations` · `PATCH /api/admin/reservations/:id/status`
- `GET /api/admin/customers` · `PATCH /api/admin/customers/:id`
- `GET|PUT /api/admin/settings`
- `POST /api/admin/uploads` · `DELETE /api/admin/uploads/:name`

## 6. Seguridad

1. Contraseñas con `bcryptjs` (coste 12). Nunca se devuelve el hash.
2. JWT en cookie `httpOnly`; el cliente no puede leer el token desde JavaScript.
3. Middleware `requireAuth` en todo `/api/admin` y `requireRole` donde aplique.
4. Validación Zod de **todo** cuerpo, query y parámetro antes de tocar la base.
5. Consultas parametrizadas (`?`) en el 100 % de los accesos; nunca concatenación de SQL.
6. `helmet`, CORS restringido al origen del cliente, límite de tasa en login y en endpoints públicos de escritura.
7. Mensajes de error genéricos al cliente; detalle solo en el log del servidor.
8. Secretos en `.env` (ignorado por git) y `.env.example` sin valores reales.
9. Subidas: extensión y MIME permitidos, tamaño máximo, nombre aleatorio, sin ejecución.
10. Apagado ordenado del pool y de la instancia de base de datos.

## 7. Decisiones de diseño

- **Sin estado de sesión en el cliente**: la sesión se consulta con `GET /api/auth/me`; el panel no parpadea porque hay una pantalla de carga mientras se resuelve.
- **Un solo dominio en producción**: evita CORS y simplifica cookies.
- **Códigos públicos legibles** (`CV-8F3K2`) para pedidos y reservas: el cliente puede dictarlos por teléfono.
- **Disponibilidad real de reservas**: capacidad por franja de 30 minutos calculada en SQL, no en el navegador.
- **Imágenes**: se guardan en disco y se sirven con caché; el seed usa fotografías remotas de alta calidad y el panel permite sustituirlas.
