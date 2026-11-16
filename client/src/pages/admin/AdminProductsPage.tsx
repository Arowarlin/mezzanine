import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import type { AdminCategory, AdminProduct } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { formatMoney } from '../../lib/format'
import { PageHeader } from '../../components/admin/PageHeader'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { Modal } from '../../components/ui/Modal'
import { PageLoader, Spinner } from '../../components/ui/Spinner'
import { SmartImage } from '../../components/ui/SmartImage'

type FormState = {
  name: string
  categoryId: string
  menuType: string
  price: string
  description: string
  ingredients: string
  origin: string
  imageUrl: string
  isFeatured: boolean
  isAvailable: boolean
  sortOrder: string
}

const EMPTY_FORM: FormState = {
  name: '',
  categoryId: '',
  menuType: '',
  price: '',
  description: '',
  ingredients: '',
  origin: '',
  imageUrl: '',
  isFeatured: false,
  isAvailable: true,
  sortOrder: '0',
}

const MENU_TYPES = [
  { value: '', label: 'Sin tipo de menú' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'beer', label: 'Beer' },
  { value: 'wine', label: 'Wine' },
]

export function AdminProductsPage() {
  const { currency } = useSettings()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productData, categoryData] = await Promise.all([
        api<{ products: AdminProduct[] }>('/api/admin/products'),
        api<{ categories: AdminCategory[] }>('/api/admin/categories'),
      ])
      setProducts(productData.products)
      setCategories(categoryData.categories)
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

  const filtered = useMemo(() => {
    const term = query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
    if (!term) return products
    return products.filter((product) =>
      `${product.name} ${product.categoryName}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(term),
    )
  }, [products, query])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, categoryId: String(categories[0]?.id ?? '') })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (product: AdminProduct) => {
    setEditing(product)
    setForm({
      name: product.name,
      categoryId: String(product.categoryId),
      menuType: product.menuType ?? '',
      price: (product.priceCents / 100).toFixed(2),
      description: product.description ?? '',
      ingredients: product.ingredients ?? '',
      origin: product.origin ?? '',
      imageUrl: product.imageUrl ?? '',
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
      sortOrder: String(product.sortOrder),
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')

    const priceValue = Number(form.price.replace(',', '.'))
    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('Escribe el nombre del plato.')
      return
    }
    if (!form.categoryId) {
      setFormError('Selecciona una categoría.')
      return
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setFormError('El precio debe ser un número válido.')
      return
    }

    setSaving(true)
    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name.trim(),
      menuType: form.menuType,
      description: form.description.trim(),
      ingredients: form.ingredients.trim(),
      origin: form.origin.trim(),
      priceCents: Math.round(priceValue * 100),
      imageUrl: form.imageUrl.trim(),
      isFeatured: form.isFeatured,
      isAvailable: form.isAvailable,
      sortOrder: Number(form.sortOrder) || 0,
    }

    try {
      if (editing) {
        const data = await api<{ product: AdminProduct }>(`/api/admin/products/${editing.id}`, {
          method: 'PATCH',
          body: payload,
        })
        setProducts((current) =>
          current.map((product) => (product.id === editing.id ? data.product : product)),
        )
        setNotice('Plato actualizado.')
      } else {
        const data = await api<{ product: AdminProduct }>('/api/admin/products', {
          method: 'POST',
          body: payload,
        })
        setProducts((current) => [...current, data.product])
        setNotice('Plato creado.')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailable = async (product: AdminProduct) => {
    setBusyId(product.id)
    setError('')
    try {
      const data = await api<{ product: AdminProduct }>(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        body: { isAvailable: !product.isAvailable },
      })
      setProducts((current) => current.map((item) => (item.id === product.id ? data.product : item)))
      setNotice(data.product.isAvailable ? `${data.product.name} está disponible.` : `${data.product.name} se ocultó del menú.`)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const toggleFeatured = async (product: AdminProduct) => {
    setBusyId(product.id)
    setError('')
    try {
      const data = await api<{ product: AdminProduct }>(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        body: { isFeatured: !product.isFeatured },
      })
      setProducts((current) => current.map((item) => (item.id === product.id ? data.product : item)))
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
      await api<void>(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' })
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id))
      setNotice('Plato eliminado.')
      setDeleteTarget(null)
    } catch (err) {
      setError(errorMessage(err))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader label="Cargando productos…" />

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Carta"
        title="Productos"
        description="Precios, disponibilidad, imágenes y destacados del menú."
        actions={
          <button type="button" onClick={openCreate} className="btn-primary px-4 py-2.5 text-[0.7rem]">
            <Plus className="h-4 w-4" />
            Nuevo plato
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

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por plato o categoría…"
          className="field py-2.5 pl-11"
          aria-label="Buscar productos"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line/70 bg-white/70">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plato</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-lg"
                        imgClassName="h-full w-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{product.name}</p>
                        <p className="truncate text-xs text-ink/40">
                          {product.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-ink/60">
                    {product.categoryName}
                    {product.menuType ? (
                      <span className="ml-1.5 rounded-full bg-sand/70 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/50">
                        {product.menuType}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap font-semibold">
                    {product.priceCents > 0 ? (
                      formatMoney(product.priceCents, currency)
                    ) : (
                      <span className="chip chip-gold">Pendiente</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleAvailable(product)}
                      disabled={busyId === product.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                        product.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                      title="Cambiar disponibilidad"
                    >
                      {busyId === product.id ? <Spinner className="h-3 w-3" /> : null}
                      {product.isAvailable ? 'Disponible' : 'Oculto'}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(product)}
                      disabled={busyId === product.id}
                      className={`rounded-full p-1.5 transition disabled:opacity-50 ${
                        product.isFeatured ? 'text-gold hover:bg-gold/15' : 'text-ink/20 hover:text-gold'
                      }`}
                      aria-label={product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="rounded-lg p-2 text-ink/45 transition hover:bg-sand hover:text-ink"
                        aria-label={`Editar ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        className="rounded-lg p-2 text-ink/45 transition hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-ink/45">
                    No hay platos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar plato' : 'Nuevo plato'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost px-4 py-2 text-[0.7rem] text-forest">
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="btn-primary px-4 py-2 text-[0.7rem]"
            >
              {saving ? <Spinner className="h-4 w-4" /> : null}
              {saving ? 'Guardando…' : 'Guardar plato'}
            </button>
          </div>
        }
      >
        <form id="product-form" onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-name" className="label">
                Nombre
              </label>
              <input
                id="product-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="field"
                placeholder="Pan Fried Whitefish"
                maxLength={160}
                required
              />
            </div>
            <div>
              <label htmlFor="product-category" className="label">
                Categoría
              </label>
              <select
                id="product-category"
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="field"
                required
              >
                <option value="">Selecciona…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isActive ? '' : ' (inactiva)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-menu-type" className="label">
                Tipo de menú
              </label>
              <select
                id="product-menu-type"
                value={form.menuType}
                onChange={(event) => setForm((current) => ({ ...current, menuType: event.target.value }))}
                className="field"
              >
                {MENU_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-price" className="label">
                Precio ({currency})
              </label>
              <input
                id="product-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="field"
                placeholder="1450.00"
                required
              />
            </div>
            <div>
              <label htmlFor="product-order" className="label">
                Orden en el menú
              </label>
              <input
                id="product-order"
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
            <label htmlFor="product-description" className="label">
              Descripción
            </label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="field min-h-24 resize-y"
              placeholder="Notas de cata, estilo de cerveza o descripción del plato…"
              maxLength={2000}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-ingredients" className="label">
                Ingredientes / varietal
              </label>
              <textarea
                id="product-ingredients"
                value={form.ingredients}
                onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))}
                className="field min-h-20 resize-y"
                placeholder="Thai basil, blanco tequila, simple syrup, fresh lime…"
                maxLength={1000}
              />
            </div>
            <div>
              <label htmlFor="product-origin" className="label">
                Origen / productor
              </label>
              <input
                id="product-origin"
                value={form.origin}
                onChange={(event) => setForm((current) => ({ ...current, origin: event.target.value }))}
                className="field"
                placeholder="Founders Brewing Co. · Grand Rapids, Michigan"
                maxLength={160}
              />
            </div>
          </div>

          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm((current) => ({ ...current, imageUrl: url }))}
            label="Imagen del plato"
          />

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) => setForm((current) => ({ ...current, isAvailable: event.target.checked }))}
                className="h-4 w-4 accent-forest"
              />
              Disponible en el menú
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
                className="h-4 w-4 accent-gold"
              />
              Mostrar como destacado
            </label>
          </div>

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
        title="Eliminar plato"
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
              {deleting ? <Spinner className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {deleting ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink/65">
          Vas a eliminar <strong className="text-ink">{deleteTarget?.name}</strong>. Los pedidos anteriores conservan su
          nombre y precio como historial. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
