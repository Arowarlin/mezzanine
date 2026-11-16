import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { GalleryImage } from '../lib/types'
import { SmartImage } from '../components/ui/SmartImage'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'space', label: 'The room' },
  { value: 'food', label: 'Food' },
  { value: 'drinks', label: 'Drinks' },
]

export function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
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

  const visible = useMemo(
    () => (filter === 'all' ? images : images.filter((image) => image.category === filter)),
    [images, filter],
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null)
      if (event.key === 'ArrowRight') setOpenIndex((current) => (current === null ? null : (current + 1) % visible.length))
      if (event.key === 'ArrowLeft')
        setOpenIndex((current) => (current === null ? null : (current - 1 + visible.length) % visible.length))
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [openIndex, visible.length])

  useEffect(() => {
    setOpenIndex(null)
  }, [filter])

  const activeImage = openIndex === null ? null : visible[openIndex] ?? null

  return (
    <>
      <section className="bg-ink pb-14 pt-36 text-cream sm:pb-16 sm:pt-44">
        <div className="container-page">
          <p className="eyebrow">Gallery</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            A look <em className="text-gold">around</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65">
            The room, the bar, the plates, and the light. Photography in this proposal is illustrative and will be
            replaced with authorized Mezzanine images.
          </p>
        </div>
      </section>

      <section className="container-page py-12 lg:py-16">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full border px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] transition-colors ${
                filter === item.value
                  ? 'border-ink bg-ink text-cream'
                  : 'border-line bg-white/50 text-ink/55 hover:border-ink/30 hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto text-[0.64rem] uppercase tracking-[0.14em] text-ink/35">
            {visible.length} image{visible.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <PageLoader label="Loading the gallery" />
        ) : error ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-clay/30 bg-clay/5 p-6 text-center text-sm text-clay">
            {error}
          </div>
        ) : visible.length === 0 ? (
          <p className="mt-16 text-center text-sm text-ink/50">No images in this category yet.</p>
        ) : (
          <div className="mt-8 columns-2 gap-4 lg:columns-3">
            {visible.map((image, index) => (
              <Reveal key={image.id} className="mb-4 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="group relative block w-full overflow-hidden rounded-2xl text-left"
                >
                  <SmartImage
                    src={image.url}
                    alt={image.title ?? 'Mezzanine'}
                    className="w-full"
                    imgClassName={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      index % 3 === 1 ? 'aspect-[4/5]' : index % 3 === 2 ? 'aspect-square' : 'aspect-[4/3]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <p className="absolute bottom-4 left-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {image.title}
                  </p>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        <p className="mt-10 text-[0.62rem] uppercase tracking-[0.16em] text-ink/30">
          Illustrative photography · not the restaurant&apos;s copyrighted images
        </p>
      </section>

      {activeImage ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 text-cream">
            <p className="text-[0.66rem] uppercase tracking-[0.18em] text-cream/55">
              {openIndex! + 1} / {visible.length} · {activeImage.title}
            </p>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream hover:border-cream/50"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-10">
            <button
              type="button"
              onClick={() =>
                setOpenIndex((current) => (current === null ? null : (current - 1 + visible.length) % visible.length))
              }
              className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-ink/60 text-cream hover:border-cream/50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <img
              src={activeImage.url}
              alt={activeImage.title ?? 'Mezzanine'}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setOpenIndex((current) => (current === null ? null : (current + 1) % visible.length))}
              className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 bg-ink/60 text-cream hover:border-cream/50"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
