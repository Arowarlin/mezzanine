import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminGalleryImage } from '../../lib/types'
import { PageHeader } from '../../components/admin/PageHeader'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { SmartImage } from '../../components/ui/SmartImage'

const CATEGORIES = [
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'space', label: 'El salón' },
  { value: 'food', label: 'Comida' },
  { value: 'drinks', label: 'Bebidas' },
  { value: 'other', label: 'Otra' },
]

type FormState = {
  url: string
  title: string
  category: string
  sortOrder: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  url: '',
  title: '',
  category: 'rooftop',
  sortOrder: '0',
  isActive: true,
}

export function AdminGalleryPage() {
  const [images, setImages] = useState<AdminGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGalleryImage | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api<{ images: AdminGalleryImage[] }>('/api/admin/gallery')
      setImages(data.images)
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
    setForm({ ...EMPTY_FORM, sortOrder: String(images.length + 1) })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (image: AdminGalleryImage) => {
    setEditing(image)
    setForm({
      url: image.url,
      title: image.title ?? '',
      category: image.category,
      sortOrder: String(image.sortOrder),
      isActive: image.isActive,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (!form.url.trim()) {
      setFormError('Sube o pega la URL de una imagen.')
      return
    }

    setSaving(true)
    const payload = {
      url: form.url.trim(),
      title: form.title.trim(),
      category: form.category,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }

    try {
      if (editing) {
        const data = await api<{ image: AdminGalleryImage }>(`/api/admin/gallery/${editing.id}`, {
          method: 'PATCH',
          body: payload,
        })
        setImages((current) => current.map((image) => (image.id === editing.id ? data.image : image)))
        setNotice('Imagen actualizada.')
      } else {
        const data = await api<{ image: AdminGalleryImage }>('/api/admin/gallery', {
          method: 'POST',
          body: payload,
        })
        setImages((current) => [...current, data.image])
        setNotice('Imagen agregada.')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (image: AdminGalleryImage) => {
    setBusyId(image.id)
    setError('')
    try {
      const data = await api<{ image: AdminGalleryImage }>(`/api/admin/gallery/${image.id}`, {
        method: 'PATCH',
        body: { isActive: !image.isActive },
      })
      setImages((current) => current.map((item) => (item.id === image.id ? data.image : item)))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await api(`/api/admin/gallery/${deleteTarget.id}`, { method: 'DELETE' })
      setImages((current) => current.filter((image) => image.id !== deleteTarget.id))
      setNotice('Imagen eliminada.')
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
        title="Galería"
        description="Fotos del sitio público. En esta demo son imágenes ilustrativas; sustitúyelas por material autorizado de Mezzanine."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva imagen
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
        <PageLoader label="Cargando galería" />
      ) : images.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line/70 bg-white/60 p-10 text-center">
          <ImagePlus className="mx-auto h-8 w-8 text-ink/30" />
          <p className="mt-4 text-sm text-ink/55">Todavía no hay imágenes. Agrega la primera.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-2xl border border-line/70 bg-white/60">
              <div className="relative">
                <SmartImage
                  src={image.url}
                  alt={image.title ?? 'Imagen de galería'}
                  className="aspect-[4/3] w-full"
                  imgClassName="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${
                    image.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-ink/70 text-cream'
                  }`}
                >
                  {image.isActive ? 'Visible' : 'Oculta'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{image.title || 'Sin título'}</p>
                  <p className="mt-1 text-[0.66rem] uppercase tracking-[0.12em] text-ink/40">
                    {CATEGORIES.find((item) => item.value === image.category)?.label ?? image.category} · #{image.sortOrder}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-ink/45 hover:bg-sand/60 hover:text-ink"
                    onClick={() => openEdit(image)}
                    aria-label="Editar imagen"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-ink/45 hover:bg-sand/60 hover:text-ink"
                    onClick={() => toggleActive(image)}
                    disabled={busyId === image.id}
                    aria-label={image.isActive ? 'Ocultar imagen' : 'Mostrar imagen'}
                  >
                    {busyId === image.id ? (
                      <Spinner className="h-4 w-4" />
                    ) : image.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                    onClick={() => setDeleteTarget(image)}
                    aria-label="Eliminar imagen"
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
        title={editing ? 'Editar imagen' : 'Nueva imagen'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-ghost text-ink/60" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" form="gallery-form" className="btn-primary" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : null}
              Guardar
            </button>
          </>
        }
      >
        <form id="gallery-form" onSubmit={handleSave} className="space-y-4">
          <ImageUploader value={form.url} onChange={(url) => setForm((current) => ({ ...current, url }))} />
          <div>
            <label htmlFor="gallery-title" className="label">
              Título
            </label>
            <input
              id="gallery-title"
              className="field"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="La terraza al atardecer"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gallery-category" className="label">
                Categoría
              </label>
              <select
                id="gallery-category"
                className="field"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="gallery-order" className="label">
                Orden
              </label>
              <input
                id="gallery-order"
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
            Visible en la galería pública
          </label>
          {formError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{formError}</p>
          ) : null}
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Eliminar imagen"
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
          ¿Eliminar <strong className="text-ink">{deleteTarget?.title || 'esta imagen'}</strong>? Esta acción no se
          puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
