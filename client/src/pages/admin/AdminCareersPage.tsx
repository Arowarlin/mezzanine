import { useCallback, useEffect, useState } from 'react'
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminCareerOpening } from '../../lib/types'
import { PageHeader } from '../../components/admin/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'

const TYPES = [
  { value: 'full_time', label: 'Tiempo completo' },
  { value: 'part_time', label: 'Medio tiempo' },
  { value: 'seasonal', label: 'Temporada' },
] as const

type FormState = {
  title: string
  description: string
  employmentType: 'full_time' | 'part_time' | 'seasonal'
  sortOrder: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  employmentType: 'full_time',
  sortOrder: '0',
  isActive: true,
}

export function AdminCareersPage() {
  const [openings, setOpenings] = useState<AdminCareerOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCareerOpening | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminCareerOpening | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api<{ openings: AdminCareerOpening[] }>('/api/admin/careers')
      setOpenings(data.openings)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, sortOrder: String(openings.length + 1) })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (opening: AdminCareerOpening) => {
    setEditing(opening)
    setForm({
      title: opening.title,
      description: opening.description ?? '',
      employmentType: opening.employmentType,
      sortOrder: String(opening.sortOrder),
      isActive: opening.isActive,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (form.title.trim().length < 2) {
      setFormError('Escribe el nombre del puesto.')
      return
    }

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      employmentType: form.employmentType,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }

    try {
      if (editing) {
        const data = await api<{ opening: AdminCareerOpening }>(`/api/admin/careers/${editing.id}`, {
          method: 'PATCH',
          body: payload,
        })
        setOpenings((current) => current.map((opening) => (opening.id === editing.id ? data.opening : opening)))
        setNotice('Puesto actualizado.')
      } else {
        const data = await api<{ opening: AdminCareerOpening }>('/api/admin/careers', {
          method: 'POST',
          body: payload,
        })
        setOpenings((current) => [...current, data.opening])
        setNotice('Puesto creado.')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await api(`/api/admin/careers/${deleteTarget.id}`, { method: 'DELETE' })
      setOpenings((current) => current.filter((opening) => opening.id !== deleteTarget.id))
      setNotice('Puesto eliminado.')
      setDeleteTarget(null)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Contenido"
        title="Empleos"
        description="Puestos que aparecen en /careers. No inventes vacantes: publica solo lo que el restaurante confirme."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo puesto
          </button>
        }
      />

      {notice ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      {loading ? (
        <PageLoader label="Cargando puestos" />
      ) : openings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line/70 bg-white/60 p-10 text-center">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-ink/30" />
          <p className="mt-4 text-sm text-ink/55">No hay puestos publicados.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {openings.map((opening) => (
            <article key={opening.id} className="rounded-2xl border border-line/70 bg-white/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip">{TYPES.find((type) => type.value === opening.employmentType)?.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${
                        opening.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-ink/70 text-cream'
                      }`}
                    >
                      {opening.isActive ? 'Publicado' : 'Oculto'}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl leading-tight">{opening.title}</h3>
                  {opening.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink/55">{opening.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-ink/45 hover:bg-sand/60 hover:text-ink"
                    onClick={() => openEdit(opening)}
                    aria-label="Editar puesto"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                    onClick={() => setDeleteTarget(opening)}
                    aria-label="Eliminar puesto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Editar puesto' : 'Nuevo puesto'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-ghost text-ink/60" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" form="career-form" className="btn-primary" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : null}
              Guardar
            </button>
          </>
        }
      >
        <form id="career-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="career-title" className="label">
              Puesto
            </label>
            <input
              id="career-title"
              className="field"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Bartender"
            />
          </div>
          <div>
            <label htmlFor="career-description" className="label">
              Descripción
            </label>
            <textarea
              id="career-description"
              className="field min-h-28 resize-y"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Qué incluye el puesto, horario, requisitos confirmados…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="career-type" className="label">
                Tipo
              </label>
              <select
                id="career-type"
                className="field"
                value={form.employmentType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    employmentType: event.target.value as FormState['employmentType'],
                  }))
                }
              >
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="career-order" className="label">
                Orden
              </label>
              <input
                id="career-order"
                type="number"
                min="0"
                className="field"
                value={form.sortOrder}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/65">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 accent-forest"
            />
            Visible en la página de empleos
          </label>
          {formError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{formError}</p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Eliminar puesto"
        onClose={() => setDeleteTarget(null)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn-ghost text-ink/60" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary bg-rose-600 hover:bg-rose-700"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner className="h-4 w-4" /> : null}
              Eliminar
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink/60">
          ¿Eliminar <strong className="text-ink">{deleteTarget?.title}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
