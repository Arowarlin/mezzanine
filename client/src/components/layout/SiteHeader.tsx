import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { NAV_LINKS } from '../../lib/site'
import { useCart } from '../../context/CartContext'
import { Brand } from './Brand'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { count, openCart } = useCart()
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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          transparent
            ? 'bg-gradient-to-b from-ink/55 to-transparent py-5'
            : 'border-b border-line/60 bg-cream/92 py-3 shadow-[0_10px_30px_-24px_rgba(16,29,25,0.5)] backdrop-blur-md'
        }`}
      >
        <div className="container-page flex items-center justify-between gap-6">
          <Brand light={transparent} />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `link-underline text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors ${
                    transparent ? 'text-cream/85 hover:text-cream' : 'text-ink/65 hover:text-ink'
                  } ${isActive ? (transparent ? 'text-cream' : 'text-ink') : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openCart}
              className={`relative rounded-full p-2.5 transition ${
                transparent ? 'text-cream hover:bg-white/10' : 'text-ink hover:bg-sand'
              }`}
              aria-label={`Abrir carrito (${count} artículos)`}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] font-bold text-ink">
                  {count}
                </span>
              ) : null}
            </button>

            <Link
              to="/reservaciones"
              className={`hidden rounded-full px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] transition sm:inline-flex ${
                transparent
                  ? 'border border-cream/40 text-cream hover:bg-cream hover:text-ink'
                  : 'bg-forest text-cream hover:bg-moss'
              }`}
            >
              Reservar
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`rounded-full p-2.5 transition lg:hidden ${
                transparent ? 'text-cream hover:bg-white/10' : 'text-ink hover:bg-sand'
              }`}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-forest text-cream lg:hidden">
          <div className="container-page flex items-center justify-between py-5">
            <Brand light />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full p-2.5 text-cream hover:bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container-page flex flex-1 flex-col justify-center gap-1" aria-label="Navegación móvil">
            {NAV_LINKS.map((link, index) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `border-b border-cream/10 py-4 font-display text-4xl transition-colors ${
                    isActive ? 'text-gold' : 'text-cream/90 hover:text-gold'
                  }`
                }
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="container-page pb-10 pt-6 text-sm text-cream/60">
            <p>Calle Gustavo Mejía Ricart 45, Piantini</p>
            <p className="mt-1">Santo Domingo · República Dominicana</p>
          </div>
        </div>
      ) : null}
    </>
  )
}
