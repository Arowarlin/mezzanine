import { Link } from 'react-router-dom'
import { ArrowRight, Info, MapPin } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { HOUSE_NOTES } from '../lib/site'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SmartImage } from '../components/ui/SmartImage'

export function AboutPage() {
  const { settings } = useSettings()
  const address = settings?.address ?? '7821 Horseshoe Bay Road'
  const city = settings?.city ?? 'Egg Harbor'

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-20 pt-40 text-cream sm:pb-24 sm:pt-48">
        <SmartImage
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1800&q=80"
          alt="A table set for dinner"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-35"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/45" />
        <div className="container-page relative">
          <p className="eyebrow">About</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            The room above <em className="text-gold">the harbor</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/70">
            Mezzanine is a rooftop bar and kitchen in Egg Harbor, Wisconsin — a place for a long lunch, a sunset
            cocktail, and dinner with the sky overhead.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="The experience"
            title={
              <>
                Door County, <em className="text-clay">upstairs</em>.
              </>
            }
            description={
              settings?.about_intro ??
              'Mezzanine is the rooftop bar and kitchen at 7821 Horseshoe Bay Road in Egg Harbor, Wisconsin.'
            }
          />
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/60">
            <p>
              Egg Harbor sits on the western shore of the Door County peninsula, between the bayside villages and the
              lake. The restaurant&apos;s published address places Mezzanine on Horseshoe Bay Road, a short drive from
              the village center.
            </p>
            <p>
              The bar is the center of the experience: house infusions, fresh citrus, and garden herbs in the
              cocktails, Wisconsin and Midwest breweries on the beer list, and a compact wine list that travels from
              Door County rosé to Mendoza malbec.
            </p>
            <p>
              The kitchen serves lunch and dinner. This proposal does not invent dishes, recipes, or prices: item
              names come from recent public menus, and anything unconfirmed is labeled as pending.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[1.75rem] sm:mt-10">
              <SmartImage
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                alt="Dining room"
                className="aspect-[3/4] w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[1.75rem]">
              <SmartImage
                src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80"
                alt="Behind the bar"
                className="aspect-[3/4] w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            <p className="col-span-full text-[0.62rem] uppercase tracking-[0.16em] text-ink/35">
              Illustrative photography for this proposal
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-sand/45 py-20 lg:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="What defines it" title="Three things to know" align="center" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {HOUSE_NOTES.map((note, index) => (
              <Reveal key={note.title} delay={index * 80}>
                <article className="flex h-full flex-col rounded-2xl border border-line/70 bg-cream/70 p-6">
                  <span className="font-display text-4xl text-gold">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 font-display text-2xl leading-tight">{note.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{note.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 lg:py-24">
        <div className="grid gap-8 rounded-[2rem] bg-ink p-8 text-cream sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow">Find us</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              {address}, {city}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">
              Wisconsin 54209, United States. Call the restaurant for current hours and availability — the official
              site currently shows two different schedules.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-gold">
                Contact &amp; directions
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/reservations" className="btn border border-cream/30 text-cream hover:border-cream/70">
                Reserve a table
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-cream/15 bg-cream/5 p-6 text-sm">
            <p className="flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gold">
              <MapPin className="h-4 w-4" />
              Egg Harbor, WI
            </p>
            <p className="mt-3 leading-relaxed text-cream/60">
              A rooftop kitchen and bar on Horseshoe Bay Road, in the heart of Door County.
            </p>
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-cream/35">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {settings?.demo_notice ??
                'Unofficial redesign proposal — local demo only. No real reservations, orders, payments, or emails are processed.'}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
