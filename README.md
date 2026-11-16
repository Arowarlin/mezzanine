# Mezzanine — propuesta local de rediseño

Rediseño completo del sitio de **Mezzanine**, el rooftop bar and kitchen de Egg Harbor, Wisconsin. Es una **demostración local no oficial**, preparada para presentarse al propietario o gerente del restaurante.

> **Importante:** no es el sitio oficial, no está afiliado a Mezzanine y no procesa reservas, pedidos, pagos, correos ni mensajes reales. Todo el contenido no verificado está marcado como pendiente.

## Qué incluye

### Sitio público (inglés)

- **Home** con hero cinematográfico, presentación de la experiencia, acceso a Eat/Drink, platos destacados, cócteles, galería y ubicación.
- **Eat** con el menú real de Lunch y Dinner 2026: nombres, descripciones y precios exactos del sitio oficial, imagen por plato (foto o ilustración) y botón para el pedido demo.
- **Drink** con los 10 cócteles del menú oficial, 9 cervezas/sidras de Wisconsin y 14 vinos (sin precio: el sitio oficial no los publica).
- **About** con contexto de Egg Harbor y Door County, sin historias inventadas.
- **Gallery** con filtros, grid masonry y lightbox navegable por teclado.
- **Reservations** con fecha, personas, franjas, cupo simulado y confirmación de demo.
- **Contact** con dirección, teléfono, mapa, horarios pendientes, redes y enlace al sitio oficial.
- **Careers** con el mensaje verificado “Now hiring all positions” y llamada telefónica.
- **Demo pre-order** con carrito, cantidades, notas, subtotal y confirmación; usa los platos con precio publicado y bloquea las bebidas sin precio.
- **Ilustraciones propias** en SVG para platos y bebidas (51) y para las 8 categorías; algunos platos usan además fotos reales de @mezzaninerooftop. Se reemplazan desde el panel o por archivo con el mismo nombre.

### Panel administrativo (español, interno)

- Login con JWT en cookie `httpOnly` y rutas protegidas.
- Dashboard con métricas de la demo.
- CRUD de productos, categorías, galería y empleos.
- Tipos de menú (`lunch`, `dinner`, `cocktails`, `beer`, `wine`), ingredientes, origen y precio pendiente.
- Pedidos y reservas demo con email del cliente y marca `is_demo`.
- Ajustes de marca, contacto, redes, horarios, textos de páginas y modo demo.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Lucide |
| Backend | Node.js, Express 5, Zod, JWT, bcryptjs, Multer |
| Base de datos | MariaDB / MySQL con `mysql2/promise` y SQL versionado |
| Pruebas | Vitest, Testing Library (infraestructura heredada) |

## Estructura

```
client/                 SPA pública + panel
  public/brand/         Logo original de Mezzanine (variantes clara y oscura)
  src/components/       UI, layout, carrito, admin
  src/context/          ajustes, carrito, autenticación
  src/pages/            páginas públicas y admin
  src/lib/              API, tipos, formato, navegación
server/                 API REST
  src/config/           entorno validado con Zod y marca
  src/db/               pool, migraciones y seed
  src/middleware/       auth, errores, límites, subidas
  src/modules/          rutas por dominio
docs/                   arquitectura, diseño, fases y datos pendientes
scripts/                utilidades (instancia MariaDB local)
```

## Puesta en marcha

### Requisitos

- Node.js 20+
- MariaDB 10.4+ o MySQL 8+
- npm 10+

### 1. Instalar

```bash
git clone <URL-del-repositorio> mezzanine
cd mezzanine
npm run install:all
```

### 2. Base de datos

```sql
CREATE DATABASE restaurante_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurante'@'localhost' IDENTIFIED BY 'una_clave_segura';
GRANT ALL PRIVILEGES ON restaurante_web.* TO 'restaurante'@'localhost';
FLUSH PRIVILEGES;
```

En Windows se incluye una instancia aislada en el puerto `3307`:

```bash
npm run db:start
npm run db:status
npm run db:stop
```

### 3. Variables de entorno

```bash
cp server/.env.example server/.env
```

Define como mínimo `DB_PASSWORD`, `JWT_SECRET` (32+ caracteres), `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Nunca subas `.env` al repositorio.

### 4. Migrar y sembrar

```bash
npm run db:migrate
npm run db:seed
```

El seed deja 8 categorías, 76 productos (43 de comida y 33 de bebida), 8 imágenes de galería y 1 puesto de empleo. Reemplaza el catálogo y la galería, pero conserva pedidos, reservas, clientes y usuarios.

### 5. Desarrollo

```bash
npm run dev
```

- Sitio: <http://localhost:5173>
- API: <http://localhost:4000/api/health>
- Panel: <http://localhost:5173/admin>

### Producción (solo si el restaurante autoriza)

```bash
npm run build
NODE_ENV=production npm start
```

El servidor sirve `client/dist` y la API desde el mismo origen. Configura `COOKIE_SECURE=true` detrás de HTTPS.

## API principal

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/public/settings` | Ajustes públicos, textos y aviso demo |
| `GET` | `/api/public/categories` | Categorías con `kind` |
| `GET` | `/api/public/products` | Filtros `q`, `category`, `menu`, `featured` |
| `GET` | `/api/public/gallery` | Galería, filtro `category` |
| `GET` | `/api/public/careers` | Puestos activos |
| `GET` | `/api/public/reservations/slots?date=` | Franjas y cupo |
| `POST` | `/api/public/reservations` | Reserva demo |
| `POST` | `/api/public/orders` | Pedido demo (solo productos con precio) |
| `POST` | `/api/auth/login` · `logout` · `GET me` | Sesión del personal |
| `GET` | `/api/admin/stats` | Dashboard |
| `GET/POST/PATCH/DELETE` | `/api/admin/products` · `categories` · `gallery` · `careers` | Catálogo y contenido |
| `GET/PATCH` | `/api/admin/orders` · `reservations` · `customers` | Operación |
| `GET/PUT` | `/api/admin/settings` | Ajustes |
| `POST/DELETE` | `/api/admin/uploads` | Imágenes |

## Modo demo

- `demo_mode=true` por defecto.
- Reservas y pedidos se guardan con `is_demo=1`.
- Los pedidos no generan enlace de WhatsApp ni envían nada.
- No hay pagos, correos, SMS ni integraciones de producción.
- El sitio está en `noindex` y `robots.txt` bloquea indexación.
- Aviso visible en el header, footer y páginas sensibles.

## Logo

Se usa el **archivo original** de Mezzanine, sin redibujar, recolorear ni deformar:

- `client/public/brand/mezzanine-logo-original.png` — original intocable.
- `client/public/brand/mezzanine-logo-color.png` — recorte con fondo transparente y bordes suavizados, para fondos claros.
- `client/public/brand/mezzanine-logo-white.png` — texto en blanco y ondas con su color original, para fondos oscuros.
- `client/public/brand/mezzanine-waves.png` — recorte de las tres ondas para favicons.

Las variantes se regeneran con:

```bash
python -m pip install pillow numpy
python scripts/make_logo_variants.py
```

Solo se ajusta el tamaño y la ubicación de forma responsive, manteniendo la proporción.

## Seguridad

- bcrypt (coste 12) y comparación de tiempo constante.
- JWT en cookie `httpOnly`, `sameSite=lax`.
- Zod en formularios y API.
- SQL parametrizado y listas blancas para identificadores.
- Rate limiting en login y escrituras públicas.
- Precios recalculados en el servidor.
- Helmet, CORS restringido y subida de imágenes validada.
- `.env` fuera del repositorio.

## Documentación

- [`docs/arquitectura.md`](docs/arquitectura.md) — modelo de datos, endpoints, demo e i18n.
- [`docs/diseno.md`](docs/diseno.md) — sistema visual y reglas del logo.
- [`docs/fases.md`](docs/fases.md) — bitácora y pruebas por fase.
- [`docs/datos-pendientes.md`](docs/datos-pendientes.md) — todo lo que falta confirmar.

## Licencia

MIT.
