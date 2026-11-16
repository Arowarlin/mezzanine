import { Link } from 'react-router-dom'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'

export function NotFoundPage() {
  return (
    <section className="container-page flex min-h-[75vh] flex-col items-center justify-center pb-20 pt-36 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-forest">
        <UtensilsCrossed className="h-7 w-7" />
      </span>
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">
        Esa página no está <em className="text-moss">en la carta</em>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/55">
        Puede que el enlace haya cambiado o que el plato ya no exista. Vuelve al inicio o mira el menú actual.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <Link to="/menu" className="btn-ghost text-forest">
          Ver el menú
        </Link>
      </div>
    </section>
  )
}
