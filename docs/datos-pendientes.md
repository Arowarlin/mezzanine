# Datos pendientes de confirmación — Mezzanine

Este documento separa lo **verificado** de lo que sigue **pendiente de aprobación** por el restaurante. La regla del proyecto es simple: si un dato no se pudo verificar, la interfaz lo marca como pendiente y no se presenta como actual.

## 1. Estado de los datos

| Dato | Estado | Fuente / nota |
| --- | --- | --- |
| Nombre del restaurante | Verificado | Sitio oficial: Mezzanine |
| Dirección | Verificado | 7821 Horseshoe Bay Road, Egg Harbor, WI 54209 |
| Teléfono | Verificado | 920-786-7698 |
| Instagram | Verificado | `@mezzaninerooftop` |
| Facebook | Verificado | `Facebook.com/MezzEggHarbor` |
| Sitio oficial | Verificado | <https://www.mezzaninerooftop.com/> |
| Correo público | **No disponible** | No se encontró un correo oficial; el sitio oculta el campo en vez de inventarlo |
| WhatsApp público | **No disponible** | El teléfono publicado es fijo; no se usa WhatsApp en la demo |
| Horarios | **Pendiente / contradictorio** | El footer oficial dice “Closed Tuesday & Wednesday”; la portada dice “7 days a week, 11am–9pm” |
| Logo | Verificado | Se usa el archivo original del sitio oficial, sin redibujar; las variantes de transparencia y texto blanco se generan desde el original |
| Fotografías | **Reales (Instagram)** | 10 fotos de @mezzaninerooftop (junio–octubre 2026) en `client/public/photos/`; los platos sin foto usan ilustraciones propias |

## 2. Menú de comida (lunch / dinner)

**Verificado.** Nombres, descripciones y precios se copiaron de los menús publicados en el sitio oficial (imágenes `Mezzanine_Lunch_2026` y `Mezzanine_Dinner_2026` en `/lunch` y `/dinner`). La fuente de datos es `server/src/db/food-menu.ts`.

- Lunch: 22 opciones (Appetizers, Lunch, Soup & Salads, Desserts).
- Dinner: 21 opciones (Appetizers, Dinner, Desserts).
- Los extras se conservan en la descripción: "add 5 panko crusted shrimp 8", "add nueske's bacon 2.5", "sub chili-lime fries w/ ancho-garlic aioli for $2", "a la mode w/ cinnamon ice cream 2.5".
- El asterisco (\*) del nombre remite al aviso de alimentos crudos o poco cocidos, que se muestra al pie del menú junto con "Menu prices reflect discounted cash payment price" y "Late night menu available after 9pm".
- La sopa no tiene nombre en el menú (es la sopa del día): se publica como *Soup (Cup)* $6 y *Soup (Bowl)* $9.
- Las imágenes de los platos son **ilustraciones propias** (`client/public/menu/*.svg`, generadas con `python scripts/make_menu_art.py`), no fotos. Se reemplazan desde el panel admin o sustituyendo el archivo con el mismo nombre.

Pendiente: alérgenos, el contenido exacto del late night menu y confirmar que los precios siguen vigentes cuando cambie la temporada.

## 3. Bebidas

**Verificado** en `/cocktails`, `/wine` y `/beer` del sitio oficial (fuente de datos: `server/src/db/drink-menu.ts`).

- 10 cócteles con sus ingredientes, 9 cervezas o sidras con estilo, cervecería y origen, y 14 vinos con varietal y origen.
- **El sitio oficial no publica precios de bebidas.** Se eliminaron los precios de muestra que había antes: las bebidas se muestran sin precio ("At the bar" / "Ask your server") y no se pueden añadir al pedido demo.
- Erratas del sitio oficial corregidas: "ew zealand" → New Zealand, "reisling" → Riesling, "monterray" → Monterey, "castillo" → Castilla.
- Las imágenes de bebidas también son ilustraciones propias.

Pendiente: precios, precio por copa o por botella, y formato de la cerveza (la carta oficial dice "Packaged").

## 4. Empleo

- Verificado: el sitio oficial muestra **“Now hiring all positions!”**.
- Pendiente: puestos concretos, tipo de jornada, salario, beneficios y proceso de solicitud.
- La página `/careers` publica un único puesto genérico (“All positions”) y aclara que debe confirmarse. No se inventaron vacantes.

## 5. Reservas y pedidos

- Ambos flujos funcionan contra la base local, pero son **demostraciones**: no envían correo, SMS, WhatsApp ni notificaciones.
- La disponibilidad de reservas es simulada con `open_time`, `close_time`, `slot_minutes`, `seats_per_slot` y `closed_days`.
- Los pedidos son **solo para recoger** y usan los platos con precio publicado. Los productos sin precio (bebidas) se bloquean en el servidor.
- No hay pagos, propinas, impuestos ni integración con cocina.

## 6. Contenido editorial

- Los textos de portada, About y Careers son propuestas de redacción basadas en datos verificados; el restaurante debe aprobarlos.
- No se inventaron historias de propietarios, premios, años de operación ni datos corporativos.
- Las fotografías vienen del Instagram oficial @mezzaninerooftop (ver sección 8). Hay que confirmar con el restaurante que se pueden usar en la web y, si alguna es de un fotógrafo externo, darle crédito.

## 7. Qué falta antes de una publicación real

1. Confirmar horarios y días de cierre.
2. Confirmar alérgenos y vigencia de precios de comida.
3. Obtener precios y formatos de bebidas (no están publicados).
4. Confirmar correo, WhatsApp y proceso real de reservas/pedidos.
5. Confirmar el permiso de uso de las fotos de Instagram y conseguir más fotos de platos y del interior.
6. Confirmar por escrito la autorización de uso del logo original y del material fotográfico.
7. Confirmar vacantes y proceso de aplicación.
8. Definir dominio, analítica, aviso de privacidad y cumplimiento legal.
9. Autorizar expresamente la publicación (hoy el sitio está en `noindex` y es solo local).

## 8. Fotos de Instagram (@mezzaninerooftop)

Descargadas el 16-nov-2026 sin iniciar sesión, por lo que solo eran accesibles las 12 publicaciones más recientes. Se optimizaron a 1800 px y 800 px (`-800`), en JPEG.

| Archivo | Publicación | Uso en la web |
| --- | --- | --- |
| `venue-sunset-bay` | 2-jul-2026 | Hero de Home, Reservations y login admin; galería |
| `venue-rooftop-deck` | 3-sep-2026 | Sección "golden hour" de Home, Careers, Reservations; galería |
| `venue-fall-table` | 4-oct-2026 | Hero de About; galería |
| `venue-entrance` | 22-jun-2026 | About, Careers; galería |
| `food-baja-ahi-tuna` | 21-jun-2026 | Plato Baja Ahi Tuna, categoría Dinner, hero de Eat; galería |
| `food-fresh-mussels` | 31-ago-2026 | Plato Fresh Mussels, tarjeta Eat de Home; galería |
| `food-whitefish-ceviche` | 13-sep-2026 | Plato Whitefish Ceviche, categoría Appetizers; galería |
| `drinks-sunset-cocktails` | 27-jun-2026 | Hero de Drink, categoría Cocktails, tarjeta Drink de Home; galería |
| `drinks-citrus-cocktail` | 4-sep-2026 | About; galería |
| `drinks-basil-cocktail` | 19-jul-2026 | Careers; galería |

No se usaron:
- El retrato de dos empleadas (20-jun-2026): son personas identificables y se necesita su permiso.
- La foto de los shots con banderas (3-jul-2026): solo estaba disponible a 640 px.

Pendiente:
- Confirmar qué cóctel aparece en cada foto, para asignarla a su bebida en la carta.
- Iniciar sesión en Instagram para revisar las publicaciones más antiguas.

### Fotos de stock provisionales

Los 48 platos y bebidas sin foto propia usan fotos genéricas de Unsplash (licencia gratuita de uso comercial), guardadas en `client/public/photos/menu/`. La lista completa está en `docs/creditos-fotos.md`. No son los platos reales: hay que sustituirlas por fotos propias del restaurante.
