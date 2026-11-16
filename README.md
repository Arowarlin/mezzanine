# Casa Veranda

Sitio web completo para un restaurante de cocina caribeña contemporánea en Santo Domingo: carta pública, galería, reservaciones con control de cupo, pedidos en línea con confirmación por WhatsApp y panel administrativo real.

> Proyecto independiente, construido desde cero. Sin datos simulados: todo lo que se ve en pantalla sale de la base de datos.

![Stack](https://img.shields.io/badge/React-19-1b3a2d) ![TypeScript](https://img.shields.io/badge/TypeScript-7-1b3a2d) ![Express](https://img.shields.io/badge/Express-5-1b3a2d) ![MariaDB](https://img.shields.io/badge/MariaDB-10.4-1b3a2d)

## Funcionalidad

### Sitio público

- **Inicio** con portada, platos destacados, historia, promoción, galería y testimonios.
- **Menú** con búsqueda sin acentos, filtros por categoría y destacados; carrito persistente.
- **Nosotros** y **Galería** con visor de imágenes y navegación por teclado.
- **Reservaciones**: disponibilidad real por franja, control de asientos, días cerrados y confirmación con código.
- **Pedido en línea**: entrega o recogida, mínimo de entrega, observaciones por plato, datos del cliente, total calculado en el servidor y enlace de WhatsApp con el detalle.
- **Contacto** con mapa, horario y mensajes directos por WhatsApp o correo.
- Diseño responsive, animaciones al hacer scroll y respeto por `prefers-reduced-motion`.

### Panel administrativo

- Login con JWT en cookie `httpOnly` y rutas protegidas.
- Dashboard con ventas del día, pedidos pendientes, reservas, clientes y serie de 7 días.
- CRUD de productos y categorías, con subida de imágenes y control de disponibilidad.
- Pedidos con detalle, cambio de estado y contacto directo con el cliente.
- Reservas con filtros, cambio de estado y cupo por franja.
- Clientes con historial de consumo y notas internas.
- Ajustes del restaurante: marca, contacto, moneda, envío, pedido mínimo, horario y días cerrados.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Lucide |
| Backend | Node.js, Express 5, Zod, JWT, bcryptjs, Multer |
| Base de datos | MariaDB / MySQL con `mysql2/promise` y SQL versionado (sin ORM) |
| Pruebas | Vitest, Testing Library |

## Estructura

```
casa-veranda/
├── client/                 # SPA pública + panel administrativo
│   └── src/
│       ├── components/     # UI, layout, carrito, menú
│       ├── context/        # ajustes, carrito, autenticación
│       ├── pages/          # páginas públicas y admin
│       └── lib/            # API, tipos, formato
├── server/                 # API REST
│   └── src/
│       ├── config/         # entorno validado con Zod y marca
│       ├── db/             # pool, migraciones y seed
│       ├── middleware/     # auth, errores, límites, subidas
│       └── modules/        # rutas por dominio
├── docs/                   # arquitectura y bitácora de fases
├── scripts/                # utilidades (instancia MariaDB local)
└── package.json            # scripts raíz
```

## Puesta en marcha

### Requisitos

- Node.js 20 o superior
- MariaDB 10.4+ o MySQL 8+ (local o remoto)
- npm 10+

### 1. Clonar e instalar

```bash
git clone https://github.com/Arowarlin/casa-veranda.git
cd casa-veranda
npm run install:all
```

### 2. Base de datos

Crea la base y un usuario dedicado (ajusta la contraseña):

```sql
CREATE DATABASE restaurante_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurante'@'localhost' IDENTIFIED BY 'una_clave_segura';
GRANT ALL PRIVILEGES ON restaurante_web.* TO 'restaurante'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Variables de entorno

```bash
cp server/.env.example server/.env
```

Edita `server/.env` y define como mínimo `DB_PASSWORD`, `JWT_SECRET` (32+ caracteres), `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Nunca subas `.env` al repositorio.

### 4. Migrar y sembrar

```bash
npm run db:migrate
npm run db:seed
```

El seed crea los ajustes del restaurante, el administrador, 5 categorías, 20 productos y la galería inicial.

### 5. Desarrollo

```bash
npm run dev
```

- Sitio: <http://localhost:5173>
- API: <http://localhost:4000/api/health>
- Panel: <http://localhost:5173/admin>

### Producción

```bash
npm run build
NODE_ENV=production npm start
```

El servidor sirve `client/dist` y la API desde el mismo origen. Configura `COOKIE_SECURE=true` detrás de HTTPS.

### Instancia MariaDB local (opcional, Windows)

`scripts/db.mjs` levanta una instancia aislada en el puerto `3307` con datos en `.db/data`, pensada para desarrollo en Windows con los binarios de XAMPP. No toca otras instalaciones:

```bash
npm run db:start
npm run db:status
npm run db:stop
```

Si usas otra instalación de MariaDB/MySQL, ignora este script y apunta `DB_HOST`/`DB_PORT` a la tuya.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/public/settings` | Ajustes públicos del restaurante |
| `GET` | `/api/public/categories` | Categorías activas |
| `GET` | `/api/public/products` | Productos disponibles (`q`, `category`, `featured`) |
| `GET` | `/api/public/gallery` | Imágenes activas |
| `GET` | `/api/public/reservations/slots?date=` | Franjas y cupo por fecha |
| `POST` | `/api/public/reservations` | Crear reserva |
| `POST` | `/api/public/orders` | Crear pedido y obtener URL de WhatsApp |
| `POST` | `/api/auth/login` · `logout` · `GET me` | Sesión del personal |
| `GET` | `/api/admin/stats` | Métricas del dashboard |
| `GET/POST/PATCH/DELETE` | `/api/admin/products` · `categories` | Catálogo |
| `GET/PATCH` | `/api/admin/orders` · `reservations` | Operación diaria |
| `GET/PATCH` | `/api/admin/customers` | Clientes |
| `GET/PUT` | `/api/admin/settings` | Ajustes |
| `POST/DELETE` | `/api/admin/uploads` | Imágenes |

## Seguridad

- Contraseñas con bcrypt (coste 12) y comparación de tiempo constante ante correos inexistentes.
- Sesión JWT en cookie `httpOnly`, `sameSite=lax`, con expiración configurable.
- Validación de toda entrada con Zod, tanto en formularios como en la API.
- Consultas SQL siempre parametrizadas; identificadores de tabla controlados por listas blancas.
- Límite de peticiones en login y en escrituras públicas.
- Precios y totales recalculados en el servidor a partir de la base de datos, nunca desde el cliente.
- Helmet, CORS restringido al origen del cliente y subida de imágenes validada por tipo y tamaño.
- Secretos fuera del repositorio (`.env` ignorado).

## Documentación

- [`docs/arquitectura.md`](docs/arquitectura.md) — decisiones, modelo de datos y endpoints.
- [`docs/fases.md`](docs/fases.md) — bitácora de construcción por fases.

## Licencia

MIT.
