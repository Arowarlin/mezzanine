import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Resuelve la imagen de un plato o bebida al sembrar la base de datos.
 *
 * Orden de prioridad:
 *  1. Foto real asignada a mano (Instagram @mezzaninerooftop), si se pasa.
 *  2. Imagen generada guardada en client/public/photos/menu/<nombre>.{jpg,jpeg,png,webp}.
 *  3. Ilustración SVG propia en client/public/menu/<nombre>.svg.
 *
 * Para añadir una imagen nueva basta con guardarla con el nombre que indica
 * docs/prompts-imagenes.md y volver a ejecutar `npm run db:seed`.
 */

const PUBLIC_DIR_CANDIDATES = [
  path.resolve(__dirname, '../../../client/public'), // tsx src/db/seed.ts
  path.resolve(__dirname, '../../../../client/public'), // node dist/db/seed.js
  path.resolve(process.cwd(), '../client/public'),
  path.resolve(process.cwd(), 'client/public'),
];

const publicDir = PUBLIC_DIR_CANDIDATES.find((dir) => existsSync(dir));
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export function menuImage(name: string, realPhoto?: string): string {
  if (realPhoto) return realPhoto;
  if (publicDir) {
    for (const ext of EXTENSIONS) {
      if (existsSync(path.join(publicDir, 'photos', 'menu', `${name}.${ext}`))) {
        return `/photos/menu/${name}.${ext}`;
      }
    }
  }
  return `/menu/${name}.svg`;
}
