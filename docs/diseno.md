# Sistema de diseño — Mezzanine (propuesta local)

## 1. Dirección creativa

La propuesta parte de la identidad real del restaurante: un rooftop bar en Egg Harbor, Door County, con el puerto y el atardecer como contexto. El objetivo es editorial y cálido, no un template genérico de lujo.

Principios:

- **Fotografía protagonista** en portada, secciones de menú y galería.
- **Tipografía editorial** con una serif de alto contraste para titulares y una sans geométrica para interfaz.
- **Paleta de puerto y atardecer**: verde profundo, crema, arena y un acento cobrizo.
- **Composición asimétrica** y mucho aire; las tarjetas se reservan para elementos accionables (bebidas, empleos, formularios).
- **Movimiento sutil**: aparición al hacer scroll, zoom lento en el hero y transiciones de 300–700 ms.
- **Accesibilidad**: contraste alto, foco visible, `prefers-reduced-motion`, textos alternativos y navegación por teclado en la galería.

## 2. Logo

Reglas obligatorias:

- Se usa el **archivo original** de Mezzanine, con las tres ondas verde agua, la tipografía original y el texto **DOOR COUNTY**.
- **No** se redibuja, recolorea, recorta, deforma ni sustituye por un icono o una versión generada.
- Solo se ajusta el tamaño y la ubicación de forma responsive, manteniendo la proporción (`w-auto object-contain`).
- Variante para fondos oscuros: el texto pasa a blanco y las ondas conservan su color original: `client/public/brand/mezzanine-logo-white.png`.
- Variante a color con fondo transparente y bordes suavizados para fondos claros: `client/public/brand/mezzanine-logo-color.png`.
- Recorte de las tres ondas para favicons: `client/public/brand/mezzanine-waves.png`.
- Los favicons se generan desde las ondas, centrados en un lienzo cuadrado transparente.
- El archivo original `client/public/brand/mezzanine-logo-original.png` no se sobrescribe.
- Las variantes se regeneran con `python -m pip install pillow numpy` y `python scripts/make_logo_variants.py`.

## 3. Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `ink` | `#0B1413` | Fondo oscuro principal, texto |
| `harbor` | `#0F1C1B` | Superficies oscuras secundarias |
| `forest` | `#12201F` | Botones primarios, sidebar admin |
| `moss` | `#1E3B3A` | Hover de botones, acentos |
| `teal` | `#24504D` | Apoyo |
| `cream` | `#F5F0E8` | Fondo claro |
| `sand` | `#E4D9C8` | Secciones alternas, chips |
| `gold` | `#C9A35C` | Acento principal, eyebrows |
| `clay` / `ember` | `#C75B39` | Acento cálido, precios pendientes |
| `line` | `#DDD2C0` | Bordes y divisores |

## 4. Tipografía

- **Fraunces** (`--font-display`): titulares, nombres de platos y bebidas. Se usa con itálica para énfasis editorial.
- **Inter Tight** (`--font-sans`): navegación, botones, formularios, párrafos y admin.
- Escala base: 16 px; titulares de 3xl a 7xl según viewport; `tracking-tight` en display.
- Eyebrows: 0.7 rem, mayúsculas, `tracking-[0.3em]`, color dorado.

## 5. Componentes

- `.btn-primary`: fondo `forest`, texto crema, radio completo.
- `.btn-gold`: fondo dorado, texto tinta; CTA de reservas.
- `.btn-ghost`: borde translúcido para fondos claros u oscuros.
- `.field`: input/select/textarea con borde `line`, fondo blanco translúcido y foco dorado.
- `.label`: etiqueta pequeña en mayúsculas.
- `.card`: superficie clara con borde y radio 2xl.
- `.chip`, `.chip-gold`, `.chip-ember`: estados y etiquetas (“Sample”, “Price pending”, “Demo”).
- `.menu-row`: fila editorial de menú con divisor inferior.
- `.admin-table`: tabla administrativa existente, conservada.
- `.reveal`: animación de entrada reutilizada del proyecto original.

## 6. Estructura de páginas

| Ruta | Contenido |
| --- | --- |
| `/` | Hero, experiencia, acceso a Eat/Drink, platos destacados, cócteles destacados, galería, ubicación y CTA |
| `/eat` | Lunch y dinner con pestañas, categorías, imagen ilustrativa por categoría y precios pendientes |
| `/drink` | Cócteles en tarjetas visuales; cerveza y vino en listas; precios de muestra |
| `/about` | Contexto de Egg Harbor/Door County, experiencia rooftop y notas de marca |
| `/gallery` | Filtros por categoría, grid masonry, lightbox con teclado |
| `/reservations` | Formulario demo con fecha, personas, franjas, datos y confirmación |
| `/contact` | Dirección, teléfono, mapa, horarios pendientes, redes y sitio oficial |
| `/careers` | Introducción, cultura, puestos publicados y llamada telefónica |
| `/order` | Carrito demo, solo recogida, solo bebidas con precio de muestra |

## 7. Responsive

- Contenedor máximo 80 rem con padding 20/32/48 px.
- Header fijo de 32 px (aviso demo) + 72/80 px (navegación).
- Navegación completa desde 1024 px; menú superpuesto en móvil.
- Grids: 1 columna en móvil, 2 en tablet, 3–4 en desktop.
- Galería masonry con `columns-2 lg:columns-3`.
- Formularios a 1 columna en móvil y 2 en tablet.
- Probado a 390 px y 1440 px sin desbordamiento horizontal.

## 8. Modo demo

- Franja superior en todas las páginas: “Unofficial redesign proposal · local demo”.
- Avisos contextuales en reservas, pedidos, galería, empleos y contacto.
- Pie de página con la limitación completa.
- `robots.txt` con `Disallow: /` y `<meta name="robots" content="noindex, nofollow">`.
- Los registros creados por la demo llevan `is_demo = 1`.
