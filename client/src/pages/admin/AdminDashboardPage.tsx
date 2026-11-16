import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  Clock,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { Stats } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { formatMoney, formatShortDate, formatDateTime } from '../../lib/format'
import { PageHeader } from '../../components/admin/PageHeader'
import { PageLoader } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'

export function AdminDashboardPage() {
  const { currency } = useSettings()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api<Stats>('/api/admin/stats')
      .then(setStats)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <PageLoader label="Cargando el dashboard…" />

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-sm text-rose-800">{error || 'No se pudieron cargar las métricas.'}</p>
        <button type="button" onClick={load} className="btn-primary mt-4">
          Reintentar
        </button>
      </div>
    )
  }

  const maxRevenue = Math.max(...stats.revenueSeries.map((item) => item.revenueCents), 1)
  const weekRevenue = stats.revenueSeries.reduce((sum, item) => sum + item.revenueCents, 0)

  const cards = [
    {
      label: 'Ventas de hoy',
      value: formatMoney(stats.today.revenueCents, currency),
      detail: `${stats.today.orders} pedido${stats.today.orders === 1 ? '' : 's'}`,
      icon: CircleDollarSign,
      tone: 'bg-forest text-cream',
    },
    {
      label: 'Pedidos pendientes',
      value: String(stats.pendingOrders),
      detail: 'por confirmar o preparar',
      icon: ShoppingBag,
      tone: 'bg-gold/20 text-forest',
      to: '/admin/pedidos',
    },
    {
      label: 'Reservas de hoy',
      value: String(stats.todayReservations.total),
      detail: `${stats.todayReservations.guests} comensales`,
      icon: CalendarCheck,
      tone: 'bg-sand text-forest',
      to: '/admin/reservas',
    },
    {
      label: 'Clientes registrados',
      value: String(stats.customers),
      detail: `${stats.products.available} de ${stats.products.total} platos activos`,
      icon: Users,
      tone: 'bg-white text-forest border border-line',
      to: '/admin/clientes',
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resumen"
        title="Dashboard"
        description="Lo que está pasando hoy en la casa, de un vistazo."
        actions={
          <button type="button" onClick={load} className="btn-ghost px-4 py-2 text-[0.68rem] text-forest">
            Actualizar
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const content = (
            <div className="h-full rounded-2xl border border-line/70 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/40">{card.label}</p>
                  <p className="mt-3 font-display text-4xl leading-none">{card.value}</p>
                  <p className="mt-2 text-xs text-ink/45">{card.detail}</p>
                </div>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          )
          return card.to ? (
            <Link key={card.label} to={card.to}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/40">Últimos 7 días</p>
              <h2 className="mt-1 text-2xl">Ventas</h2>
            </div>
            <p className="text-sm text-ink/55">
              Total: <strong className="text-ink">{formatMoney(weekRevenue, currency)}</strong>
            </p>
          </div>

          <div className="mt-8 flex h-44 items-end gap-2 sm:gap-4">
            {stats.revenueSeries.map((item) => {
              const height = Math.max(4, Math.round((item.revenueCents / maxRevenue) * 100))
              return (
                <div key={item.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[0.6rem] font-semibold text-ink/0 transition group-hover:text-ink/60">
                    {formatMoney(item.revenueCents, currency)}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-forest/85 transition-all duration-500 group-hover:bg-gold"
                    style={{ height: `${height}%` }}
                    title={`${formatShortDate(item.day)}: ${formatMoney(item.revenueCents, currency)} · ${item.orders} pedidos`}
                  />
                  <span className="text-[0.62rem] uppercase tracking-wide text-ink/40">
                    {formatShortDate(item.day)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            <h2 className="text-2xl">Más vendidos</h2>
          </div>
          <p className="mt-1 text-xs text-ink/45">Últimos 30 días</p>

          {stats.topProducts.length === 0 ? (
            <p className="mt-6 text-sm text-ink/45">Todavía no hay ventas registradas.</p>
          ) : (
            <ol className="mt-5 space-y-4">
              {stats.topProducts.map((product, index) => (
                <li key={product.name} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand text-[0.66rem] font-bold text-forest">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-ink/45">
                      {product.quantity} vendidos · {formatMoney(product.revenueCents, currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-line/70 bg-white/70">
          <div className="flex items-center justify-between gap-3 border-b border-line/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-gold" />
              <h2 className="text-2xl">Próximas reservas</h2>
            </div>
            <Link
              to="/admin/reservas"
              className="inline-flex items-center gap-1 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-forest/70 transition hover:text-forest"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats.upcomingReservations.length === 0 ? (
            <p className="px-6 py-8 text-sm text-ink/45">No hay reservas próximas.</p>
          ) : (
            <ul className="divide-y divide-line/40">
              {stats.upcomingReservations.map((reservation) => (
                <li key={reservation.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{reservation.customerName}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/45">
                      <Clock className="h-3.5 w-3.5" />
                      {formatShortDate(reservation.date)} · {reservation.time} · {reservation.partySize} personas
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge kind="reservation" status={reservation.status} />
                    <span className="text-[0.66rem] font-semibold tracking-wide text-ink/35">{reservation.code}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line/70 bg-white/70">
          <div className="flex items-center justify-between gap-3 border-b border-line/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-gold" />
              <h2 className="text-2xl">Últimos pedidos</h2>
            </div>
            <Link
              to="/admin/pedidos"
              className="inline-flex items-center gap-1 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-forest/70 transition hover:text-forest"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-sm text-ink/45">Todavía no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-line/40">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {order.code} · {order.customerName}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/45">
                      {order.type === 'delivery' ? 'Entrega' : 'Recogida'} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge kind="order" status={order.status} />
                    <span className="text-sm font-bold">{formatMoney(order.totalCents, currency)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
