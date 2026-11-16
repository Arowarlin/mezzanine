import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Phone, RefreshCw, Search, Truck, Store } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminOrder, AdminOrderItem, OrderStatus } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { formatDateTime, formatMoney } from '../../lib/format'
import { PageHeader } from '../../components/admin/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'

const STATUS_FILTERS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready', label: 'Listos' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' },
]

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready', label: 'Listo' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

type DetailResponse = { order: AdminOrder; items: AdminOrderItem[] }

export function AdminOrdersPage() {
  const { currency } = useSettings()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [detailId, setDetailId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [nextStatus, setNextStatus] = useState<OrderStatus>('pending')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (status !== 'all') params.set('status', status)
      if (debouncedQuery) params.set('q', debouncedQuery)
      const data = await api<{ orders: AdminOrder[]; total: number }>(`/api/admin/orders?${params.toString()}`)
      setOrders(data.orders)
      setTotal(data.total)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [status, debouncedQuery])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const openDetail = async (order: AdminOrder) => {
    setDetailId(order.id)
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    setNextStatus(order.status)
    try {
      const data = await api<DetailResponse>(`/api/admin/orders/${order.id}`)
      setDetail(data)
      setNextStatus(data.order.status)
    } catch (err) {
      setDetailError(errorMessage(err))
    } finally {
      setDetailLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!detail) return
    setUpdating(true)
    setDetailError('')
    try {
      await api<{ ok: boolean }>(`/api/admin/orders/${detail.order.id}/status`, {
        method: 'PATCH',
        body: { status: nextStatus },
      })
      setDetail({ ...detail, order: { ...detail.order, status: nextStatus } })
      setOrders((current) =>
        current.map((order) => (order.id === detail.order.id ? { ...order, status: nextStatus } : order)),
      )
      setNotice(`Pedido ${detail.order.code} actualizado.`)
    } catch (err) {
      setDetailError(errorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  const visibleTotal = useMemo(() => orders.reduce((sum, order) => sum + order.totalCents, 0), [orders])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Pedidos"
        description="Confirma, prepara y cierra los pedidos del día."
        actions={
          <button type="button" onClick={load} className="btn-ghost px-4 py-2 text-[0.68rem] text-forest">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </button>
        }
      />

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] transition ${
                status === filter.value
                  ? 'bg-forest text-cream'
                  : 'border border-line bg-white/60 text-ink/55 hover:border-forest/30 hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Código, cliente o teléfono…"
            className="field py-2.5 pl-11"
            aria-label="Buscar pedidos"
          />
        </div>
      </div>

      <p className="text-xs text-ink/45">
        {total} pedido{total === 1 ? '' : 's'} · {formatMoney(visibleTotal, currency)} en esta vista
      </p>

      {loading ? (
        <PageLoader label="Cargando pedidos…" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line/70 bg-white/70">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th className="text-right">Ver</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap font-semibold tracking-wide">{order.code}</td>
                    <td>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-xs text-ink/40">{order.customer.phone}</p>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink/60">
                        {order.type === 'delivery' ? (
                          <Truck className="h-3.5 w-3.5 text-gold" />
                        ) : (
                          <Store className="h-3.5 w-3.5 text-gold" />
                        )}
                        {order.type === 'delivery' ? 'Entrega' : 'Recogida'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-semibold">{formatMoney(order.totalCents, currency)}</td>
                    <td>
                      <StatusBadge kind="order" status={order.status} />
                    </td>
                    <td className="whitespace-nowrap text-xs text-ink/45">{formatDateTime(order.createdAt)}</td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openDetail(order)}
                          className="rounded-lg p-2 text-ink/45 transition hover:bg-sand hover:text-ink"
                          aria-label={`Ver pedido ${order.code}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-ink/45">
                      No hay pedidos con estos filtros.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title={detail ? `Pedido ${detail.order.code}` : 'Pedido'}
        size="lg"
        footer={
          detail ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`tel:${detail.order.customer.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-forest/70 transition hover:text-forest"
              >
                <Phone className="h-4 w-4" />
                Llamar al cliente
              </a>
              <div className="flex items-center gap-2">
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                  className="field w-auto py-2 text-xs"
                  aria-label="Nuevo estado del pedido"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={updating || nextStatus === detail.order.status}
                  className="btn-primary px-4 py-2 text-[0.68rem]"
                >
                  {updating ? <Spinner className="h-3.5 w-3.5" /> : null}
                  Actualizar
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {detailLoading ? <PageLoader label="Cargando detalle…" /> : null}

        {!detailLoading && detailError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {detailError}
          </div>
        ) : null}

        {!detailLoading && detail ? (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-2xl bg-sand/35 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Cliente</p>
                <p className="mt-1 font-semibold">{detail.order.customer.name}</p>
                <p className="text-xs text-ink/50">{detail.order.customer.phone}</p>
                {detail.order.customer.email ? (
                  <p className="text-xs text-ink/50">{detail.order.customer.email}</p>
                ) : null}
              </div>
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Entrega</p>
                <p className="mt-1 font-semibold">
                  {detail.order.type === 'delivery' ? 'A domicilio' : 'Recogida en el restaurante'}
                </p>
                {detail.order.address ? (
                  <p className="text-xs leading-relaxed text-ink/50">{detail.order.address}</p>
                ) : null}
              </div>
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Fecha</p>
                <p className="mt-1">{formatDateTime(detail.order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Estado actual</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge kind="order" status={detail.order.status} />
                  {detail.order.isDemo ? <span className="chip chip-ember">Demo</span> : null}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg">Detalle</h3>
              <div className="mt-2 overflow-x-auto rounded-xl border border-line/60">
                <table className="admin-table min-w-[420px]">
                  <thead>
                    <tr>
                      <th>Plato</th>
                      <th>Cant.</th>
                      <th>Precio</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <p className="font-medium">{item.productName}</p>
                          {item.notes ? <p className="text-xs text-ink/45">{item.notes}</p> : null}
                        </td>
                        <td>{item.quantity}</td>
                        <td className="whitespace-nowrap">{formatMoney(item.unitPriceCents, currency)}</td>
                        <td className="whitespace-nowrap font-semibold">
                          {formatMoney(item.lineTotalCents, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <dl className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink/50">Subtotal</dt>
                <dd>{formatMoney(detail.order.subtotalCents, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/50">Envío</dt>
                <dd>{formatMoney(detail.order.deliveryFeeCents, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line/60 pt-2">
                <dt className="font-semibold">Total</dt>
                <dd className="text-lg font-bold">{formatMoney(detail.order.totalCents, currency)}</dd>
              </div>
            </dl>

            {detail.order.notes ? (
              <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/45">Notas del cliente</p>
                <p className="mt-1 leading-relaxed text-ink/75">{detail.order.notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
