# Bitácora de fases

## FASE 1 — Análisis y arquitectura · completada

**Inspección realizada**

- `C:\Users\PC` no contenía ningún proyecto de restaurante. Nada que sobrescribir.
- Node `v24.13.1`, npm `11.8.0`, git `2.56.0`, VS Code `1.146.0`.
- No había PostgreSQL ni MySQL como servicio, ni Docker.
- XAMPP incluía MariaDB 10.4.32, pero su instancia compartida (`C:\xampp\mysql\data`) tiene **páginas Aria corruptas** y bases de otros proyectos (`ventas_catalogo`). Se descartó usarla.

**Decisiones**

1. Proyecto independiente en `C:\Users\PC\Proyectos\restaurante-web`, repositorio git propio. Sin relación con Trading Lab.
2. **Instancia MariaDB propia del proyecto**: datos en `.db/data`, puerto `3307`, usuario `restaurante`, base `restaurante_web`. La instancia compartida de XAMPP no se toca.
3. Monorepo `client/` + `server/`, sin ORM: SQL versionado y consultas parametrizadas explícitas.
4. Dinero en centavos enteros. Marca provisional **Casa Veranda** centralizada.
5. Orden de construcción: **datos y API antes que interfaz**, para que ninguna pantalla use datos simulados.

**Entregables**

- `docs/arquitectura.md` — stack, estructura, modelo de datos, API, seguridad.
- `package.json` raíz con scripts `dev`, `build`, `test`, `db:*`.
- `scripts/db.mjs` — arranque/parada/estado de la instancia propia.
- `.gitignore`, `server/.env.example`.

## FASE 2 — Diseño UI/UX · completada

**Sistema visual**

- Paleta cálida y caribeña: `cream` (fondo), `ink` (texto), `forest` y `moss` (verdes profundos), `gold`, `clay`, `sand` (neutros).
- Tipografía editorial: display serif para titulares, sans para interfaz; titulares con cursivas de acento.
- Componentes propios en `client/src/index.css`: `.container-page`, `.eyebrow`, `.field`, `.label`, `.card`, `.btn-*`, `.admin-table`, utilidades de animación (`Reveal`, `drawer-enter`).
- Respeto por `prefers-reduced-motion` y foco visible en todos los controles.

**Entregables**

- Tokens y utilidades en `client/src/index.css`.
- Componentes reutilizables en `client/src/components/ui/` (`Modal`, `SmartImage`, `Spinner`, `StatusBadge`, `Reveal`, `SectionHeading`).
- `docs/arquitectura.md` ampliado con el mapa de pantallas.

## FASE 3 — Frontend · completada

**Sitio público** (React 19 + TypeScript + Vite + Tailwind 4 + React Router + Lucide)

- `HomePage`: portada, destacados reales, historia, promoción, galería y testimonios.
- `MenuPage`: búsqueda sin acentos, filtros por categoría y destacados, añadir al carrito.
- `AboutPage` y `GalleryPage` con visor de imágenes y navegación por teclado.
- `ReservationsPage`: franjas reales del backend, control de cupo, días cerrados y confirmación con código.
- `OrderPage`: entrega o recogida, mínimo de entrega, observaciones por plato y enlace de WhatsApp.
- `ContactPage`: mapa embebido, horario y mensajes directos por WhatsApp o correo.
- `NotFoundPage`, `PublicLayout`, `SiteHeader`, `SiteFooter`, `Brand`.
- `CartProvider` persistente en `localStorage`; `SettingsProvider` y `AuthProvider` alimentados por la API.

**Verificación**

- `npm --prefix client run build` → `tsc -b` sin errores y build de Vite correcto (~430 kB JS, ~68 kB CSS).
- Rutas públicas probadas contra la API real en `http://localhost:4000`.

## FASE 4 — Backend · completada

**API REST** (Node + Express 5 + Zod + JWT + bcryptjs + Multer)

- Configuración validada con Zod (`server/src/config/env.ts`); `ADMIN_PASSWORD` es obligatorio, sin valor por defecto en el repositorio.
- Pool `mysql2/promise` con `dateStrings: true` y helpers `query`/`queryOne`/`execute`.
- Migración `001_init.sql` y seed idempotente (18 ajustes, administrador, 5 categorías, 20 productos, 8 imágenes).
- Módulos: catálogo público, pedidos, reservas, autenticación, estadísticas, productos, categorías, pedidos admin, reservas admin, clientes, ajustes y subidas.
- Precios y totales recalculados en el servidor desde la base de datos; snapshots de nombre y precio en cada línea de pedido.

**Verificación**

- `npm --prefix server run build` sin errores.
- Prueba HTTP completa: login, 18 ajustes, alta/edición/baja de categoría y producto, métricas del dashboard.

## FASE 5 — Base de datos · completada

- Instancia propia en `127.0.0.1:3307`, datos en `.db/data`, contraseña de `root` en `.db/root-password.txt` (no versionado).
- Base `restaurante_web` con `utf8mb4_unicode_ci`, usuario dedicado `restaurante`.
- Tablas: `users`, `settings`, `categories`, `products`, `gallery_images`, `customers`, `orders`, `order_items`, `reservations`.
- Índices para búsquedas del panel (código, fecha, estado, teléfono) y claves foráneas con borrado controlado.
- Dinero en `INT` de centavos; fechas y horas como `DATE`/`TIME`.

## FASE 6 — Pedidos y reservas · completada

**Pedidos**

- Código legible (`CV-XXXXX`), tipo `delivery`/`pickup`, costo de envío y mínimo leídos de `settings`.
- Validación de stock lógico (producto disponible), cantidades y observaciones por línea.
- URL de WhatsApp generada en el servidor con el detalle completo del pedido.
- Panel: filtros por estado, búsqueda por código/cliente/teléfono, detalle y cambio de estado.

**Reservas**

- Franjas generadas desde horario y `slot_minutes`; cupo por `seats_per_slot`; bloqueo de días cerrados y fechas pasadas.
- Código `RS-XXXXX`, control de asientos disponibles por franja y validación de datos del cliente.
- Panel: filtros por fecha y estado, búsqueda, detalle y cambio de estado (pendiente, confirmada, en mesa, completada, cancelada, no asistió).

**Verificación**

- Pedido `CV-93MEG` y reserva `RS-WWRDP` creados por HTTP con totales y cupos correctos; datos de prueba eliminados al cerrar la fase.

## FASE 7 — Panel administrativo · completada

**Acceso**

- `AdminLoginPage` con validación, mostrar/ocultar contraseña y mensajes de error reales.
- `RequireAuth` protege `/admin/*` y conserva el destino original; `AdminLayout` con navegación lateral, menú móvil, usuario y cierre de sesión.

**Módulos**

- **Dashboard**: ventas de hoy, pedidos pendientes, reservas y comensales, clientes, serie de 7 días, más vendidos y listas de próximas reservas y últimos pedidos.
- **Pedidos**: filtros, búsqueda, detalle con líneas, notas y cambio de estado.
- **Reservas**: filtros por fecha/estado, búsqueda, detalle y cambio de estado.
- **Productos**: CRUD completo, precio, categoría, orden, destacado, disponibilidad y subida de imagen.
- **Categorías**: CRUD, orden, visibilidad y conteo de platos.
- **Clientes**: búsqueda, edición de nombre/correo/notas y contacto por WhatsApp.
- **Ajustes**: identidad, contacto, moneda, envío, pedido mínimo, horario, franjas, asientos y días cerrados.

**Verificación**

- Prueba HTTP del panel: login, ajustes, alta/edición/baja de categoría y producto de prueba, métricas. Datos de prueba eliminados.
- `npm --prefix client run build` correcto tras el panel.

## FASE 8 — Seguridad y pruebas · completada

- Contraseñas con bcrypt (coste 12) y comparación de tiempo constante ante correos inexistentes.
- JWT en cookie `httpOnly`, `sameSite=lax`, expiración configurable y `COOKIE_SECURE` para HTTPS.
- Validación Zod en toda entrada; rutas administrativas con `requireAuth`.
- Consultas SQL siempre parametrizadas; identificadores de tabla por listas blancas.
- Rate limit en login y en escrituras públicas; Helmet y CORS restringido.
- Subida de imágenes validada por tipo MIME y tamaño máximo.
- `.env`, `.db/` y `server/public/uploads/*` fuera del repositorio público.
- Verificado que `/api/admin/stats` sin sesión responde `401`.

## FASE 9 — Optimización y documentación · completada

- Builds de producción de `client` y `server` correctos; el servidor sirve la SPA y la API desde el mismo origen.
- Imágenes con carga diferida y fallback (`SmartImage`); animaciones solo cuando el usuario las acepta.
- `README.md` raíz con funcionalidad, stack, instalación, API, seguridad y despliegue.
- `docs/arquitectura.md` con decisiones, modelo de datos y endpoints; esta bitácora con el detalle por fase.
- Repositorio público: <https://github.com/Arowarlin/casa-veranda>.
