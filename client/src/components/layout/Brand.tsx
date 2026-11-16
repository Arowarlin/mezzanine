import { Link } from 'react-router-dom'

type BrandProps = {
  light?: boolean
  compact?: boolean
}

/**
 * Logo original de Mezzanine (archivo oficial proporcionado).
 * No se redibuja, recolorea ni recorta: solo se ajusta su tamaño.
 * - light: versión blanca horizontal para fondos oscuros.
 * - dark: versión a color (lockup con icono) para fondos claros.
 */
const LOGOS = {
  light: { src: '/brand/mezzanine-logo-white.png', width: 750, height: 204 },
  dark: { src: '/brand/mezzanine-logo-color.jpg', width: 750, height: 422 },
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
        className={`w-auto object-contain ${compact ? 'h-8 sm:h-9' : 'h-11 sm:h-12'}`}
        decoding="async"
      />
    </Link>
  )
}
