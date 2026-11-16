import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <section className="container-page flex min-h-[80vh] flex-col items-center justify-center pb-20 pt-40 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-forest">
        <Compass className="h-7 w-7" />
      </span>
      <p className="eyebrow mt-6">Error 404</p>
      <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">
        This page is <em className="text-clay">off the menu</em>.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/55">
        The link may have changed, or the page may not exist in this proposal. Head back to the rooftop or browse the
        menus.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
        <Link to="/eat" className="btn-ghost text-ink/70">
          See the menu
        </Link>
      </div>
    </section>
  )
}
