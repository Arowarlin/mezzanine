# Bitácora de fases — rediseño local de Mezzanine

Rama de trabajo: `mezzanine-local-redesign`, creada desde `main`. El estado anterior queda disponible en `main` y en el tag de referencia.

## Fase 1 — Auditoría del proyecto existente

**Hecho**

- Se inventarió la estructura completa de `client/`, `server/` y `docs/`.
- Se revisaron páginas públicas, panel administrativo, contextos, componentes, rutas de API, migraciones, seed y configuración.
- Se identificaron dependencias, scripts de build, reglas de seguridad y puntos de reutilización.
- Se documentó el estado de la base local (MariaDB en 3307, sin datos de pedidos/reservas).

**Decisiones**

- Reutilizar la arquitectura React + Express + MariaDB en lugar de crear un proyecto nuevo.
- Conservar autenticación, validaciones, rate limiting, subida de imágenes y panel existente.
- Mantener las rutas administrativas en español y pasar el sitio público a inglés.

## Fase 2 — Investigación del sitio oficial

**Hecho**

- Se visitaron portada, lunch, dinner, cocktails, wine, beer, eat-landing, employment y gift.
- Se verificaron nombre, dirección, teléfono, Instagram, Facebook y sitio oficial.
- Se extrajeron los 10 cócteles con sus ingredientes, 9 cervezas/sidras y 14 vinos con origen y notas.
- Se detectó la contradicción de horarios (“Closed Tuesday & Wednesday” vs. “7 days a week, 11am–9pm”).
- Se documentó que los menús de comida son imágenes no legibles y que no se deben inventar platos ni precios.

**Decisiones**

- Marcar horarios como pendientes.
- Usar listados públicos para nombres de platos y etiquetar precios como pendientes.
- Usar precios de muestra solo en bebidas, para que el carrito demo funcione.
- Excluir platos de desayuno no confirmados.

## Fase 3 — Diseño

**Hecho**

- Sistema visual: Fraunces + Inter Tight, paleta ink/cream/sand/gold/clay, radios amplios y mucho aire.
- Header oscuro con el logo original en su variante para fondo oscuro; footer completo; franja de aviso demo.
- Componentes: `.chip`, `.chip-gold`, `.chip-ember`, `.menu-row`, botones y campos actualizados.
- Estructura de navegación: Home, Eat, Drink, Gallery, About, Contact, con CTA de reservas y carrito demo.
- Documentación en `docs/diseno.md`, incluidas las reglas del logo.

**Archivos**

- `client/src/index.css`
- `client/index.html`
- `client/public/brand/mezzanine-logo-original.png`
- `client/public/brand/mezzanine-logo-white.png`
- `client/public/brand/mezzanine-logo-color.png`
- `client/public/brand/mezzanine-waves.png`
- `client/public/favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
- `scripts/make_logo_variants.py`
- `client/public/robots.txt`, `client/public/sitemap.xml`
- `docs/diseno.md`

## Fase 4 — Frontend público

**Hecho**

- `HomePage`: hero cinematográfico, experiencia, Eat/Drink, platos destacados, cócteles, galería y ubicación.
- `EatPage`: pestañas Lunch/Dinner, categorías, imagen por plato (foto o ilustración), precios publicados y botón Add.
- `DrinkPage`: cócteles en tarjetas, cerveza y vino en listas agrupadas; sin precios (no publicados).
- `AboutPage`: contexto de Egg Harbor/Door County, experiencia y aviso demo.
- `GalleryPage`: filtros, masonry, lightbox con teclado y contador.
- `ReservationsPage`: formulario demo completo con franjas, cupo, validación y confirmación.
- `ContactPage`: dirección, teléfono, mapa embebido, horarios pendientes, redes y sitio oficial.
- `CareersPage`: introducción, cultura, puestos publicados y llamada telefónica.
- `OrderPage`: carrito demo, solo recogida, platos con precio publicado, notas por ítem y confirmación.
- `CartDrawer` y `NotFoundPage` en inglés.
- Redirecciones de rutas antiguas (`/menu`, `/nosotros`, `/galeria`, etc.).

**Archivos principales**

- `client/src/pages/HomePage.tsx`, `EatPage.tsx`, `DrinkPage.tsx`, `AboutPage.tsx`, `GalleryPage.tsx`, `ReservationsPage.tsx`, `ContactPage.tsx`, `CareersPage.tsx`, `OrderPage.tsx`, `NotFoundPage.tsx`
- `client/src/components/layout/*`, `client/src/components/menu/ProductCard.tsx`, `client/src/components/cart/CartDrawer.tsx`
- `client/src/App.tsx`, `client/src/lib/{types,site,format}.ts`, `client/src/context/{SettingsContext,CartContext}.tsx`

## Fase 5 — Backend y datos

**Hecho**

- Migración `002_mezzanine.sql` con `kind`, `menu_type`, `ingredients`, `origin`, `is_demo`, categoría de galería y tabla de empleos.
- Seed nuevo: 8 categorías, 76 productos (43 de comida: 22 lunch + 21 dinner; 10 cócteles, 9 cervezas, 14 vinos), 8 imágenes, 1 puesto.
- API pública con filtros por menú, campos nuevos, galería por categoría y empleos.
- CRUD administrativo de galería y empleos.
- Ajustes nuevos y validaciones (URLs, email opcional, WhatsApp opcional, `demo_mode`).
- Pedidos demo: sin WhatsApp, `isDemo`, bloqueo de productos sin precio.
- Reservas demo: `isDemo` y email del cliente en el panel.

**Archivos**

- `server/src/db/migrations/002_mezzanine.sql`
- `server/src/db/seed.ts`
- `server/src/config/restaurant.ts`
- `server/src/modules/{catalog,admin-catalog,admin-settings,admin-content,orders,reservations,settings.service}.ts`
- `server/src/app.ts`

## Fase 6 — Dashboard

**Hecho**

- Rebranding del panel a Mezzanine, con logo original.
- Nuevas entradas de navegación: Galería y Empleos.
- CRUD de galería (`AdminGalleryPage`) y de empleos (`AdminCareersPage`).
- Productos: tipo de menú, ingredientes/varietal, origen, precio pendiente y marca demo.
- Categorías: tipo comida/bebida.
- Ajustes: redes, sitio oficial, nota de horarios, textos de páginas y aviso demo.
- Pedidos/reservas: email del cliente, `isDemo`, contacto por teléfono en lugar de WhatsApp.

**Archivos**

- `client/src/components/admin/AdminLayout.tsx`
- `client/src/pages/admin/{AdminGalleryPage,AdminCareersPage,AdminProductsPage,AdminCategoriesPage,AdminSettingsPage,AdminOrdersPage,AdminReservationsPage,AdminCustomersPage,AdminLoginPage}.tsx`
- `client/src/App.tsx`

## Fase 7 — Calidad

**Pruebas ejecutadas**

- `npm --prefix server run build` ✅
- `npm --prefix client run build` ✅
- `npm --prefix client run lint` ✅ (solo warnings heredados de patrones de efectos)
- Migración y seed contra MariaDB 3307 ✅
- API pública: settings, categorías, productos por menú, galería, empleos ✅
- Login admin y endpoints protegidos ✅
- Pedido demo con plato: 201, `isDemo=true`, `whatsappUrl=null` ✅
- Pedido con bebida sin precio: 400 con detalle ✅
- Reserva demo en fecha abierta: 201 ✅
- Render de 11 rutas públicas con Chrome headless ✅
- QA de layout desktop 1440 y móvil 390: sin overflow, sin imágenes rotas, sin excepciones ✅
- Render de 9 rutas admin autenticadas: sin overflow ni errores ✅

**Limitaciones conocidas**

- `npm --prefix server run lint` ✅ con `server/eslint.config.mjs`.
- No hay navegador visual integrado en el agente; la QA se hizo con Chrome headless (DOM, métricas y capturas), no con inspección visual humana.
- Las fotos de Instagram y las ilustraciones son material de demostración; confirmar permisos y créditos antes de publicar.

## Fase 8 — Documentación

**Hecho**

- `README.md` reescrito para la propuesta Mezzanine.
- `docs/arquitectura.md` actualizado con modelo de datos, endpoints, demo y ruta a i18n.
- `docs/diseno.md` con sistema visual y reglas del logo.
- `docs/datos-pendientes.md` con el inventario completo de datos por confirmar.
- Este archivo (`docs/fases.md`).

## Fase 9 — Menú real 2026 e ilustraciones

**Hecho**

- Menú de comida real: **22 platos de lunch** y **21 de dinner**, con nombres, descripciones y precios exactos del sitio oficial.
- Extras y notas al pie conservados: panko shrimp, Nueske's bacon, chili-lime fries, a la mode, aviso de alimentos crudos, precio con descuento en efectivo y late night menu.
- Bebidas reales: 10 cócteles, 9 cervezas/sidras y 14 vinos, sin precios porque el sitio oficial no los publica. Se muestran como “At the bar” / “Ask your server”.
- Corregidas cuatro erratas del sitio: New Zealand, Riesling, Monterey y Castilla.
- Horario oficial tomado del Instagram: cerrado martes y miércoles; jueves a lunes, 12–8pm. La temporada 2026 terminó el 31 de octubre.
- 51 ilustraciones SVG propias para platos y bebidas, más 8 para categorías, en `client/public/menu/`; algunos platos usan fotos reales de Instagram en `client/public/photos/`.
- El carrito demo ahora usa los platos con precio; el servidor bloquea las bebidas sin precio.
- `SmartImage` corregido para que las miniaturas no se estiren ni desborden en móvil.
- El panel acepta rutas relativas como `/menu/ceviche.svg`.

**Datos y pruebas**

- Seed ejecutado contra MariaDB 3307: 8 categorías y 76 productos (43 comida + 33 bebida).
- Pedidos y reservas existentes conservados tras el seed.
- Pedido demo con plato: 201, `isDemo=true`, `whatsappUrl=null`.
- Pedido con bebida sin precio: 400.
- Carrito UI: agregar plato, abrir drawer y llegar a `/order` ✅.
- QA de 9 páginas públicas en 7 anchos (320–1440 px): sin desbordamiento, imágenes rotas ni excepciones.
- Admin verificado con 76 productos y rutas de imagen relativas.

## Fase 10 — Demo estática en GitHub Pages

**Hecho**

- Repositorio renombrado a `Arowarlin/mezzanine`.
- `main` actualizado con el proyecto completo; el estado original queda en el tag `casa-veranda-reference`.
- Modo estático `VITE_STATIC_DEMO=true` con `HashRouter` y base `/mezzanine/`.
- API simulada en el navegador con `client/src/data/static-demo.json`.
- Reservas y pedidos demo funcionan sin backend; el panel admin redirige al inicio.
- Workflow `.github/workflows/deploy-pages.yml` para compilar y publicar en GitHub Pages.
- URL pública: <https://arowarlin.github.io/mezzanine/>

**Pruebas**

- Build normal y build `pages` ✅.
- QA de la build estática en servidor local: rutas, imágenes, carrito, pedido y reserva ✅.
- Sin desbordamiento ni imágenes rotas en desktop y móvil.
- La API real también se verificó con pedido y reserva desde la UI.

## Pendiente antes de publicar

1. Aprobación del restaurante y de todos los datos marcados como pendientes.
2. Horarios definitivos.
3. Precios de bebidas, alérgenos y vigencia de la carta.
4. Correo/WhatsApp y proceso real de reservas y pedidos.
5. Fotografía oficial autorizada.
6. Dominio, analítica, privacidad y aviso legal.
7. Autorización expresa para publicar; hoy todo es local y `noindex`.
