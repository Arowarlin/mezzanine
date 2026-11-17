import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CalendarCheck, Menu, Phone, ShoppingBag, X } from 'lucide-react'
import { NAV_LINKS } from '../../lib/site'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { Brand } from './Brand'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { count, openCart } = useCart()
  const { settings } = useSettings()
  const isHome = location.pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const phone = settings?.phone ?? '920-786-7698'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-ink text-cream/65">
        <div className="container-page flex h-8 items-center justify-between gap-4 text-[0.6rem] font-medium uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4fb3a8]" />
            Unofficial redesign proposal · {import.meta.env.VITE_STATIC_DEMO === 'true' ? 'static demo' : 'local demo'}
          </span>
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden items-center gap-1.5 transition-colors hover:text-cream sm:flex"
          >
            <Phone className="h-3 w-3" />
            {phone}
          </a>
        </div>
      </div>

      <div
        className={`text-cream transition-all duration-300 ${
          transparent
            ? 'bg-gradient-to-b from-ink/80 to-transparent'
            : 'border-b border-cream/10 bg-ink/95 backdrop-blur'
        }`}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
          <Brand light compact />

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `link-underline text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    isActive ? 'text-gold' : 'text-cream/75 hover:text-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:border-cream/60"
              aria-label="Open demo pre-order"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[0.6rem] font-bold text-cream">
                  {count}
                </span>
              ) : null}
            </button>

            <Link
              to="/reservations"
              className="hidden items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink transition-all hover:-translate-y-0.5 hover:bg-[#d3ac63] sm:inline-flex"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Reserve
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-cream lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink text-cream lg:hidden">
          <div className="container-page flex h-[4.5rem] items-center justify-between">
            <Brand light compact />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/25"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="container-page flex flex-1 flex-col justify-center gap-1 pb-20">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `border-b border-cream/10 py-4 font-display text-3xl transition-colors ${
                    isActive ? 'text-gold' : 'text-cream/85 hover:text-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-8 grid gap-3">
              <Link to="/reservations" className="btn-gold w-full">
                Reserve a table
              </Link>
              <Link
                to="/order"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-cream"
              >
                <ShoppingBag className="h-4 w-4" />
                Demo pre-order
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
