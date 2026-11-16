import type { OrderStatus, ReservationStatus } from '../../lib/types'

const ORDER_LABELS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmado', className: 'bg-sky-100 text-sky-800' },
  preparing: { label: 'En preparación', className: 'bg-violet-100 text-violet-800' },
  ready: { label: 'Listo', className: 'bg-teal-100 text-teal-800' },
  completed: { label: 'Completado', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', className: 'bg-rose-100 text-rose-800' },
}

const RESERVATION_LABELS: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmada', className: 'bg-sky-100 text-sky-800' },
  seated: { label: 'En mesa', className: 'bg-violet-100 text-violet-800' },
  completed: { label: 'Completada', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelada', className: 'bg-rose-100 text-rose-800' },
  no_show: { label: 'No asistió', className: 'bg-stone-200 text-stone-700' },
}

type StatusBadgeProps =
  | { kind: 'order'; status: OrderStatus }
  | { kind: 'reservation'; status: ReservationStatus }

export function StatusBadge({ kind, status }: StatusBadgeProps) {
  const config =
    kind === 'order'
      ? ORDER_LABELS[status as OrderStatus]
      : RESERVATION_LABELS[status as ReservationStatus]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  )
}
