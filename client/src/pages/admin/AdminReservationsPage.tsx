import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Eye, MessageCircle, RefreshCw, Search, Users } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminReservation, ReservationStatus } from '../../lib/types'
import { digitsOnly, formatDate, formatDateTime, todayISO } from '../../lib/format'
import { PageHeader } from '../../components/admin/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'

const STATUS_FILTERS: Array<{ value: ReservationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'seated', label: 'En mesa' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'no_show', label: 'No asistió' },
]

const STATUS_OPTIONS: Array<{ value: ReservationStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'seated', label: 'En mesa' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'no_show', label: 'No asistió' },
]

export function AdminReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [detailId, setDetailId] = useState<number | null>(null)
  const [nextStatus, setNextStatus] = useState<ReservationStatus>('pending')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '150' })
      if (date) params.set('date', date)
      if (status !== 'all') params.set('status', status)
      if (debouncedQuery) params.set('q', debouncedQuery)
      const data = await api<{ reservations: AdminReservation[]; total: number }>(
        `/api/admin/reservations?${params.toString()}`,
      )
      setReservations(data.reservations)
      setTotal(data.total)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [date, status, debouncedQuery])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const detail = reservations.find((reservation) => reservation.id === detailId) ?? null

  const openDetail = (reservation: AdminReservation) => {
    setDetailId(reservation.id)
    setNextStatus(reservation.status)
  }

  const updateStatus = async () => {
    if (!detail) return
    setUpdating(true)
    setError('')
    try {
      await api<{ ok: boolean }>(`/api/admin/reservations/${detail.id}/status`, {
        method: 'PATCH',
        body: { status: nextStatus },
      })
      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === detail.id ? { ...reservation, status: nextStatus } : reservation,
        ),
      )
      setNotice(`Reserva ${detail.code} actualizada.`)
      setDetailId(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  const guests = reservations.reduce((sum, reservation) => sum + reservation.partySize, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sala"
        title="Reservas"
        description="Disponibilidad, confirmaciones y llegada de los comensales."
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

      <div className="grid gap-3 lg:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="field w-auto py-2.5 pl-10 text-xs"
              aria-label="Filtrar por fecha"
            />
          </div>
          <button
            type="button"
            onClick={() => setDate(todayISO())}
            className="rounded-full border border-line bg-white/60 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-ink/55 transition hover:border-forest/30 hover:text-ink"
          >
            Hoy
          </button>
          {date ? (
            <button
              type="button"
              onClick={() => setDate('')}
              className="text-[0.64rem] font-bold uppercase tracking-[0.12em] text-ink/35 transition hover:text-ink"
            >
              Quitar fecha
            </button>
          ) : null}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[0.64rem] font-bold uppercase tracking-[0.12em] transition ${
                status === filter.value
                  ? 'bg-forest text-cream'
                  : 'border border-line bg-white/60 text-ink/55 hover:border-forest/30 hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Código, nombre o teléfono…"
            className="field py-2.5 pl-11 text-xs"
            aria-label="Buscar reservas"
          />
        </div>
      </div>

      <p className="text-xs text-ink/45">
        {total} reserva{total === 1 ? '' : 's'} · {guests} comensal{guests === 1 ? '' : 'es'} en esta vista
      </p>

      {loading ? (
        <PageLoader label="Cargando reservas…" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line/70 bg-white/70">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Fecha y hora</th>
                  <th>Cliente</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th className="text-right">Ver</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="whitespace-nowrap font-semibold tracking-wide">{reservation.code}</td>
                    <td className="whitespace-nowrap">
                      <p className="font-medium capitalize">{formatDate(reservation.date)}</p>
                      <p className="text-xs text-ink/45">{reservation.time}</p>
                    </td>
                    <td>
                      <p className="font-medium">{reservation.customer.name}</p>
                      <p className="text-xs text-ink/40">{reservation.customer.phone}</p>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-gold" />
                        {reservation.partySize}
                      </span>
                    </td>
                    <td>
                      <StatusBadge kind="reservation" status={reservation.status} />
                    </td>
                    <td className="whitespace-nowrap text-xs text-ink/45">{formatDateTime(reservation.createdAt)}</td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openDetail(reservation)}
                          className="rounded-lg p-2 text-ink/45 transition hover:bg-sand hover:text-ink"
                          aria-label={`Ver reserva ${reservation.code}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-ink/45">
                      No hay reservas con estos filtros.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetailId(null)}
        title={detail ? `Reserva ${detail.code}` : 'Reserva'}
        footer={
          detail ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/${digitsOnly(detail.customer.phone)}?text=${encodeURIComponent(
                  `Hola ${detail.customer.name}, le escribimos de Casa Veranda para confirmar su reserva ${detail.code} del ${detail.date} a las ${detail.time}.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-forest/70 transition hover:text-forest"
              >
                <MessageCircle className="h-4 w-4" />
                Confirmar por WhatsApp
              </a>
              <div className="flex items-center gap-2">
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as ReservationStatus)}
                  className="field w-auto py-2 text-xs"
                  aria-label="Nuevo estado de la reserva"
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
                  disabled={updating || nextStatus === detail.status}
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
        {detail ? (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-2xl bg-sand/35 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Cliente</p>
                <p className="mt-1 font-semibold">{detail.customer.name}</p>
                <p className="text-xs text-ink/50">{detail.customer.phone}</p>
              </div>
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Fecha y hora</p>
                <p className="mt-1 font-semibold capitalize">{formatDate(detail.date)}</p>
                <p className="text-xs text-ink/50">{detail.time}</p>
              </div>
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Personas</p>
                <p className="mt-1 font-semibold">{detail.partySize}</p>
              </div>
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Estado</p>
                <div className="mt-1">
                  <StatusBadge kind="reservation" status={detail.status} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line/60 px-4 py-3 text-sm">
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink/40">Notas</p>
              <p className="mt-1 leading-relaxed text-ink/70">{detail.notes || 'Sin notas.'}</p>
            </div>

            <p className="text-xs text-ink/40">Solicitada el {formatDateTime(detail.createdAt)}</p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
