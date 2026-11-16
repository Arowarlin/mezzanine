import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Martini, Phone, UtensilsCrossed } from 'lucide-react'
import { api } from '../lib/api'
import type { GalleryImage, Product } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'
import { HOUSE_NOTES } from '../lib/site'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SmartImage } from '../components/ui/SmartImage'

const HERO_IMAGE = '/photos/venue-sunset-bay.jpg'
const ROOM_IMAGE = '/photos/venue-rooftop-deck.jpg'

export function HomePage() {
  const { settings, currency } = useSettings()
  const [featured, setFeatured] = useState<Product[]>([])
  const [dishes, setDishes] = useState<Product[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])

  useEffect(() => {
    let active = true
    Promise.all([
      api<{ products: Product[] }>('/api/public/products?menu=cocktails&featured=true'),
      api<{ products: Product[] }>('/api/public/products?menu=dinner'),
      api<{ images: GalleryImage[] }>('/api/public/gallery'),
    ])
      .then(([productsData, dinnerData, galleryData]) => {
        if (!active) return
        setFeatured(productsData.products.slice(0, 4))
        const mains = dinnerData.products.filter((product) => product.categorySlug === 'dinner-plates')
        setDishes((mains.length > 0 ? mains : dinnerData.products).slice(0, 4))
        setGallery(galleryData.images.slice(0, 4))
      })
      .catch(() => {
        /* la portada funciona aunque falle la API */
      })
    return () => {
      active = false
    }
  }, [])

  const phone = settings?.phone ?? '920-786-7698'
  const address = settings?.address ?? '7821 Horseshoe Bay Road'
  const city = settings?.city ?? 'Egg Harbor'

  return (
    <>
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-ink pb-14 pt-40 text-cream sm:pb-20">
        <SmartImage
          src={HERO_IMAGE}
          alt="Sunset over Horseshoe Bay from the Mezzanine rooftop"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-55 hero-zoom"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/35" />
        <div className="container-page relative">
          <p className="eyebrow">Egg Harbor, Wisconsin</p>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-[5.2rem]">
            {settings?.hero_title ?? 'A rooftop table above Egg Harbor.'}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/70 sm:text-lg">
            {settings?.hero_subtitle ??
              'Cocktails, wine, and a short kitchen menu — served upstairs, under the sky.'}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/reservations" className="btn-gold">
              Reserve a table
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/eat" className="btn border border-cream/30 text-cream hover:border-cream/70">
              Explore our menu
            </Link>
          </div>

          <div className="mt-14 grid gap-4 border-t border-cream/15 pt-6 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream/60 sm:grid-cols-3">
            <span className="flex items-center gap-2">
              <Martini className="h-4 w-4 text-gold" />
              Rooftop kitchen & bar
            </span>
            <span className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-gold" />
              Lunch & dinner
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              {address}, {city}
            </span>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem]">
            <SmartImage
              src={ROOM_IMAGE}
              alt="The rooftop deck at Mezzanine, overlooking the bay"
              className="aspect-[4/3] w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute bottom-5 left-5 rounded-full bg-ink/80 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cream/80 backdrop-blur">
              Photo · @mezzaninerooftop
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <SectionHeading
            eyebrow="The room upstairs"
            title={
              <>
                A bar built for the <em className="text-clay">golden hour</em>.
              </>
            }
            description={
              settings?.about_intro ??
              'Mezzanine is the rooftop bar and kitchen at 7821 Horseshoe Bay Road in Egg Harbor, Wisconsin.'
            }
          />
          <div className="mt-8 grid gap-5">
            {HOUSE_NOTES.map((note) => (
              <div key={note.title} className="border-l border-gold/50 pl-4">
                <p className="font-display text-xl">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">{note.text}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-ghost mt-8 text-ink/70">
            More about Mezzanine
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <section className="bg-sand/45 py-20 lg:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Two menus"
            title={
              <>
                Eat, then <em className="text-clay">drink</em>.
              </>
            }
            description="Start with lunch or dinner, then stay for a cocktail, a Wisconsin beer, or a glass of wine."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                to: '/eat',
                eyebrow: 'Kitchen',
                title: 'Eat',
                text: 'Lunch and dinner menus, from whitefish ceviche to the Mezzanine burger.',
                image: '/photos/food-fresh-mussels-800.jpg',
              },
              {
                to: '/drink',
                eyebrow: 'Bar',
                title: 'Drink',
                text: 'Handcrafted cocktails, Wisconsin beer and cider, and a short wine list.',
                image: '/photos/drinks-sunset-cocktails-800.jpg',
              },
            ].map((card, index) => (
              <Reveal key={card.to} delay={index * 90}>
                <Link
                  to={card.to}
                  className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[2rem] p-8 text-cream"
                >
                  <SmartImage
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
                  <div className="relative">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-gold">{card.eyebrow}</p>
                    <h3 className="mt-2 font-display text-4xl">{card.title}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream/70">{card.text}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-cream/85">
                      Open menu
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {dishes.length > 0 ? (
        <section className="container-page py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="From the kitchen"
                title={
                  <>
                    Dinner, <em className="text-clay">upstairs</em>.
                  </>
                }
                description="A short look at the dinner menu — Lake Michigan whitefish, seared ahi tuna and plates built for a long evening on the roof."
              />
              <Link to="/eat" className="btn-ghost mt-7 text-ink/70">
                See lunch &amp; dinner
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-x-12 sm:grid-cols-2">
              {dishes.map((dish, index) => (
                <div key={dish.id} className="menu-row">
                  <div className="min-w-0">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-1 font-display text-2xl leading-snug">{dish.name}</p>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-ink/35">
                      {dish.categoryName}
                    </p>
                  </div>
                  {dish.priceCents > 0 ? (
                    <span className="shrink-0 text-sm font-semibold">{formatMoney(dish.priceCents, currency)}</span>
                  ) : (
                    <span className="shrink-0 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink/35">
                      Ask your server
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="container-page py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="From the bar"
              title={
                <>
                  Cocktails worth <em className="text-clay">staying</em> for.
                </>
              }
              description="House infusions, fresh citrus and garden herbs — built to be sipped slowly above the bay."
            />
            <Link to="/drink" className="btn-ghost text-ink/70">
              All drinks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={index * 70}>
                <Link
                  to="/drink"
                  className="group flex h-full flex-col justify-between rounded-2xl border border-line/70 bg-white/60 p-5 transition-colors hover:border-gold/50"
                >
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-gold">Cocktail</p>
                    <h3 className="mt-2 font-display text-2xl leading-tight">{product.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink/55">{product.ingredients}</p>
                  </div>
                  <p className="mt-5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink/40">
                    {product.priceCents > 0 ? formatMoney(product.priceCents, currency) : 'At the bar'}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className="bg-ink py-20 text-cream lg:py-28">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="The gallery"
                title="A look around"
                description="Moments from the rooftop, shared on @mezzaninerooftop."
                light
              />
              <Link to="/gallery" className="btn border border-cream/30 text-cream hover:border-cream/70">
                Open gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {gallery.map((image) => (
                <Link
                  key={image.id}
                  to="/gallery"
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
                >
                  <SmartImage
                    src={image.url}
                    alt={image.title ?? 'Mezzanine'}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-70" />
                  <p className="absolute bottom-3 left-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cream/80">
                    {image.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page py-20 lg:py-28">
        <div className="grid gap-10 rounded-[2rem] border border-line/70 bg-white/55 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Plan a visit</p>
            <h2 className="mt-3 text-4xl leading-[1.02] sm:text-5xl">
              Find us <em className="text-clay">upstairs</em>.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
              {address}, {city}, WI 54209. Closed Tuesday &amp; Wednesday; Thursday–Monday, 12–8pm.
              The 2026 season ended October 31 — call before you drive.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/reservations" className="btn-primary">
                Reserve a table
              </Link>
              <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="btn-ghost text-ink/70">
                <Phone className="h-4 w-4" />
                {phone}
              </a>
            </div>
          </div>
          <div className="grid gap-4 text-sm">
            <div className="flex items-start gap-3 rounded-2xl border border-line/70 bg-cream/60 p-4">
              <MapPin className="mt-0.5 h-4 w-4 text-clay" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-ink/55">
                  {address}
                  <br />
                  {city}, WI 54209
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-line/70 bg-cream/60 p-4">
              <Clock className="mt-0.5 h-4 w-4 text-clay" />
              <div>
                <p className="font-semibold">Hours</p>
                <p className="text-ink/55">
                  Closed Tuesday &amp; Wednesday · Thursday–Monday, 12–8pm.
                  <br />
                  The 2026 season ended October 31; confirm reopening for 2027.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
