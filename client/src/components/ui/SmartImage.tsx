import { useEffect, useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { assetUrl } from '../../lib/assets'

type SmartImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  eager?: boolean
}

export function SmartImage({ src, alt, className = '', imgClassName = '', eager = false }: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const resolved = assetUrl(src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!resolved || failed) {
    return (
      <div className={`flex items-center justify-center bg-sand text-forest/40 ${className}`}>
        <UtensilsCrossed className="h-8 w-8" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }

  // className va en el contenedor (tamaño, forma, posición); la imagen siempre lo
  // llena. Así un `w-full` de la imagen nunca anula el tamaño pedido.
  return (
    <span className={`block ${className}`}>
      <img
        src={resolved}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={`block h-full w-full ${imgClassName}`}
      />
    </span>
  )
}
