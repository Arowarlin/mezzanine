const BASE = import.meta.env.BASE_URL || '/'

/**
 * Resuelve una ruta interna contra el base path de Vite.
 * En GitHub Pages el sitio vive en /mezzanine/, así que /photos/x.jpg
 * debe convertirse en /mezzanine/photos/x.jpg.
 */
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  return `${BASE}${path.replace(/^\/+/, '')}`
}
