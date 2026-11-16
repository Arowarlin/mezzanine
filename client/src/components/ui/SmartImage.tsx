import { useEffect, useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

type SmartImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  imgClassName?: string
  eager?: boolean
}

export function SmartImage({ src, alt, className = '', imgClassName = '', eager = false }: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-sand text-forest/40 ${className}`}>
        <UtensilsCrossed className="h-8 w-8" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`}
    />
  )
}
