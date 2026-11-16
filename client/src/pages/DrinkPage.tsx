import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Beer, Martini, Wine } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { MenuType, Product } from '../lib/types'
import { DRINK_TABS } from '../lib/site'
import { formatMoney } from '../lib/format'
import { useSettings } from '../context/SettingsContext'
import { ProductCard } from '../components/menu/ProductCard'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'
import { SmartImage } from '../components/ui/SmartImage'

type DrinkMenu = Extract<MenuType, 'cocktails' | 'beer' | 'wine'>

const WINE_GROUPS: Array<{ label: string; match: (product: Product) => boolean }> = [
  {
    label: 'Rosé & bubbly',
    match: (product) => /rosé|cava|sparkling/i.test(`${product.ingredients ?? ''} ${product.description ?? ''}`),
  },
  {
    label: 'White',
    match: (product) =>
      /sauvignon|pinot grigio|chardonnay|riesling/i.test(product.ingredients ?? ''),
  },
  {
    label: 'Red',
    match: (product) =>
      /pinot noir|red blend|cabernet|malbec|tempranillo/i.test(product.ingredients ?? ''),
  },
]

export function DrinkPage() {
  const { currency } = useSettings()
  const [tab, setTab] = useState<DrinkMenu>('cocktails')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api<{ products: Product[] }>(`/api/public/products?menu=${tab}`)
      .then((data) => {
        if (active) setProducts(data.products)
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
  }, [tab])

  const activeTab = DRINK_TABS.find((item) => item.id === tab)!

  const wineGroups = useMemo(() => {
    if (tab !== 'wine') return []
    return WINE_GROUPS.map((group) => ({
      label: group.label,
      items: products.filter((product) => group.match(product)),
    })).filter((group) => group.items.length > 0)
  }, [products, tab])

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-14 pt-36 text-cream sm:pb-16 sm:pt-44">
        <SmartImage
          src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1800&q=80"
          alt="Behind the bar"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-35"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/45" />
        <div className="container-page relative">
          <p className="eyebrow">The bar</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Drink <em className="text-gold">slowly</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/70">
            Handcrafted cocktails, Wisconsin beer and cider, and a short wine list. Ingredient lists, styles, and
            origins come from the official menu; prices are samples for this demo.
          </p>

          <div className="mt-8 inline-flex flex-wrap rounded-full border border-cream/20 bg-cream/5 p-1">
            {DRINK_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-full px-5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] transition-colors ${
                  tab === item.id ? 'bg-cream text-ink' : 'text-cream/65 hover:text-cream'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line/70 bg-sand/35">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-[0.68rem] text-ink/55">
          <span className="flex items-center gap-2">
            {tab === 'cocktails' ? (
              <Martini className="h-3.5 w-3.5 text-clay" />
            ) : tab === 'beer' ? (
              <Beer className="h-3.5 w-3.5 text-clay" />
            ) : (
              <Wine className="h-3.5 w-3.5 text-clay" />
            )}
            {activeTab.blurb} Prices are sample values, not confirmed menu prices.
          </span>
          <Link to="/order" className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em] text-clay">
            Try the demo pre-order
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        {loading ? (
          <PageLoader label="Loading the drink list" />
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-clay/30 bg-clay/5 p-6 text-center text-sm text-clay">
            {error}
          </div>
        ) : tab === 'cocktails' ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 70}>
                <ProductCard product={product} currency={currency} />
              </Reveal>
            ))}
          </div>
        ) : tab === 'beer' ? (
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-x-14 sm:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="menu-row">
                  <div className="min-w-0">
                    <p className="font-display text-xl leading-snug">{product.name}</p>
                    <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/40">
                      {product.description}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">{product.origin}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">{formatMoney(product.priceCents, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-12">
            {wineGroups.map((group) => (
              <div key={group.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-3xl">{group.label}</h2>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink/35">
                    Sample glass price
                  </span>
                </div>
                <div className="mt-4 grid gap-x-14 sm:grid-cols-2">
                  {group.items.map((product) => (
                    <div key={product.id} className="menu-row">
                      <div className="min-w-0">
                        <p className="font-display text-xl leading-snug">{product.name}</p>
                        <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/40">
                          {product.ingredients}
                          {product.description ? ` · ${product.description}` : ''}
                        </p>
                        <p className="mt-1 text-xs text-ink/50">{product.origin}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatMoney(product.priceCents, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-sand/45 py-16 lg:py-20">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Before the drinks</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Start with <em className="text-clay">dinner</em>.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              Lunch and dinner menus, from whitefish chowder to the Mezzanine burger.
            </p>
          </div>
          <Link to="/eat" className="btn-primary">
            See the kitchen menu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
