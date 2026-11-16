import { Link } from 'react-router-dom'
import { ArrowUpRight, AtSign, MapPin, Phone, Share2 } from 'lucide-react'
import { FOOTER_LINKS } from '../../lib/site'
import { useSettings } from '../../context/SettingsContext'
import { Brand } from './Brand'

const CURRENT_YEAR = new Date().getFullYear()

export function SiteFooter() {
  const { settings } = useSettings()
  const phone = settings?.phone ?? '920-786-7698'
  const address = settings?.address ?? '7821 Horseshoe Bay Road'
  const city = settings?.city ?? 'Egg Harbor'
  const instagram = settings?.instagram ?? '@mezzaninerooftop'
  const facebook = settings?.facebook ?? 'https://www.facebook.com/MezzEggHarbor'
  const official = settings?.official_website ?? 'https://www.mezzaninerooftop.com/'
  const hoursNote = settings?.hours_note

  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-20">
        <div>
          <Brand light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
            {settings?.description ??
              'A rooftop kitchen and bar above Egg Harbor, Wisconsin. Cocktails, wine, beer, and a short kitchen menu.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={instagram.startsWith('http') ? instagram : `https://www.instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cream/70 transition-colors hover:border-cream/50 hover:text-cream"
            >
              <AtSign className="h-3.5 w-3.5" />
              Instagram
            </a>
            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cream/70 transition-colors hover:border-cream/50 hover:text-cream"
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
                className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-cream/70 transition-colors hover:border-cream/50 hover:text-cream"
              >
                Official site
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-gold">Visit</p>
          <ul className="mt-5 space-y-3 text-sm text-cream/65">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cream/40" />
              <span>
                {address}
                <br />
                {city}, WI 54209
              </span>
            </li>
            <li>
              <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex gap-2.5 hover:text-cream">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cream/40" />
                {phone}
              </a>
            </li>
          </ul>
          {hoursNote ? (
            <p className="mt-5 max-w-xs text-xs leading-relaxed text-cream/40">{hoursNote}</p>
          ) : null}
        </div>

        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-gold">Explore</p>
          <ul className="mt-5 grid gap-2 text-sm text-cream/65 sm:grid-cols-2 lg:grid-cols-1">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="link-underline hover:text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-3 py-6 text-[0.66rem] uppercase tracking-[0.16em] text-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} Mezzanine · Egg Harbor, Wisconsin</p>
          <p>Unofficial redesign proposal — not the official website</p>
        </div>
        <div className="container-page pb-8">
          <p className="max-w-4xl text-[0.66rem] leading-relaxed text-cream/25">
            This is a local demonstration built for review. It is not affiliated with or endorsed by Mezzanine.
            Menu items and prices are samples or pending confirmation, and no reservations, orders, payments, or
            emails are processed. Photography is illustrative.
          </p>
        </div>
      </div>
    </footer>
  )
}
