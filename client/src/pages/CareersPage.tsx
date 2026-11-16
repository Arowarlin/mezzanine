import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Info, Phone } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { CareerOpening } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SmartImage } from '../components/ui/SmartImage'

const TYPE_LABELS: Record<CareerOpening['employmentType'], string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  seasonal: 'Seasonal',
}

export function CareersPage() {
  const { settings } = useSettings()
  const [openings, setOpenings] = useState<CareerOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api<{ openings: CareerOpening[] }>('/api/public/careers')
      .then((data) => {
        if (active) setOpenings(data.openings)
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

  const phone = settings?.phone ?? '920-786-7698'

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-cream sm:pb-20 sm:pt-44">
        <SmartImage
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=80"
          alt="The bar"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-30"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/45" />
        <div className="container-page relative">
          <p className="eyebrow">Careers</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Join the <em className="text-gold">rooftop</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65">
            {settings?.careers_intro ??
              'Mezzanine is hiring all positions. Tell us what you do best and we will point you to the right role.'}
          </p>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="The work"
            title={
              <>
                Service with a <em className="text-clay">view</em>.
              </>
            }
            description="A rooftop kitchen and bar means the team works across the bar, the dining room, and the roof. Roles are hands-on, guest-facing, and built around the rhythm of a Door County day."
          />
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/60">
            <p>
              The official site currently carries a simple message: <strong>“Now hiring all positions.”</strong> This
              proposal does not invent specific vacancies, wages, or benefits — the openings listed below reflect that
              published message and are marked for confirmation.
            </p>
            <p>
              If you are interested in a real role, call the restaurant and ask for the hiring manager. This demo does
              not submit applications or contact anyone.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="btn-primary">
              <Phone className="h-4 w-4" />
              Call {phone}
            </a>
            <a href="#openings" className="btn-ghost text-ink/70">
              See openings
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="grid gap-4 sm:grid-cols-2">
            <SmartImage
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
              alt="Dining room"
              className="aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] sm:mt-8"
              imgClassName="h-full w-full object-cover"
            />
            <SmartImage
              src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80"
              alt="Behind the bar"
              className="aspect-[3/4] w-full overflow-hidden rounded-[1.75rem]"
              imgClassName="h-full w-full object-cover"
            />
            <p className="col-span-full text-[0.62rem] uppercase tracking-[0.16em] text-ink/35">
              Illustrative photography for this proposal
            </p>
          </div>
        </Reveal>
      </section>

      <section id="openings" className="scroll-mt-28 bg-sand/45 py-16 lg:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Openings"
              title="Current opportunities"
              description="Roles are published from the demo dashboard and marked pending until the restaurant confirms them."
            />
            <span className="chip chip-gold">Subject to confirmation</span>
          </div>

          {loading ? (
            <PageLoader label="Loading openings" />
          ) : error ? (
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-clay/30 bg-clay/5 p-6 text-center text-sm text-clay">
              {error}
            </div>
          ) : openings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-line/70 bg-cream/60 p-8 text-center text-sm text-ink/55">
              No openings are published right now. Call the restaurant to ask about upcoming roles.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {openings.map((opening, index) => (
                <Reveal key={opening.id} delay={index * 70}>
                  <article className="flex h-full flex-col rounded-2xl border border-line/70 bg-cream/70 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-cream">
                        <BriefcaseBusiness className="h-4 w-4" />
                      </span>
                      <span className="chip">{TYPE_LABELS[opening.employmentType]}</span>
                    </div>
                    <h3 className="mt-4 font-display text-2xl leading-tight">{opening.title}</h3>
                    {opening.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-ink/60">{opening.description}</p>
                    ) : null}
                    <div className="mt-auto pt-5">
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-clay hover:text-ink"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call about this role
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-gold/40 bg-gold/10 p-6 text-sm text-ink/65 sm:flex-row sm:items-center">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong className="font-semibold">Demo only.</strong> This page does not accept applications, store
              résumés, or send anything to Mezzanine. Call the restaurant to apply for a real role.
            </span>
          </p>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="btn-primary shrink-0">
            Call {phone}
          </a>
        </div>
      </section>
    </>
  )
}
