import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bike,
  Check,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
} from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { OrderResponse } from '../lib/types'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'
import { SmartImage } from '../components/ui/SmartImage'

type OrderType = 'delivery' | 'pickup'

export function OrderPage() {
  const { items, subtotalCents, setQuantity, removeItem, setNotes, clear } = useCart()
  const { settings, currency, whatsapp } = useSettings()

  const [type, setType] = useState<OrderType>('delivery')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setOrderNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OrderResponse | null>(null)

  const deliveryFeeCents = type === 'delivery' ? Number(settings?.delivery_fee_cents ?? 15000) : 0
  const minOrderCents = Number(settings?.min_order_cents ?? 0)
  const totalCents = subtotalCents + deliveryFeeCents
  const belowMinimum = type === 'delivery' && minOrderCents > 0 && subtotalCents < minOrderCents

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Tu carrito está vacío.')
      return
    }
    if (type === 'delivery' && address.trim().length < 8) {
      setError('Escribe una dirección completa para la entrega.')
      return
    }
    if (belowMinimum) {
      setError(`El pedido mínimo para entrega es ${formatMoney(minOrderCents, currency)}.`)
      return
    }

    setSubmitting(true)
    try {
      const data = await api<OrderResponse>('/api/public/orders', {
        method: 'POST',
        body: {
          customer: { name, phone, email: email.trim() ? email : '' },
          type,
          address: type === 'delivery' ? address : undefined,
          notes: notes.trim() ? notes : undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes.trim() ? item.notes : undefined,
          })),
        },
      })
      setResult(data)
      clear()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <section className="container-page pb-20 pt-36 sm:pt-44">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-gold/40 bg-white/80 p-8 shadow-soft sm:p-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
              <Check className="h-7 w-7" />
            </span>
            <p className="eyebrow mt-6">Pedido registrado</p>
            <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">
              Gracias, <em className="text-moss">falta un paso</em>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Tu pedido <strong className="text-ink">{result.order.code}</strong> quedó guardado con el total de{' '}
              <strong className="text-ink">{formatMoney(result.order.totalCents, currency)}</strong>. Para que la
              cocina lo reciba ahora mismo, envíalo por WhatsApp con el botón de abajo.
            </p>

            <dl className="mt-6 grid gap-4 rounded-2xl bg-sand/40 p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Código</dt>
                <dd className="mt-1 font-semibold tracking-wide">{result.order.code}</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Tipo</dt>
                <dd className="mt-1 font-semibold">
                  {result.order.type === 'delivery' ? 'Entrega a domicilio' : 'Recogida en el restaurante'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Subtotal</dt>
                <dd className="mt-1 font-semibold">{formatMoney(result.order.subtotalCents, currency)}</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Envío</dt>
                <dd className="mt-1 font-semibold">{formatMoney(result.order.deliveryFeeCents, currency)}</dd>
              </div>
              <div className="sm:col-span-2 border-t border-line/60 pt-3">
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Total</dt>
                <dd className="mt-1 text-xl font-bold">{formatMoney(result.order.totalCents, currency)}</dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1">
                <MessageCircle className="h-4 w-4" />
                Enviar pedido por WhatsApp
              </a>
              <Link to="/menu" className="btn-ghost text-forest">
                Volver al menú
              </Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink/40">
              Si el botón no abre WhatsApp, escríbenos al {settings?.phone ?? '+1 809 555 0142'} indicando el código{' '}
              {result.order.code}.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="container-page flex min-h-[70vh] flex-col items-center justify-center pb-20 pt-36 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-forest">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-4xl">Tu carrito está vacío</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/55">
          Añade platos desde el menú y vuelve aquí para completar el pedido. También puedes reservar una mesa.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/menu" className="btn-primary">
            Ver el menú
          </Link>
          <Link to="/reservaciones" className="btn-ghost text-forest">
            Reservar una mesa
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container-page pb-20 pt-32 sm:pt-40">
      <Link
        to="/menu"
        className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink/45 transition hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Seguir eligiendo
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Pedido en línea</p>
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">Finaliza tu pedido</h1>
        </div>
        <p className="text-sm text-ink/50">
          {itemCount} artículo{itemCount === 1 ? '' : 's'} en el carrito
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="space-y-8">
          <div className="card overflow-hidden">
            <div className="border-b border-line/60 px-5 py-4">
              <h2 className="text-2xl">Tu pedido</h2>
            </div>
            <ul className="divide-y divide-line/40">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 p-5">
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
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">¿Cómo lo quieres?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setType('delivery')}
                className={`rounded-2xl border p-5 text-left transition ${
                  type === 'delivery'
                    ? 'border-forest bg-forest text-cream'
                    : 'border-line bg-white/60 text-ink hover:border-gold'
                }`}
                aria-pressed={type === 'delivery'}
              >
                <Bike className="h-5 w-5" />
                <p className="mt-3 text-lg font-semibold">Entrega a domicilio</p>
                <p className={`mt-1 text-xs ${type === 'delivery' ? 'text-cream/65' : 'text-ink/50'}`}>
                  Envío {formatMoney(Number(settings?.delivery_fee_cents ?? 15000), currency)}
                  {minOrderCents > 0
                    ? ` · mínimo ${formatMoney(minOrderCents, currency)}`
                    : ''}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setType('pickup')}
                className={`rounded-2xl border p-5 text-left transition ${
                  type === 'pickup'
                    ? 'border-forest bg-forest text-cream'
                    : 'border-line bg-white/60 text-ink hover:border-gold'
                }`}
                aria-pressed={type === 'pickup'}
              >
                <Store className="h-5 w-5" />
                <p className="mt-3 text-lg font-semibold">Recogida en el restaurante</p>
                <p className={`mt-1 text-xs ${type === 'pickup' ? 'text-cream/65' : 'text-ink/50'}`}>
                  Sin costo de envío · {settings?.address ?? 'Piantini, Santo Domingo'}
                </p>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl">Tus datos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="order-name" className="label">
                  Nombre completo
                </label>
                <input
                  id="order-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field"
                  placeholder="María Fernández"
                  minLength={2}
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label htmlFor="order-phone" className="label">
                  Teléfono
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="field"
                  placeholder="809 555 0000"
                  minLength={7}
                  maxLength={30}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="order-email" className="label">
                  Correo <span className="normal-case tracking-normal text-ink/35">(opcional)</span>
                </label>
                <input
                  id="order-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="field"
                  placeholder="tu@correo.com"
                  maxLength={160}
                />
              </div>
              {type === 'delivery' ? (
                <div className="sm:col-span-2">
                  <label htmlFor="order-address" className="label">
                    Dirección de entrega
                  </label>
                  <input
                    id="order-address"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="field"
                    placeholder="Calle, número, sector, referencia"
                    minLength={8}
                    maxLength={300}
                    required
                  />
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <label htmlFor="order-notes" className="label">
                  Notas del pedido <span className="normal-case tracking-normal text-ink/35">(opcional)</span>
                </label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  className="field min-h-24 resize-y"
                  placeholder="Alergias, instrucciones de entrega, cubiertos…"
                  maxLength={1000}
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-3xl border border-line/70 bg-white/75 p-6 shadow-soft">
            <h2 className="text-2xl">Resumen</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Subtotal</dt>
                <dd className="font-semibold">{formatMoney(subtotalCents, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/55">Envío</dt>
                <dd className="font-semibold">{formatMoney(deliveryFeeCents, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line/60 pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="text-xl font-bold">{formatMoney(totalCents, currency)}</dd>
              </div>
            </dl>

            {belowMinimum ? (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                Te faltan {formatMoney(minOrderCents - subtotalCents, currency)} para llegar al mínimo de entrega.
                Añade algo más o cambia a recogida.
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-800">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={submitting || belowMinimum} className="btn-primary mt-5 w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              {submitting ? 'Guardando pedido…' : 'Confirmar y enviar'}
            </button>
            <p className="mt-3 text-[0.68rem] leading-relaxed text-ink/40">
              Al confirmar guardamos el pedido y abrimos WhatsApp con el detalle para que la cocina lo reciba.
              El pago se coordina al entregar.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] text-forest/70 transition hover:text-forest"
            >
              ¿Dudas? Escríbenos
            </a>
          </div>
        </aside>
      </form>
    </section>
  )
}
