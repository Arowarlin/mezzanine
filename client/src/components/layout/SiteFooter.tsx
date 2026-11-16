import { Link } from 'react-router-dom'
import { AtSign, Mail, MapPin, Phone } from 'lucide-react'
import { NAV_LINKS } from '../../lib/site'
import { useSettings } from '../../context/SettingsContext'
import { Brand } from './Brand'

const CURRENT_YEAR = new Date().getFullYear()

export function SiteFooter() {
  const { settings } = useSettings()
  const phone = settings?.phone ?? '+1 809 555 0142'
  const email = settings?.email ?? 'reservas@casaveranda.do'
  const instagram = settings?.instagram ?? '@casaveranda'
  const address = settings?.address ?? 'Calle Gustavo Mejía Ricart 45, Piantini'
  const city = settings?.city ?? 'Santo Domingo'

  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <Brand light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/55">
            Cocina caribeña contemporánea, fuego de leña y producto local. Una terraza para quedarse.
          </p>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold">Explorar</h3>
          <ul className="mt-5 space-y-3 text-sm text-cream/65">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="link-underline hover:text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/pedido" className="link-underline hover:text-cream">
                Pedir en línea
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold">Visítanos</h3>
          <ul className="mt-5 space-y-4 text-sm text-cream/65">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {address}
                <br />
                {city}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-cream">
                {phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${email}`} className="hover:text-cream">
                {email}
              </a>
            </li>
            <li className="flex gap-3">
              <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{instagram}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold">Horario</h3>
          <ul className="mt-5 space-y-2 text-sm text-cream/65">
            <li className="flex justify-between gap-4">
              <span>Martes a jueves</span>
              <span>12:00 – 23:00</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Viernes y sábado</span>
              <span>12:00 – 00:00</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Domingo</span>
              <span>12:00 – 21:00</span>
            </li>
            <li className="flex justify-between gap-4 text-cream/40">
              <span>Lunes</span>
              <span>Cerrado</span>
            </li>
          </ul>
          <Link
            to="/admin"
            className="mt-6 inline-block text-[0.68rem] uppercase tracking-[0.18em] text-cream/35 transition hover:text-gold"
          >
            Panel administrativo
          </Link>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-2 py-6 text-[0.7rem] uppercase tracking-[0.14em] text-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} Casa Veranda. Todos los derechos reservados.</p>
          <p>Santo Domingo · República Dominicana</p>
        </div>
      </div>
    </footer>
  )
}
