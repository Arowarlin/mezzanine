import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { GalleryImage } from '../lib/types'
import { SmartImage } from '../components/ui/SmartImage'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'

export function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    api<{ images: GalleryImage[] }>('/api/public/gallery')
      .then((data) => {
        if (active) setImages(data.images)
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (openIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null)
      if (event.key === 'ArrowRight') setOpenIndex((index) => (index === null ? null : (index + 1) % images.length))
      if (event.key === 'ArrowLeft')
        setOpenIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length))
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [openIndex, images.length])

  const current = openIndex === null ? null : images[openIndex]

  return (
    <>
      <section className="bg-forest pb-16 pt-36 text-cream sm:pb-20 sm:pt-44">
        <div className="container-page">
          <p className="eyebrow">La veranda</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-7xl">
            La casa, <em className="text-gold">en imágenes</em>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/65 sm:text-base">
            Luz de tarde, brasa encendida y mesas puestas. Esto es lo que vas a encontrar cuando llegues.
          </p>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        {loading ? <PageLoader label="Cargando galería…" /> : null}

        {!loading && error ? (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {images.map((image, index) => (
              <Reveal key={image.id} delay={(index % 3) * 60} className="break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="group relative block w-full overflow-hidden rounded-2xl text-left"
                >
                  <SmartImage
                    src={image.url}
                    alt={image.title ?? `Casa Veranda ${index + 1}`}
                    className={`w-full ${index % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                    imgClassName="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {image.title ? (
                    <span className="absolute bottom-4 left-4 translate-y-2 text-sm font-semibold text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {image.title}
                    </span>
                  ) : null}
                </button>
              </Reveal>
            ))}
          </div>
        ) : null}
      </section>

      {current ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-5 top-5 rounded-full p-3 text-cream/70 transition hover:bg-white/10 hover:text-cream"
            aria-label="Cerrar galería"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => setOpenIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length))}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-cream/70 transition hover:bg-white/10 hover:text-cream sm:left-6"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <figure className="max-h-[85vh] max-w-5xl">
            <SmartImage
              src={current.url}
              alt={current.title ?? 'Casa Veranda'}
              className="max-h-[78vh] w-auto rounded-lg object-contain"
              imgClassName="max-h-[78vh] w-auto object-contain"
              eager
            />
            {current.title ? (
              <figcaption className="mt-4 text-center text-sm text-cream/60">{current.title}</figcaption>
            ) : null}
          </figure>
          <button
            type="button"
            onClick={() => setOpenIndex((index) => (index === null ? null : (index + 1) % images.length))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-cream/70 transition hover:bg-white/10 hover:text-cream sm:right-6"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      ) : null}
    </>
  )
}
