# Arquitectura — Mezzanine (demo local)

Este proyecto es una propuesta local para Mezzanine, construida con React 19 + Express 5 + MariaDB. No es el sitio oficial y no está conectado a producción.

## 1. Capas

```
client/  SPA React + TypeScript + Vite + Tailwind 4
server/  API REST Express 5 + Zod + JWT + MySQL/MariaDB
docs/    arquitectura, diseño, fases y datos pendientes
```

- **Cliente**: React Router, contextos de ajustes/carrito/auth, componentes de UI reutilizables (`SmartImage`, `Reveal`, `Modal`, `StatusBadge`).
- **Servidor**: rutas por dominio (`catalog`, `orders`, `reservations`, `admin-*`), validación Zod, pool `mysql2/promise`, migraciones SQL versionadas.
- **Base de datos**: MariaDB 10.4 en el puerto local 3307 para desarrollo; sin ORM.

## 2. Modelo de datos

### Tablas existentes (001)

`users`, `categories`, `products`, `customers`, `orders`, `order_items`, `reservations`, `gallery_images`, `settings`.

### Migración 002 (`002_mezzanine.sql`)

| Tabla | Cambio | Motivo |
| --- | --- | --- |
| `categories` | `kind ENUM('food','drink')` | Separar cocina y bar |
| `products` | `menu_type ENUM('lunch','dinner','cocktails','beer','wine')` | Un producto puede pertenecer a un menú concreto |
| `products` | `ingredients TEXT` | Ingredientes verificados de cócteles o varietal de vino |
| `products` | `origin VARCHAR(160)` | Brewery/origen del vino |
| `products` | `is_demo TINYINT(1)` | Marcar contenido de demostración |
| `products` | índice `(menu_type, is_available)` | Filtros públicos |
| `gallery_images` | `category VARCHAR(40)` | Filtros de galería (rooftop, space, food, drinks) |
| `orders` | `is_demo TINYINT(1)` | Pedidos de demostración |
| `reservations` | `is_demo TINYINT(1)` | Reservas de demostración |
| nueva `career_openings` | id, title, description, employment_type, sort_order, is_active | Página de empleos editable |

Todas las columnas usan `ADD COLUMN IF NOT EXISTS` para poder re-ejecutar la migración sin daño. La migración se registra en `schema_migrations`.

### Limpieza de marca (003)

`server/migrations/003_cleanup_branding.sql` sustituye cualquier resto de la marca anterior en ajustes, catálogo, galería, empleos, usuarios, clientes, pedidos y reservas. Se ejecutó manualmente contra MariaDB 3307 y es idempotente.

### Reglas de contenido

- Los platos sin precio confirmado usan `price_cents = 0`; la UI muestra “Pricing pending” y el servidor rechaza pedidos con esos productos.
- Las bebidas usan precios de muestra y `is_demo = 1`.
- `products.slug` es único; los platos repetidos entre lunch y dinner usan prefijos (`lunch-…`, `dinner-…`).
- El seed reemplaza catálogo, galería y empleos, pero **conserva** pedidos, reservas, clientes y usuarios.

## 3. API pública

| Método | Ruta | Notas |
| --- | --- | --- |
| `GET` | `/api/public/settings` | Incluye marca, contacto, redes, horarios, avisos demo y textos de páginas |
| `GET` | `/api/public/categories` | Categorías activas con `kind` |
| `GET` | `/api/public/products` | Filtros `q`, `category`, `menu`, `featured`, `available`; devuelve `ingredients`, `origin`, `menuType`, `isDemo` |
| `GET` | `/api/public/gallery` | Filtro opcional `category` |
| `GET` | `/api/public/careers` | Puestos activos |
| `GET` | `/api/public/reservations/slots?date=` | Franjas y cupo simulado |
| `POST` | `/api/public/reservations` | Crea reserva demo (`is_demo`) |
| `POST` | `/api/public/orders` | Crea pedido demo; solo productos con precio > 0; `whatsappUrl` es `null` en demo |

## 4. API administrativa

| Método | Ruta | Notas |
| --- | --- | --- |
| `POST` | `/api/auth/login` · `logout` · `GET me` | JWT en cookie httpOnly |
| `GET` | `/api/admin/stats` | Métricas del dashboard |
| `GET/POST/PATCH/DELETE` | `/api/admin/categories` | Incluye `kind` |
| `GET/POST/PATCH/DELETE` | `/api/admin/products` | Incluye `menuType`, `ingredients`, `origin`, `isDemo` |
| `GET/POST/PATCH/DELETE` | `/api/admin/gallery` | CRUD de galería |
| `GET/POST/PATCH/DELETE` | `/api/admin/careers` | CRUD de empleos |
| `GET/PATCH` | `/api/admin/orders` · `/api/admin/reservations` | Incluye `isDemo` y email del cliente |
| `GET/PATCH` | `/api/admin/customers` | Clientes |
| `GET/PUT` | `/api/admin/settings` | Claves blancas desde `restaurantDefaults` |
| `POST/DELETE` | `/api/admin/uploads` | Imágenes validadas por tipo/tamaño |

## 5. Claves de ajustes

Se conservan las claves originales y se añaden:

- `facebook`, `official_website`
- `hours_note`
- `demo_mode` (`true`/`false`), `demo_notice`
- `hero_title`, `hero_subtitle`
- `about_intro`, `careers_intro`

Valores actuales: `currency=USD`, `open_time=11:00`, `close_time=21:00`, `slot_minutes=30`, `seats_per_slot=40`, `closed_days=2,3`, `delivery_fee_cents=0`, `min_order_cents=0`.

## 6. Modo demo

- `demo_mode=true` por defecto.
- Las reservas y pedidos se guardan con `is_demo=1`.
- El pedido no genera enlace de WhatsApp si `demo_mode` está activo o si no hay WhatsApp configurado.
- No hay envío de correo, SMS, pagos ni integraciones.
- `robots.txt` bloquea indexación y el HTML incluye `noindex, nofollow`.
- El aviso “Unofficial redesign proposal” aparece en el header y en páginas sensibles.

## 7. Seguridad

- Contraseñas con bcrypt (coste 12).
- JWT en cookie `httpOnly`, `sameSite=lax`, expiración configurable.
- Zod en todos los cuerpos y query strings.
- SQL siempre parametrizado; identificadores de tabla limitados por listas blancas.
- Rate limiting en login y escrituras públicas.
- Precios y totales recalculados en el servidor.
- Helmet, CORS restringido, subida de imágenes validada.
- `.env` fuera del repositorio.

## 8. Preparación para español

La interfaz pública está en inglés. Los textos de marca viven en `settings` y en `client/src/lib/site.ts`; las rutas nuevas son neutras (`/eat`, `/drink`, `/about`, etc.). Para añadir español:

1. Extraer los textos de `site.ts` y de las páginas a un diccionario (`en`/`es`).
2. Añadir un `LanguageContext` y un selector en header/footer.
3. Duplicar las claves de contenido en `settings` (`hero_title_es`, etc.) o crear una tabla `content_translations`.
4. Mantener las rutas y añadir un prefijo (`/es/...`) o negociación por `Accept-Language`.

No se implementó el selector en esta fase para no añadir complejidad sin contenido traducido aprobado.

## 9. Decisiones y límites

- **No se copiaron fotografías del restaurante**: se usan imágenes de Unsplash y se marcan como ilustrativas.
- **No se inventaron platos, recetas ni precios**: ver `docs/datos-pendientes.md`.
- **Los horarios se muestran como pendientes** por la contradicción del sitio oficial.
- **El correo y WhatsApp públicos no existen**: la UI los oculta en lugar de inventarlos.
- **El logo es el archivo original**: no se redibuja ni se recolorea.
