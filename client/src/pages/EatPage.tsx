import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Info, UtensilsCrossed } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { Category, MenuType, Product } from '../lib/types'
import { EAT_TABS } from '../lib/site'
import { formatMoney } from '../lib/format'
import { useSettings } from '../context/SettingsContext'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'
import { SmartImage } from '../components/ui/SmartImage'

type EatMenu = Extract<MenuType, 'lunch' | 'dinner'>

export function EatPage() {
  const { currency } = useSettings()
  const [menu, setMenu] = useState<EatMenu>('lunch')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api<{ categories: Category[] }>('/api/public/categories')
      .then((data) => {
        if (active) setCategories(data.categories.filter((category) => category.kind === 'food'))
      })
      .catch(() => {
        /* el menú puede cargar sin categorías */
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api<{ products: Product[] }>(`/api/public/products?menu=${menu}`)
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
  }, [menu])

  const grouped = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: products.filter((product) => product.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0)
  }, [categories, products])

  const activeTab = EAT_TABS.find((tab) => tab.id === menu)!

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-14 pt-36 text-cream sm:pb-16 sm:pt-44">
        <SmartImage
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80"
          alt="Plates for the table"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-30"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/50" />
        <div className="container-page relative">
          <p className="eyebrow">The kitchen</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Eat <em className="text-gold">upstairs</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/70">
            Lunch and dinner at Mezzanine. Item names come from recent public menus; descriptions and prices are
            pending confirmation from the restaurant.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-cream/20 bg-cream/5 p-1">
            {EAT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMenu(tab.id)}
                className={`rounded-full px-6 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] transition-colors ${
                  menu === tab.id ? 'bg-cream text-ink' : 'text-cream/65 hover:text-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line/70 bg-sand/35">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-[0.68rem] text-ink/55">
          <span className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-clay" />
            {activeTab.blurb} Prices are pending confirmation and are not charged anywhere in this demo.
          </span>
          <Link to="/drink" className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.12em] text-clay">
            See the drink list
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        {loading ? (
          <PageLoader label="Loading the menu" />
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-clay/30 bg-clay/5 p-6 text-center text-sm text-clay">
            {error}
          </div>
        ) : grouped.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-line/70 bg-white/60 p-10 text-center">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-ink/30" />
            <p className="mt-4 text-sm text-ink/60">This menu is being updated. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-16 lg:space-y-24">
            {grouped.map((group, index) => (
              <Reveal key={group.category.id}>
                <div
                  className={`grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14 ${
                    index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div className="relative overflow-hidden rounded-[1.75rem]">
                    <SmartImage
                      src={group.category.imageUrl}
                      alt={group.category.name}
                      className="aspect-[4/3] w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                      <div>
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold">
                          {String(index + 1).padStart(2, '0')} · {menu}
                        </p>
                        <h2 className="mt-1 font-display text-3xl text-cream">{group.category.name}</h2>
                      </div>
                      <span className="rounded-full bg-cream/10 px-3 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-cream/60 backdrop-blur">
                        Illustrative
                      </span>
                    </div>
                  </div>

                  <div>
                    {group.category.description ? (
                      <p className="mb-5 max-w-lg text-sm leading-relaxed text-ink/55">
                        {group.category.description}
                      </p>
                    ) : null}
                    <div className="grid gap-x-10 sm:grid-cols-2">
                      {group.items.map((product) => (
                        <div key={product.id} className="menu-row">
                          <div className="min-w-0">
                            <p className="font-display text-xl leading-snug">{product.name}</p>
                            {product.description ? (
                              <p className="mt-1 text-xs leading-relaxed text-ink/50">{product.description}</p>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-right">
                            {product.priceCents > 0 ? (
                              <span className="text-sm font-semibold">
                                {formatMoney(product.priceCents, currency)}
                              </span>
                            ) : (
                              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink/35">
                                Price pending
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="bg-ink py-16 text-cream lg:py-20">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Keep the evening going</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              The bar is <em className="text-gold">open</em>.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-cream/60">
              Cocktails, Wisconsin beer and cider, and a short wine list — all with sample pricing in this demo.
            </p>
          </div>
          <Link to="/drink" className="btn-gold">
            Explore drinks
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
