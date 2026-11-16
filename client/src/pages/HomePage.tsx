import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Phone, Quote, Star } from 'lucide-react'
import { api } from '../lib/api'
import type { GalleryImage, Product } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'
import { TESTIMONIALS, VALUES } from '../lib/site'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SmartImage } from '../components/ui/SmartImage'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=85'

export function HomePage() {
  const { settings, currency, whatsapp } = useSettings()
  const [featured, setFeatured] = useState<Product[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])

  useEffect(() => {
    let active = true
    Promise.all([
      api<{ products: Product[] }>('/api/public/products?featured=true'),
      api<{ images: GalleryImage[] }>('/api/public/gallery'),
    ])
      .then(([products, images]) => {
        if (!active) return
        setFeatured(products.products.slice(0, 6))
        setGallery(images.images.slice(0, 4))
      })
      .catch(() => {
        if (!active) return
        setFeatured([])
        setGallery([])
      })
    return () => {
      active = false
    }
  }, [])

  const phone = settings?.phone ?? '+1 809 555 0142'
  const address = settings?.address ?? 'Calle Gustavo Mejía Ricart 45, Piantini'

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-cream">
        <SmartImage
          src={HERO_IMAGE}
          alt="Mesa servida en Casa Veranda"
          className="absolute inset-0 h-full w-full"
          imgClassName="hero-zoom h-full w-full object-cover opacity-80"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

        <div className="container-page relative z-10 pb-16 pt-40 sm:pb-20">
          <div className="max-w-3xl">
            <p className="eyebrow animate-fade-in">Santo Domingo · Cocina de autor</p>
            <h1 className="mt-5 text-balance text-[3.3rem] leading-[0.95] sm:text-7xl lg:text-[5.6rem]">
              El Caribe,
              <br />
              <em className="text-gold">servido sin prisa</em>.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
              Producto local, fuego de leña y una terraza que huele a mar. Cocina caribeña
              contemporánea en el corazón de Piantini.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/menu" className="btn-gold">
                Explorar el menú
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/reservaciones" className="btn-ghost text-cream">
                Reservar una mesa
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 border-t border-cream/15 pt-6 text-xs text-cream/65 sm:grid-cols-3">
            <p className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-gold" />
              Martes a domingo · 12:00 – 23:00
            </p>
            <p className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-gold" />
              {address}
            </p>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 hover:text-cream">
              <Phone className="h-4 w-4 text-gold" />
              {phone}
            </a>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="container-page py-20 sm:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Selección de la casa"
              title={
                <>
                  Platos que no se van
                  <br />
                  <em className="text-moss">de la carta</em>
                </>
              }
              description="Lo que más sale de la cocina, explicado sin adornos. Si es tu primera vez, empieza por aquí."
            />
            <Link
              to="/menu"
              className="link-underline mb-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-forest"
            >
              Ver menú completo
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, index) => (
            <Reveal key={product.id} delay={index * 70}>
              <Link
                to="/menu"
                className="group block overflow-hidden rounded-2xl border border-line/60 bg-white/60 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl leading-tight">{product.name}</h3>
                    <span className="whitespace-nowrap text-sm font-bold text-forest">
                      {formatMoney(product.priceCents, currency)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/55">
                    {product.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-gold">
                    {product.categoryName}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HISTORIA */}
      <section className="bg-sand/45 py-20 sm:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="overflow-hidden rounded-[2rem]">
              <SmartImage
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80"
                alt="Interior de Casa Veranda"
                className="aspect-[4/5] w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-56 overflow-hidden rounded-2xl border-8 border-sand/45 shadow-soft sm:block lg:-right-10">
              <SmartImage
                src="https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=600&q=80"
                alt="Plato de la casa"
                className="aspect-square w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <SectionHeading
              eyebrow="La casa"
              title={
                <>
                  Una terraza,
                  <br />
                  <em className="text-moss">dos generaciones</em>
                </>
              }
              description="Casa Veranda nació de una mesa familiar en Villa Mella y del gusto por cocinar lo que el día trae. Hoy ocupamos una casa de los años cincuenta en Piantini: mismo fuego, mismo sofrito, otra escala."
            />
            <div className="mt-8 space-y-5">
              {VALUES.map((value) => (
                <div key={value.title} className="border-l-2 border-gold/60 pl-5">
                  <h3 className="text-xl">{value.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60">{value.text}</p>
                </div>
              ))}
            </div>
            <Link to="/nosotros" className="btn-primary mt-9">
              Conocer la historia
            </Link>
          </Reveal>
        </div>
      </section>

      {/* PROMOCIÓN */}
      <section className="relative overflow-hidden bg-forest py-16 text-cream sm:py-20">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <div className="container-page relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow">Solo martes</p>
            <h2 className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">
              Martes de brasa: <em className="text-gold">2×1</em> en entradas, de 6 a 9 p.m.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/65">
              Válido en sala, con cualquier plato fuerte. No acumulable con otras promociones.
            </p>
          </div>
          <Link to="/reservaciones" className="btn-gold shrink-0">
            Reservar para el martes
          </Link>
        </div>
      </section>

      {/* GALERÍA */}
      {gallery.length > 0 ? (
        <section className="container-page py-20 sm:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="La veranda"
                title={
                  <>
                    Un vistazo
                    <br />
                    <em className="text-moss">antes de venir</em>
                  </>
                }
              />
              <Link
                to="/galeria"
                className="link-underline mb-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-forest"
              >
                Ver galería
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {gallery.map((image, index) => (
              <Reveal key={image.id} delay={index * 60}>
                <div className="group aspect-[3/4] overflow-hidden rounded-xl">
                  <SmartImage
                    src={image.url}
                    alt={image.title ?? 'Casa Veranda'}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* TESTIMONIOS */}
      <section className="bg-ink py-20 text-cream sm:py-28">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="La mesa opina"
              title={
                <>
                  Lo que se dice
                  <br />
                  <em className="text-gold">al salir</em>
                </>
              }
              align="center"
              light
            />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <Reveal key={testimonial.author} delay={index * 90}>
                <figure className="flex h-full flex-col rounded-2xl border border-cream/10 bg-cream/[0.04] p-7">
                  <Quote className="h-7 w-7 text-gold/70" />
                  <blockquote className="mt-5 flex-1 text-[0.95rem] leading-relaxed text-cream/75">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-6 border-t border-cream/10 pt-4">
                    <div className="flex gap-0.5 text-gold">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-semibold">{testimonial.author}</p>
                    <p className="text-xs text-cream/45">{testimonial.detail}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden py-24 text-cream sm:py-32">
        <SmartImage
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80"
          alt="Terraza de Casa Veranda"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/72" />
        <div className="container-page relative text-center">
          <Reveal>
            <p className="eyebrow">Tu mesa</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-4xl leading-tight sm:text-6xl">
              Hay una mesa en la terraza <em className="text-gold">esperándote</em>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-cream/65">
              Reserva en menos de un minuto o pide a domicilio. También puedes escribirnos por WhatsApp.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/reservaciones" className="btn-gold">
                Reservar ahora
              </Link>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost text-cream"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
