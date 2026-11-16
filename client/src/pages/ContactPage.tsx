import { ArrowUpRight, AtSign, Clock, Info, MapPin, Phone, Share2 } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'

const MAP_SRC =
  'https://www.google.com/maps?q=7821%20Horseshoe%20Bay%20Rd%2C%20Egg%20Harbor%2C%20WI%2054209&output=embed'

export function ContactPage() {
  const { settings } = useSettings()
  const phone = settings?.phone ?? '920-786-7698'
  const address = settings?.address ?? '7821 Horseshoe Bay Road'
  const city = settings?.city ?? 'Egg Harbor'
  const instagram = settings?.instagram ?? '@mezzaninerooftop'
  const facebook = settings?.facebook ?? 'https://www.facebook.com/MezzEggHarbor'
  const official = settings?.official_website ?? 'https://www.mezzaninerooftop.com/'

  return (
    <>
      <section className="bg-ink pb-14 pt-36 text-cream sm:pb-16 sm:pt-44">
        <div className="container-page">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Come <em className="text-gold">upstairs</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65">
            Mezzanine is on Horseshoe Bay Road in Egg Harbor, Wisconsin. Call the restaurant for current hours,
            reservations, and large parties.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-20">
        <div className="space-y-8">
          <Reveal>
            <SectionHeading
              eyebrow="Visit"
              title={
                <>
                  {address}
                  <br />
                  {city}, WI 54209
                </>
              }
              description="Free parking is typical for the area, but confirm with the restaurant. The map is embedded from Google Maps for orientation only."
            />
          </Reveal>

          <div className="grid gap-3">
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="flex items-center gap-4 rounded-2xl border border-line/70 bg-white/60 p-4 transition-colors hover:border-gold/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream">
                <Phone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/40">Phone</span>
                <span className="text-sm font-semibold">{phone}</span>
              </span>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, WI 54209`)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-4 rounded-2xl border border-line/70 bg-white/60 p-4 transition-colors hover:border-gold/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/40">
                  Directions
                </span>
                <span className="text-sm font-semibold">Open in Google Maps</span>
              </span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-ink/35" />
            </a>

            <div className="flex items-start gap-4 rounded-2xl border border-line/70 bg-white/60 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/40">Hours</span>
                <p className="mt-1 text-sm font-semibold">Thu–Mon, 12–8pm</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">
                  Closed Tuesday &amp; Wednesday. The 2026 season ended October 31; call before you drive or to
                  confirm the 2027 reopening.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={instagram.startsWith('http') ? instagram : `https://www.instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/50 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ink/65 hover:border-ink/30"
            >
              <AtSign className="h-3.5 w-3.5" />
              {instagram}
            </a>
            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/50 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ink/65 hover:border-ink/30"
              >
                <Share2 className="h-3.5 w-3.5" />
                Facebook
              </a>
            ) : null}
            {official ? (
              <a
                href={official}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/50 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ink/65 hover:border-ink/30"
              >
                Official website
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>

          <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 text-xs leading-relaxed text-ink/65">
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong className="font-semibold">This is an unofficial redesign proposal.</strong> The contact
                details above are the restaurant&apos;s published details and are shown for demonstration. This site
                does not send messages, emails, or reservations.
              </span>
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-line/70 bg-white/60">
          <iframe
            title="Map to Mezzanine in Egg Harbor, Wisconsin"
            src={MAP_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[26rem] w-full border-0 lg:h-full lg:min-h-[34rem]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 px-5 py-4 text-[0.64rem] uppercase tracking-[0.14em] text-ink/40">
            <span>7821 Horseshoe Bay Road · Egg Harbor, WI</span>
            <span>Map data © Google</span>
          </div>
        </div>
      </section>
    </>
  )
}
