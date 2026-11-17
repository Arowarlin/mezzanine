import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Info, Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { OrderResponse } from '../lib/types'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'
import { SmartImage } from '../components/ui/SmartImage'

export function OrderPage() {
  const { items, subtotalCents, setQuantity, removeItem, clear } = useCart()
  const { settings, currency } = useSettings()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OrderResponse['order'] | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Your demo order is empty.')
      return
    }
    if (name.trim().length < 2) {
      setError('Enter your name.')
      return
    }
    if (phone.trim().length < 7) {
      setError('Enter a phone number.')
      return
    }

    setSubmitting(true)
    try {
      const data = await api<OrderResponse>('/api/public/orders', {
        method: 'POST',
        body: {
          customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
          type: 'pickup',
          notes: notes.trim(),
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes.trim(),
          })),
        },
      })
      setResult(data.order)
      clear()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="bg-ink pb-14 pt-36 text-cream sm:pb-16 sm:pt-44">
        <div className="container-page">
          <p className="eyebrow">Rooftop bar · demo</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Pre-order, <em className="text-gold">on paper</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65">
            A working demonstration of the ordering flow with the published menu prices. Nothing is sent to the
            kitchen and no payment is taken.
          </p>
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        {result ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-line/70 bg-white/60 p-8 text-center sm:p-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss text-cream">
              <Check className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-3xl">Demo order recorded</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Reference <strong className="text-ink">{result.code}</strong> · {formatMoney(result.totalCents, currency)}{' '}
              · pickup.
            </p>
            <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-xs leading-relaxed text-ink/70">
              <strong className="font-semibold">Demo only.</strong> This order exists only in this demo. No ticket
              was printed, no message was sent, and no payment was processed.
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/eat" className="btn-primary">
                Back to the menu
              </Link>
              <button type="button" className="btn-ghost text-ink/70" onClick={() => setResult(null)}>
                Start another order
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl">Your demo order</h2>
                <Link to="/eat" className="inline-flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-clay">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Add more
                </Link>
              </div>

              {items.length === 0 ? (
                <div className="mt-6 rounded-[2rem] border border-line/70 bg-white/55 p-10 text-center">
                  <ShoppingBag className="mx-auto h-9 w-9 text-ink/25" />
                  <p className="mt-4 font-display text-2xl">Nothing in the cart yet.</p>
                  <p className="mt-2 text-sm text-ink/55">
                    Add lunch or dinner plates from the menu to try the demo.
                  </p>
                  <Link to="/eat" className="btn-primary mt-6">
                    Browse lunch &amp; dinner
                  </Link>
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-line/60 rounded-[2rem] border border-line/70 bg-white/55 px-5">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-5">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                        imgClassName="h-full w-full object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-0">
                          <p className="font-display text-xl leading-tight">{item.name}</p>
                          <p className="mt-0.5 text-xs text-ink/45">
                            {formatMoney(item.priceCents, currency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="inline-flex items-center rounded-full border border-line">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.productId, item.quantity - 1)}
                              className="inline-flex h-8 w-8 items-center justify-center text-ink/55 hover:text-ink"
                              aria-label={`Decrease ${item.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                              className="inline-flex h-8 w-8 items-center justify-center text-ink/55 hover:text-ink"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="w-16 text-right text-sm font-semibold">
                            {formatMoney(item.priceCents * item.quantity, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-ink/35 hover:text-clay"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {items.length > 0 ? (
                <form onSubmit={handleSubmit} className="mt-8 rounded-[2rem] border border-line/70 bg-white/55 p-6 sm:p-8">
                  <h3 className="font-display text-2xl">Pickup details</h3>
                  <p className="mt-1 text-xs text-ink/50">
                    Pickup at the rooftop bar. Delivery and payments are not enabled in this demo.
                  </p>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="order-name" className="label">
                        Name
                      </label>
                      <input
                        id="order-name"
                        className="field"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="order-phone" className="label">
                        Phone
                      </label>
                      <input
                        id="order-phone"
                        className="field"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        autoComplete="tel"
                        placeholder="(920) 000-0000"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="order-email" className="label">
                        Email <span className="normal-case tracking-normal text-ink/35">(optional, not sent)</span>
                      </label>
                      <input
                        id="order-email"
                        type="email"
                        className="field"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="order-notes" className="label">
                        Notes for the bar
                      </label>
                      <textarea
                        id="order-notes"
                        className="field min-h-24 resize-y"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Anything the team should know?"
                      />
                    </div>
                  </div>

                  {error ? (
                    <p className="mt-5 rounded-xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay">
                      {error}
                    </p>
                  ) : null}

                  <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {submitting ? 'Recording demo order' : 'Place demo order'}
                  </button>
                </form>
              ) : null}
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-line/70 bg-white/60 p-6">
                <h3 className="font-display text-2xl">Summary</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-ink/60">
                    <dt>Subtotal</dt>
                    <dd className="font-semibold text-ink">{formatMoney(subtotalCents, currency)}</dd>
                  </div>
                  <div className="flex items-center justify-between text-ink/60">
                    <dt>Delivery</dt>
                    <dd>Not available</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-line/70 pt-3">
                    <dt className="font-semibold">Total</dt>
                    <dd className="text-lg font-semibold">{formatMoney(subtotalCents, currency)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[0.64rem] uppercase tracking-[0.1em] text-ink/35">
                  Cash prices · no payment
                </p>
              </div>

              <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 text-xs leading-relaxed text-ink/65">
                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong className="font-semibold">Demo only.</strong> Nothing is sent to Mezzanine and no card is
                    processed.
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-line/70 bg-white/50 p-5 text-xs leading-relaxed text-ink/55">
                <p className="font-semibold text-ink">Need a real order?</p>
                <p className="mt-1">
                  Call{' '}
                  <a href={`tel:${(settings?.phone ?? '920-786-7698').replace(/[^\d+]/g, '')}`} className="font-semibold text-clay">
                    {settings?.phone ?? '920-786-7698'}
                  </a>
                  . This demo is not connected to the restaurant.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  )
}
