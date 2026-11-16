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

## FASE 2 — Diseño UI/UX · en curso

## FASE 3 — Frontend

## FASE 4 — Backend

## FASE 5 — Base de datos

## FASE 6 — Pedidos y reservas

## FASE 7 — Panel administrativo

## FASE 8 — Seguridad y pruebas

## FASE 9 — Optimización y documentación
