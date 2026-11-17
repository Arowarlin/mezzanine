import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, Clock, Info, Loader2, Phone, Users } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { ReservationResponse, ReservationSlot } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { formatDate, formatTime, todayISO } from '../lib/format'
import { Reveal } from '../components/ui/Reveal'
import { SmartImage } from '../components/ui/SmartImage'
import { Spinner } from '../components/ui/Spinner'

type SlotsResponse = {
  date: string
  closed: boolean
  slots: ReservationSlot[]
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]

function addDaysISO(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function ReservationsPage() {
  const { settings } = useSettings()
  const [date, setDate] = useState(todayISO())
  const [partySize, setPartySize] = useState(2)
  const [slots, setSlots] = useState<ReservationSlot[]>([])
  const [closed, setClosed] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReservationResponse['reservation'] | null>(null)

  const minDate = todayISO()
  const maxDate = useMemo(() => addDaysISO(60), [])

  const loadSlots = useCallback(async (value: string) => {
    setLoadingSlots(true)
    setError('')
    setTime('')
    try {
      const data = await api<SlotsResponse>(`/api/public/reservations/slots?date=${value}`)
      setSlots(data.slots)
      setClosed(data.closed)
    } catch (err) {
      setSlots([])
      setClosed(false)
      setError(errorMessage(err))
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    void loadSlots(date)
  }, [date, loadSlots])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!time) {
      setError('Choose an available time.')
      return
    }
    if (name.trim().length < 2) {
      setError('Enter the name for the reservation.')
      return
    }
    if (phone.trim().length < 7) {
      setError('Enter a phone number so the restaurant can reach you.')
      return
    }

    setSubmitting(true)
    try {
      const data = await api<ReservationResponse>('/api/public/reservations', {
        method: 'POST',
        body: {
          customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
          date,
          time,
          partySize,
          notes: notes.trim(),
        },
      })
      setResult(data.reservation)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setResult(null)
    setTime('')
    setNotes('')
    setError('')
  }

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-14 pt-36 text-cream sm:pb-16 sm:pt-44">
        <SmartImage
          src="/photos/venue-sunset-bay.jpg"
          alt="Sunset over Horseshoe Bay from the rooftop"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-30"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/45" />
        <div className="container-page relative">
          <p className="eyebrow">Reservations</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            Save a <em className="text-gold">table</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/65">
            Request a table for lunch or dinner. This is a demonstration: no request reaches the restaurant and no
            availability is confirmed.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14 lg:py-20">
        <div>
          {result ? (
            <Reveal>
              <div className="rounded-[2rem] border border-line/70 bg-white/60 p-8 sm:p-10">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-moss text-cream">
                  <Check className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-3xl">Request saved in the demo</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  Reference <strong className="text-ink">{result.code}</strong> · {formatDate(result.date)} at{' '}
                  {formatTime(result.time)} · {result.partySize} guest{result.partySize === 1 ? '' : 's'}.
                </p>
                <div className="mt-5 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-xs leading-relaxed text-ink/70">
                  <strong className="font-semibold">Demo only.</strong> Nothing was sent to Mezzanine and no table is
                  held. In a real deployment this request would reach the restaurant&apos;s reservation inbox.
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={reset} className="btn-primary">
                    Make another request
                  </button>
                  <Link to="/eat" className="btn-ghost text-ink/70">
                    Browse the menu
                  </Link>
                </div>
              </div>
            </Reveal>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-line/70 bg-white/55 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-clay">
                <CalendarDays className="h-4 w-4" />
                Request a table
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="res-date" className="label">
                    Date
                  </label>
                  <input
                    id="res-date"
                    type="date"
                    className="field"
                    value={date}
                    min={minDate}
                    max={maxDate}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="res-party" className="label">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                    <select
                      id="res-party"
                      className="field appearance-none pl-11"
                      value={partySize}
                      onChange={(event) => setPartySize(Number(event.target.value))}
                    >
                      {PARTY_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="label mb-0">Time</span>
                  {!loadingSlots && !closed ? (
                    <span className="text-[0.62rem] uppercase tracking-[0.12em] text-ink/35">
                      {slots.length} slots
                    </span>
                  ) : null}
                </div>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-sm text-ink/45">
                    <Spinner className="h-4 w-4" />
                    Checking the demo calendar…
                  </div>
                ) : closed ? (
                  <div className="rounded-xl border border-clay/25 bg-clay/5 p-4 text-sm text-clay">
                    The calendar is marked closed on this date. Mezzanine is closed Tuesday &amp; Wednesday.
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-xl border border-line/70 bg-cream/60 p-4 text-sm text-ink/55">
                    No slots left for this date. Try another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((slot) => {
                      const disabled = slot.remaining < partySize
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={disabled}
                          onClick={() => setTime(slot.time)}
                          className={`rounded-xl border px-2 py-2.5 text-sm transition-colors ${
                            time === slot.time
                              ? 'border-ink bg-ink text-cream'
                              : disabled
                                ? 'cursor-not-allowed border-line/50 bg-cream/40 text-ink/25'
                                : 'border-line bg-white/70 text-ink/70 hover:border-ink/40'
                          }`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="res-name" className="label">
                    Name
                  </label>
                  <input
                    id="res-name"
                    className="field"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="res-phone" className="label">
                    Phone
                  </label>
                  <input
                    id="res-phone"
                    className="field"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    placeholder="(920) 000-0000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="res-email" className="label">
                    Email <span className="normal-case tracking-normal text-ink/35">(optional, not sent)</span>
                  </label>
                  <input
                    id="res-email"
                    type="email"
                    className="field"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="res-notes" className="label">
                    Comments
                  </label>
                  <textarea
                    id="res-notes"
                    className="field min-h-24 resize-y"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Anniversary, allergies, a seat by the edge…"
                  />
                </div>
              </div>

              {error ? (
                <p className="mt-5 rounded-xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay">{error}</p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button type="submit" className="btn-primary" disabled={submitting || closed || slots.length === 0}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Saving request' : 'Request table'}
                </button>
                <p className="flex items-center gap-1.5 text-[0.64rem] uppercase tracking-[0.1em] text-ink/35">
                  <Info className="h-3.5 w-3.5" />
                  Demo only — no real booking
                </p>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[2rem] border border-line/70 bg-white/60">
            <SmartImage
              src="/photos/venue-rooftop-deck-800.jpg"
              alt="The rooftop deck at Mezzanine"
              className="aspect-[4/3] w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="p-6">
              <p className="eyebrow">Before you book</p>
              <ul className="mt-4 space-y-3 text-sm text-ink/60">
                <li className="flex gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  Closed Tuesday &amp; Wednesday · Thursday–Monday, 12–8pm. The 2026 season ended October 31;
                  confirm reopening for 2027.
                </li>
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  For a real table, call{' '}
                  <a href="tel:9207867698" className="font-semibold text-ink hover:text-clay">
                    {settings?.phone ?? '920-786-7698'}
                  </a>
                  .
                </li>
                <li className="flex gap-2.5">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  Large parties? Call the restaurant directly so the team can plan the room.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 text-xs leading-relaxed text-ink/65">
            <strong className="font-semibold">Unofficial redesign proposal.</strong> This reservation form is a local
            demonstration. It does not confirm availability, send email or SMS, or reach Mezzanine.
          </div>
        </aside>
      </section>
    </>
  )
}
