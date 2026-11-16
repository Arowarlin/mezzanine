import { Link } from 'react-router-dom'

type BrandProps = {
  light?: boolean
  compact?: boolean
}

/**
 * Logo original de Mezzanine (archivo oficial proporcionado).
 * No se redibuja, recolorea ni recorta: solo se ajusta su tamaño.
 * - light: versión blanca generada desde el original, para fondos oscuros.
 * - dark: versión a color con fondo transparente, para fondos claros.
 *
 * Las variantes se generan con `python scripts/make_logo_variants.py`.
 */
const LOGOS = {
  light: { src: '/brand/mezzanine-logo-white.png', width: 571, height: 335 },
  dark: { src: '/brand/mezzanine-logo-color.png', width: 571, height: 335 },
}

export function Brand({ light = false, compact = false }: BrandProps) {
  const logo = light ? LOGOS.light : LOGOS.dark

  return (
    <Link to="/" className="inline-flex shrink-0 items-center" aria-label="Mezzanine — home">
      <img
        src={logo.src}
        alt="Mezzanine — Door County"
        width={logo.width}
        height={logo.height}
        className={`w-auto object-contain ${compact ? 'h-14 sm:h-16' : 'h-20'}`}
        decoding="async"
      />
    </Link>
  )
}
