import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Info, Moon, Plus, UtensilsCrossed } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { Category, MenuType, Product } from '../lib/types'
import { EAT_TABS } from '../lib/site'
import { formatMoney } from '../lib/format'
import { useSettings } from '../context/SettingsContext'
import { useCart } from '../context/CartContext'
import { PageLoader } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'
import { SmartImage } from '../components/ui/SmartImage'

type EatMenu = Extract<MenuType, 'lunch' | 'dinner'>

const FOOD_NOTES = {
  lateNight: 'Late night menu available after 9pm',
  cash: 'Menu prices reflect discounted cash payment price.',
  raw: '*Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness.',
}

function AddButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        addItem(product)
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1400)
      }}
      aria-label={`Add ${product.name} to the demo order`}
      className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition-colors ${
        added ? 'bg-moss text-cream' : 'border border-line text-ink/60 hover:border-forest hover:bg-forest hover:text-cream'
      }`}
    >
      {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      {added ? 'Added' : 'Add'}
    </button>
  )
}

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
          src="/photos/food-baja-ahi-tuna.jpg"
          alt="Baja ahi tuna at Mezzanine"
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
            Lunch and dinner at Mezzanine — Lake Michigan whitefish, seared ahi tuna and Door County cherries, served
            three stories above Horseshoe Bay.
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
            {activeTab.blurb}
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
                      {group.category.imageUrl?.endsWith('.svg') ? (
                        <span className="rounded-full bg-cream/10 px-3 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-cream/60 backdrop-blur">
                          Illustration
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0">
                    {group.category.description ? (
                      <p className="mb-5 max-w-lg text-sm leading-relaxed text-ink/55">
                        {group.category.description}
                      </p>
                    ) : null}
                    <div className="grid grid-cols-1 gap-x-10">
                      {group.items.map((product) => (
                        <div key={product.id} className="menu-row min-w-0 items-start">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl sm:h-[4.5rem] sm:w-[4.5rem]">
                            <SmartImage
                              src={product.imageUrl}
                              alt=""
                              className="h-full w-full"
                              imgClassName="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-xl leading-snug">{product.name}</p>
                            {product.description ? (
                              <p className="mt-1 text-xs leading-relaxed text-ink/50">{product.description}</p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                            {product.priceCents > 0 ? (
                              <>
                                <span className="text-sm font-semibold">
                                  {formatMoney(product.priceCents, currency)}
                                </span>
                                <AddButton product={product} />
                              </>
                            ) : (
                              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink/35">
                                Ask your server
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

        {!loading && !error && grouped.length > 0 ? (
          <div className="mx-auto mt-16 max-w-3xl space-y-2 border-t border-line/70 pt-8 text-center text-[0.7rem] leading-relaxed text-ink/45">
            <p className="flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.16em] text-ink/60">
              <Moon className="h-3.5 w-3.5 text-gold" />
              {FOOD_NOTES.lateNight}
            </p>
            <p>{FOOD_NOTES.cash}</p>
            <p>{FOOD_NOTES.raw}</p>
            <p>Photos from @mezzaninerooftop. Other dish images are illustrative and may not match the plate as served.</p>
          </div>
        ) : null}
      </section>

      <section className="bg-ink py-16 text-cream lg:py-20">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Keep the evening going</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              The bar is <em className="text-gold">open</em>.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-cream/60">
              Handcrafted cocktails, Wisconsin beer and cider, and a short wine list.
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
