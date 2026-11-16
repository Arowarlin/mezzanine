import { useCallback, useEffect, useState } from 'react'
import { MessageCircle, Pencil, RefreshCw, Search } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminCustomer } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { digitsOnly, formatDateTime, formatMoney } from '../../lib/format'
import { PageHeader } from '../../components/admin/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'

export function AdminCustomersPage() {
  const { currency } = useSettings()
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [editing, setEditing] = useState<AdminCustomer | null>(null)
  const [form, setForm] = useState({ name: '', email: '', notes: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '150' })
      if (debouncedQuery) params.set('q', debouncedQuery)
      const data = await api<{ customers: AdminCustomer[]; total: number }>(
        `/api/admin/customers?${params.toString()}`,
      )
      setCustomers(data.customers)
      setTotal(data.total)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const openEdit = (customer: AdminCustomer) => {
    setEditing(customer)
    setForm({ name: customer.name, email: customer.email ?? '', notes: customer.notes ?? '' })
    setFormError('')
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    setFormError('')

    if (form.name.trim().length < 2) {
      setFormError('El nombre debe tener al menos 2 caracteres.')
      return
    }

    setSaving(true)
    try {
      const data = await api<{ customer: AdminCustomer }>(`/api/admin/customers/${editing.id}`, {
        method: 'PATCH',
        body: { name: form.name.trim(), email: form.email.trim(), notes: form.notes.trim() },
      })
      setCustomers((current) => current.map((customer) => (customer.id === editing.id ? data.customer : customer)))
      setNotice('Cliente actualizado.')
      setEditing(null)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relación"
        title="Clientes"
        description="Historial de consumo, contacto y notas internas."
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink/45">{total} cliente{total === 1 ? '' : 's'} registrado{total === 1 ? '' : 's'}</p>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, teléfono o correo…"
            className="field py-2.5 pl-11"
            aria-label="Buscar clientes"
          />
        </div>
      </div>

      {loading ? (
        <PageLoader label="Cargando clientes…" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line/70 bg-white/70">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Pedidos</th>
                  <th>Reservas</th>
                  <th>Consumo</th>
                  <th>Alta</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <p className="font-semibold">{customer.name}</p>
                      {customer.notes ? (
                        <p className="max-w-[220px] truncate text-xs text-ink/40">{customer.notes}</p>
                      ) : null}
                    </td>
                    <td>
                      <p className="text-sm">{customer.phone}</p>
                      <p className="text-xs text-ink/40">{customer.email ?? 'Sin correo'}</p>
                    </td>
                    <td>{customer.ordersCount}</td>
                    <td>{customer.reservationsCount}</td>
                    <td className="whitespace-nowrap font-semibold">
                      {formatMoney(customer.totalSpentCents, currency)}
                    </td>
                    <td className="whitespace-nowrap text-xs text-ink/45">{formatDateTime(customer.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <a
                          href={`https://wa.me/${digitsOnly(customer.phone)}?text=${encodeURIComponent(
                            `Hola ${customer.name}, le escribimos de Casa Veranda.`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-ink/45 transition hover:bg-emerald-50 hover:text-emerald-700"
                          aria-label={`Escribir a ${customer.name}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          className="rounded-lg p-2 text-ink/45 transition hover:bg-sand hover:text-ink"
                          aria-label={`Editar ${customer.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-ink/45">
                      No hay clientes que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Editar cliente"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost px-4 py-2 text-[0.7rem] text-forest">
              Cancelar
            </button>
            <button type="submit" form="customer-form" disabled={saving} className="btn-primary px-4 py-2 text-[0.7rem]">
              {saving ? <Spinner className="h-4 w-4" /> : null}
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        }
      >
        <form id="customer-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="customer-name" className="label">
              Nombre
            </label>
            <input
              id="customer-name"
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="field"
              maxLength={120}
              required
            />
          </div>
          <div>
            <label htmlFor="customer-phone" className="label">
              Teléfono
            </label>
            <input id="customer-phone" type="tel" value={editing?.phone ?? ''} className="field bg-sand/30" disabled />
            <p className="mt-1 text-[0.66rem] text-ink/35">El teléfono es la llave del cliente y no se edita aquí.</p>
          </div>
          <div>
            <label htmlFor="customer-email" className="label">
              Correo
            </label>
            <input
              id="customer-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="field"
              maxLength={160}
              placeholder="cliente@correo.com"
            />
          </div>
          <div>
            <label htmlFor="customer-notes" className="label">
              Notas internas
            </label>
            <textarea
              id="customer-notes"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="field min-h-24 resize-y"
              maxLength={2000}
              placeholder="Preferencias, alergias, mesa habitual…"
            />
          </div>
          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {formError}
            </div>
          ) : null}
        </form>
      </Modal>
    </div>
  )
}
