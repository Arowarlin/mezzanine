import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminCategory } from '../../lib/types'
import { PageHeader } from '../../components/admin/PageHeader'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { SmartImage } from '../../components/ui/SmartImage'

type FormState = {
  name: string
  description: string
  imageUrl: string
  sortOrder: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  imageUrl: '',
  sortOrder: '0',
  isActive: true,
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api<{ categories: AdminCategory[] }>('/api/admin/categories')
      setCategories(data.categories)
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
    setForm({ ...EMPTY_FORM, sortOrder: String(categories.length) })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditing(category)
    setForm({
      name: category.name,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('Escribe el nombre de la categoría.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }

    try {
      if (editing) {
        const data = await api<{ category: AdminCategory }>(`/api/admin/categories/${editing.id}`, {
          method: 'PATCH',
          body: payload,
        })
        setCategories((current) =>
          current.map((category) => (category.id === editing.id ? data.category : category)),
        )
        setNotice('Categoría actualizada.')
      } else {
        const data = await api<{ category: AdminCategory }>('/api/admin/categories', {
          method: 'POST',
          body: payload,
        })
        setCategories((current) => [...current, data.category])
        setNotice('Categoría creada.')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (category: AdminCategory) => {
    setBusyId(category.id)
    setError('')
    try {
      const data = await api<{ category: AdminCategory }>(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        body: { isActive: !category.isActive },
      })
      setCategories((current) => current.map((item) => (item.id === category.id ? data.category : item)))
      setNotice(data.category.isActive ? `${data.category.name} visible en el sitio.` : `${data.category.name} oculta.`)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await api<void>(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
      setCategories((current) => current.filter((category) => category.id !== deleteTarget.id))
      setNotice('Categoría eliminada.')
      setDeleteTarget(null)
    } catch (err) {
      setError(errorMessage(err))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader label="Cargando categorías…" />

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Carta"
        title="Categorías"
        description="Agrupa el menú y controla qué secciones aparecen en el sitio."
        actions={
          <button type="button" onClick={openCreate} className="btn-primary px-4 py-2.5 text-[0.7rem]">
            <Plus className="h-4 w-4" />
            Nueva categoría
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.id} className="overflow-hidden rounded-2xl border border-line/70 bg-white/70">
            <SmartImage
              src={category.imageUrl}
              alt={category.name}
              className="aspect-[16/9] w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl leading-tight">{category.name}</h2>
                  <p className="mt-0.5 truncate text-xs text-ink/40">/{category.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(category)}
                  disabled={busyId === category.id}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                    category.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {busyId === category.id ? '…' : category.isActive ? 'Activa' : 'Oculta'}
                </button>
              </div>

              <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-ink/55">
                {category.description || 'Sin descripción.'}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-line/50 pt-4">
                <span className="text-xs text-ink/45">
                  {category.productCount ?? 0} plato{(category.productCount ?? 0) === 1 ? '' : 's'}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="rounded-lg p-2 text-ink/45 transition hover:bg-sand hover:text-ink"
                    aria-label={`Editar ${category.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(category)}
                    className="rounded-lg p-2 text-ink/45 transition hover:bg-rose-50 hover:text-rose-700"
                    aria-label={`Eliminar ${category.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost px-4 py-2 text-[0.7rem] text-forest">
              Cancelar
            </button>
            <button type="submit" form="category-form" disabled={saving} className="btn-primary px-4 py-2 text-[0.7rem]">
              {saving ? <Spinner className="h-4 w-4" /> : null}
              {saving ? 'Guardando…' : 'Guardar categoría'}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
            <div>
              <label htmlFor="category-name" className="label">
                Nombre
              </label>
              <input
                id="category-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="field"
                placeholder="Entradas"
                maxLength={120}
                required
              />
            </div>
            <div>
              <label htmlFor="category-order" className="label">
                Orden
              </label>
              <input
                id="category-order"
                type="number"
                min="0"
                step="1"
                value={form.sortOrder}
                onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                className="field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category-description" className="label">
              Descripción
            </label>
            <textarea
              id="category-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="field min-h-20 resize-y"
              placeholder="Qué comparten estos platos…"
              maxLength={1000}
            />
          </div>

          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm((current) => ({ ...current, imageUrl: url }))}
            label="Imagen de la categoría"
          />

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 accent-forest"
            />
            Visible en el sitio
          </label>

          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {formError}
            </div>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar categoría"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="btn-ghost px-4 py-2 text-[0.7rem] text-forest">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn bg-rose-700 px-4 py-2 text-[0.7rem] text-white hover:bg-rose-800"
            >
              {deleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink/65">
          Vas a eliminar <strong className="text-ink">{deleteTarget?.name}</strong>. Solo es posible si no tiene platos
          asignados.
        </p>
      </Modal>
    </div>
  )
}
