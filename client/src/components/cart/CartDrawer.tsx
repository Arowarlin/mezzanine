import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { formatMoney } from '../../lib/format'
import { SmartImage } from '../ui/SmartImage'

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, setNotes, subtotalCents, count } = useCart()
  const { currency } = useSettings()

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[65]">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside className="drawer-enter absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-soft">
        <header className="flex items-center justify-between border-b border-line/70 px-6 py-5">
          <div>
            <p className="eyebrow">Tu pedido</p>
            <h2 className="mt-1 text-3xl">
              {count === 0 ? 'Carrito vacío' : `${count} artículo${count === 1 ? '' : 's'}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-ink/50 transition hover:bg-sand hover:text-ink"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-forest">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <p className="text-sm leading-relaxed text-ink/60">
              Todavía no has añadido nada. El menú cambia con la pesca del día.
            </p>
            <Link to="/menu" onClick={closeCart} className="btn-primary">
              Ver el menú
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 border-b border-line/50 pb-5">
                  <SmartImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                    imgClassName="h-full w-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold leading-snug">{item.name}</p>
                        <p className="mt-0.5 text-xs text-ink/50">
                          {formatMoney(item.priceCents, currency)} c/u
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-full p-1.5 text-ink/35 transition hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Quitar ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-line bg-white/70">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="rounded-full p-2 text-ink/60 transition hover:text-ink"
                          aria-label="Restar uno"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="rounded-full p-2 text-ink/60 transition hover:text-ink"
                          aria-label="Sumar uno"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold">
                        {formatMoney(item.priceCents * item.quantity, currency)}
                      </p>
                    </div>

                    <input
                      type="text"
                      value={item.notes}
                      onChange={(event) => setNotes(item.productId, event.target.value)}
                      placeholder="Observación para este plato"
                      className="mt-3 w-full rounded-lg border border-line/70 bg-white/60 px-3 py-2 text-xs outline-none transition placeholder:text-ink/30 focus:border-gold"
                      maxLength={300}
                    />
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-line/70 bg-sand/30 px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/60">Subtotal</span>
                <span className="text-lg font-bold">{formatMoney(subtotalCents, currency)}</span>
              </div>
              <p className="mt-1 text-[0.68rem] leading-relaxed text-ink/45">
                El costo de envío se calcula al finalizar. El pedido se guarda y se envía por WhatsApp.
              </p>
              <Link to="/pedido" onClick={closeCart} className="btn-primary mt-4 w-full">
                Finalizar pedido
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
