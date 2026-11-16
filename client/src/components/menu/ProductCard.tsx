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

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line/60 bg-white/60 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        {product.isFeatured ? (
          <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-forest backdrop-blur">
            Destacado
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleAdd}
          className={`absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
            added ? 'bg-forest text-cream' : 'bg-gold text-ink hover:scale-110 hover:bg-[#d0a96a]'
          }`}
          aria-label={`Añadir ${product.name} al carrito`}
        >
          {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold">
          {product.categoryName}
        </p>
        <h3 className="mt-1.5 text-2xl leading-tight">{product.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/55">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">{formatMoney(product.priceCents, currency)}</span>
          <button
            type="button"
            onClick={handleAdd}
            className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-forest transition hover:text-gold"
          >
            {added ? 'Añadido' : 'Añadir'}
          </button>
        </div>
      </div>
    </article>
  )
}
