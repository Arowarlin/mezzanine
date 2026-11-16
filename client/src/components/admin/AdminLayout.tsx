import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarCheck,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Brand } from '../layout/Brand'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/reservas', label: 'Reservas', icon: CalendarCheck },
  { to: '/admin/productos', label: 'Productos', icon: UtensilsCrossed },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/galeria', label: 'Galería', icon: Images },
  { to: '/admin/empleos', label: 'Empleos', icon: BriefcaseBusiness },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/ajustes', label: 'Ajustes', icon: Settings },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-cream">
      <div className="flex items-center justify-between px-6 py-6">
        <Brand light />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-full p-2 text-cream/60 transition hover:bg-white/10 hover:text-cream lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="px-6 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-cream/35">Administración</p>

      <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Navegación del panel">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-gold text-ink shadow-[0_10px_24px_-16px_rgba(193,154,91,0.9)]'
                  : 'text-cream/60 hover:bg-white/5 hover:text-cream'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-cream/10 p-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-cream/55 transition hover:bg-white/5 hover:text-cream"
        >
          <ExternalLink className="h-4 w-4" />
          Ver el sitio
        </Link>
        <div className="rounded-xl bg-white/5 px-3.5 py-3">
          <p className="truncate text-sm font-semibold text-cream">{user?.name}</p>
          <p className="truncate text-[0.68rem] text-cream/40">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-cream/15 px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-cream/70 transition hover:border-cream/40 hover:text-cream disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside className="drawer-enter absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-soft">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full p-2 text-ink/60 transition hover:bg-sand hover:text-ink lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="hidden text-[0.68rem] font-bold uppercase tracking-[0.2em] text-ink/35 sm:block">
              Mezzanine · Panel
            </p>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-ink/45 sm:inline">{user?.email}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-xs font-bold uppercase text-cream">
                {user?.name.slice(0, 2) ?? 'MZ'}
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
