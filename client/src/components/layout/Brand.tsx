import { Link } from 'react-router-dom'

type BrandProps = {
  light?: boolean
  compact?: boolean
}

export function Brand({ light = false, compact = false }: BrandProps) {
  return (
    <Link to="/" className="group inline-flex items-baseline gap-2" aria-label="Casa Veranda, inicio">
      <span
        className={`font-display text-[1.6rem] leading-none tracking-tight transition-colors ${
          light ? 'text-cream' : 'text-ink'
        }`}
      >
        Casa Veranda
      </span>
      {!compact ? (
        <span className="h-1.5 w-1.5 rounded-full bg-gold transition-transform duration-500 group-hover:scale-150" />
      ) : null}
    </Link>
  )
}
