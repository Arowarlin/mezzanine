import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { Category, Product } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { ProductCard } from '../components/menu/ProductCard'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function MenuPage() {
  const { currency } = useSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [onlyFeatured, setOnlyFeatured] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      api<{ products: Product[] }>('/api/public/products'),
      api<{ categories: Category[] }>('/api/public/categories'),
    ])
      .then(([productData, categoryData]) => {
        if (!active) return
        setProducts(productData.products)
        setCategories(categoryData.categories)
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const term = normalize(query.trim())
    return products.filter((product) => {
      if (category !== 'all' && product.categorySlug !== category) return false
      if (onlyFeatured && !product.isFeatured) return false
      if (!term) return true
      return normalize(`${product.name} ${product.description ?? ''}`).includes(term)
    })
  }, [products, query, category, onlyFeatured])

  const grouped = useMemo(() => {
    if (category !== 'all' || query.trim()) return null
    return categories
      .map((item) => ({
        category: item,
        items: filtered.filter((product) => product.categoryId === item.id),
      }))
      .filter((group) => group.items.length > 0)
  }, [categories, filtered, category, query])

  return (
    <>
      <section className="bg-forest pb-16 pt-36 text-cream sm:pb-20 sm:pt-44">
        <div className="container-page">
          <p className="eyebrow">Carta de temporada</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-7xl">
            El menú de <em className="text-gold">la casa</em>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/65 sm:text-base">
            Cambia con la pesca y con lo que llega del campo. Si tienes una alergia o una restricción,
            escríbenos antes de pedir: la cocina se adapta.
          </p>
        </div>
      </section>

      <div className="sticky top-[64px] z-30 border-b border-line/70 bg-cream/95 backdrop-blur-md">
        <div className="container-page flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en el menú…"
              className="field py-2.5 pl-11 pr-10"
              aria-label="Buscar en el menú"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/35 hover:text-ink"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] transition ${
                category === 'all'
                  ? 'bg-forest text-cream'
                  : 'border border-line bg-white/60 text-ink/60 hover:border-forest/30 hover:text-ink'
              }`}
            >
              Todo
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] transition ${
                  category === item.slug
                    ? 'bg-forest text-cream'
                    : 'border border-line bg-white/60 text-ink/60 hover:border-forest/30 hover:text-ink'
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnlyFeatured((value) => !value)}
              className={`ml-1 flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] transition ${
                onlyFeatured
                  ? 'border-gold bg-gold/20 text-forest'
                  : 'border-line bg-white/60 text-ink/60 hover:border-gold/50'
              }`}
              aria-pressed={onlyFeatured}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Destacados
            </button>
          </div>
        </div>
      </div>

      <section className="container-page py-14 sm:py-20">
        {loading ? <PageLoader label="Cargando el menú…" /> : null}

        {!loading && error ? (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <p className="font-display text-3xl">No encontramos ese plato</p>
            <p className="mt-3 text-sm text-ink/55">
              Prueba con otra palabra o quita los filtros. El menú completo está a un clic.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCategory('all')
                setOnlyFeatured(false)
              }}
              className="btn-primary mt-6"
            >
              Ver todo el menú
            </button>
          </div>
        ) : null}

        {!loading && !error && grouped ? (
          <div className="space-y-16">
            {grouped.map((group) => (
              <div key={group.category.id}>
                <Reveal>
                  <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line/70 pb-4">
                    <div>
                      <h2 className="text-3xl">{group.category.name}</h2>
                      {group.category.description ? (
                        <p className="mt-1 text-sm text-ink/50">{group.category.description}</p>
                      ) : null}
                    </div>
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink/35">
                      {group.items.length} plato{group.items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </Reveal>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((product, index) => (
                    <Reveal key={product.id} delay={index * 50}>
                      <ProductCard product={product} currency={currency} />
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !error && !grouped ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, index) => (
              <Reveal key={product.id} delay={index * 40}>
                <ProductCard product={product} currency={currency} />
              </Reveal>
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
