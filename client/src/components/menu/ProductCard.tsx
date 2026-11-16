import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { Product } from '../../lib/types'
import { formatMoney } from '../../lib/format'
import { useCart } from '../../context/CartContext'
import { SmartImage } from '../ui/SmartImage'

type ProductCardProps = {
  product: Product
  currency: string
}

export function ProductCard({ product, currency }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const priced = product.priceCents > 0

  const handleAdd = () => {
    if (!priced) return
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line/70 bg-white/60 transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <p className="absolute bottom-4 left-5 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-cream/85">
          {product.categoryName}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl leading-tight">{product.name}</h3>
        {product.ingredients ? (
          <p className="mt-2 text-xs leading-relaxed text-ink/55">{product.ingredients}</p>
        ) : null}
        {product.origin ? (
          <p className="mt-2 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-ink/40">
            {product.origin}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {priced ? (
            <span className="text-sm font-semibold text-ink">{formatMoney(product.priceCents, currency)}</span>
          ) : (
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink/40">At the bar</span>
          )}

          {priced ? (
            <button
              type="button"
              onClick={handleAdd}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.66rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                added ? 'bg-moss text-cream' : 'bg-forest text-cream hover:bg-moss'
              }`}
            >
              {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {added ? 'Added' : 'Add'}
            </button>
          ) : (
            <span className="text-[0.62rem] uppercase tracking-[0.12em] text-ink/35">Ask your server</span>
          )}
        </div>
      </div>
    </article>
  )
}
