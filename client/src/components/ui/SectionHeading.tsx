import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  light = false,
  className = '',
}: SectionHeadingProps) {
  return (
    <div
      className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}
    >
      {eyebrow ? <p className={`eyebrow mb-4 ${light ? 'text-gold' : ''}`}>{eyebrow}</p> : null}
      <h2
        className={`text-balance text-4xl leading-[1.05] sm:text-5xl ${
          light ? 'text-cream' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 text-base leading-relaxed ${light ? 'text-cream/70' : 'text-ink/65'}`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
