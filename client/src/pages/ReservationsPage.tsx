import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { ReservationResponse, ReservationSlot } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { formatDate, todayISO } from '../lib/format'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SmartImage } from '../components/ui/SmartImage'
import { Spinner } from '../components/ui/Spinner'

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

type SlotsResponse = {
  date: string
  closed: boolean
  slots: ReservationSlot[]
}

function addDaysISO(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function weekdayLabel(date: string): string {
  return DAY_NAMES[new Date(`${date}T12:00:00`).getDay()] ?? ''
}

export function ReservationsPage() {
  const { settings, whatsapp } = useSettings()
  const [date, setDate] = useState(addDaysISO(1))
  const [slots, setSlots] = useState<ReservationSlot[]>([])
  const [closed, setClosed] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotsError, setSlotsError] = useState('')

  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmation, setConfirmation] = useState<ReservationResponse['reservation'] | null>(null)

  const minDate = todayISO()
  const maxDate = addDaysISO(90)

  const loadSlots = useCallback((targetDate: string) => {
    setSlotsLoading(true)
    setSlotsError('')
    setTime('')
    api<SlotsResponse>(`/api/public/reservations/slots?date=${targetDate}`)
      .then((data) => {
        setSlots(data.slots)
        setClosed(data.closed)
      })
      .catch((error) => {
        setSlots([])
        setClosed(false)
        setSlotsError(errorMessage(error))
      })
      .finally(() => setSlotsLoading(false))
  }, [])

  useEffect(() => {
    loadSlots(date)
  }, [date, loadSlots])

  const availableSlots = useMemo(() => slots.filter((slot) => slot.remaining > 0), [slots])

  const selectedSlot = useMemo(() => slots.find((slot) => slot.time === time) ?? null, [slots, time])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')

    if (!time) {
      setFormError('Elige una hora disponible.')
      return
    }
    if (selectedSlot && selectedSlot.remaining < partySize) {
      setFormError(`Esa franja solo tiene ${selectedSlot.remaining} asiento(s). Elige otra hora o reduce el grupo.`)
      return
    }

    setSubmitting(true)
    try {
      const data = await api<ReservationResponse>('/api/public/reservations', {
        method: 'POST',
        body: {
          customer: { name, phone, email: email.trim() ? email : '' },
          date,
          time,
          partySize,
          notes: notes.trim() ? notes : undefined,
        },
      })
      setConfirmation(data.reservation)
      setSlots((current) =>
        current.map((slot) =>
          slot.time === time ? { ...slot, remaining: Math.max(0, slot.remaining - partySize) } : slot,
        ),
      )
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setConfirmation(null)
    setName('')
    setPhone('')
    setEmail('')
    setNotes('')
    setPartySize(2)
    setFormError('')
    loadSlots(date)
  }

  const closedDays = useMemo(() => {
    const raw = settings?.closed_days ?? '1'
    return raw
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
      .map((value) => DAY_NAMES[value])
      .join(', ')
  }, [settings?.closed_days])

  return (
    <>
      <section className="relative overflow-hidden bg-forest pb-16 pt-36 text-cream sm:pb-20 sm:pt-44">
        <SmartImage
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80"
          alt="Terraza de Casa Veranda"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-25"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/80 to-forest/40" />
        <div className="container-page relative">
          <p className="eyebrow">Reservaciones</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-7xl">
            Aparta tu mesa, <em className="text-gold">sin llamadas</em>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/65 sm:text-base">
            Elige el día y la hora, dinos cuántos vienen y te confirmamos por teléfono o WhatsApp.
            La reserva queda registrada al instante.
          </p>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            {confirmation ? (
              <Reveal>
                <div className="rounded-3xl border border-gold/40 bg-white/80 p-8 shadow-soft">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
                    <Check className="h-7 w-7" />
                  </span>
                  <h2 className="mt-6 text-4xl leading-tight">Mesa apartada</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">
                    Guardamos tu reserva con el código{' '}
                    <strong className="font-bold text-ink">{confirmation.code}</strong>. Te contactaremos al
                    teléfono indicado para confirmar.
                  </p>

                  <dl className="mt-7 grid gap-4 rounded-2xl bg-sand/40 p-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Fecha</dt>
                      <dd className="mt-1 font-semibold">{formatDate(confirmation.date)}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Hora</dt>
                      <dd className="mt-1 font-semibold">{confirmation.time}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Personas</dt>
                      <dd className="mt-1 font-semibold">{confirmation.partySize}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink/45">Código</dt>
                      <dd className="mt-1 font-semibold tracking-wide">{confirmation.code}</dd>
                    </div>
                  </dl>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                        `Hola, acabo de reservar la mesa ${confirmation.code} para el ${confirmation.date} a las ${confirmation.time}.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Confirmar por WhatsApp
                    </a>
                    <button type="button" onClick={resetForm} className="btn-ghost text-forest">
                      Hacer otra reserva
                    </button>
                  </div>
                </div>
              </Reveal>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow">Paso 1</p>
                      <h2 className="mt-2 text-3xl">Elige el día</h2>
                    </div>
                    {closedDays ? (
                      <p className="text-xs text-ink/45">Cerrado: {closedDays}</p>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="reservation-date" className="label">
                        Fecha
                      </label>
                      <input
                        id="reservation-date"
                        type="date"
                        value={date}
                        min={minDate}
                        max={maxDate}
                        onChange={(event) => {
                          if (event.target.value) setDate(event.target.value)
                        }}
                        className="field"
                        required
                      />
                      <p className="mt-1.5 text-xs capitalize text-ink/45">{weekdayLabel(date)}</p>
                    </div>
                    <div>
                      <label htmlFor="reservation-party" className="label">
                        Personas
                      </label>
                      <div className="relative">
                        <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                        <select
                          id="reservation-party"
                          value={partySize}
                          onChange={(event) => setPartySize(Number(event.target.value))}
                          className="field appearance-none pl-11"
                        >
                          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                            <option key={value} value={value}>
                              {value} {value === 1 ? 'persona' : 'personas'}
                            </option>
                          ))}
                          <option value={15}>15 personas (grupo)</option>
                          <option value={20}>20 personas (evento)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="eyebrow">Paso 2</p>
                  <h2 className="mt-2 text-3xl">Elige la hora</h2>

                  {slotsLoading ? (
                    <div className="mt-5 flex items-center gap-3 text-sm text-ink/50">
                      <Spinner className="h-4 w-4" />
                      Consultando disponibilidad…
                    </div>
                  ) : null}

                  {!slotsLoading && slotsError ? (
                    <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {slotsError}
                    </div>
                  ) : null}

                  {!slotsLoading && !slotsError && closed ? (
                    <div className="mt-5 rounded-xl border border-line bg-sand/40 px-4 py-4 text-sm text-ink/65">
                      Ese día el restaurante está cerrado. Prueba con otra fecha.
                    </div>
                  ) : null}

                  {!slotsLoading && !slotsError && !closed && slots.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-line bg-sand/40 px-4 py-4 text-sm text-ink/65">
                      No quedan franjas para ese día. Prueba con otra fecha o escríbenos por WhatsApp.
                    </div>
                  ) : null}

                  {!slotsLoading && !slotsError && !closed && slots.length > 0 ? (
                    <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((slot) => {
                        const disabled = slot.remaining < partySize
                        const active = time === slot.time
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={disabled}
                            onClick={() => setTime(slot.time)}
                            className={`rounded-xl border px-2 py-2.5 text-center transition ${
                              active
                                ? 'border-forest bg-forest text-cream'
                                : disabled
                                  ? 'cursor-not-allowed border-line/60 bg-sand/30 text-ink/25'
                                  : 'border-line bg-white/70 text-ink/75 hover:border-gold hover:text-ink'
                            }`}
                            aria-pressed={active}
                          >
                            <span className="block text-sm font-bold">{slot.time}</span>
                            <span
                              className={`block text-[0.6rem] uppercase tracking-wide ${
                                active ? 'text-cream/70' : disabled ? 'text-ink/25' : 'text-ink/40'
                              }`}
                            >
                              {disabled ? 'Sin cupo' : `${slot.remaining} libres`}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}

                  {!slotsLoading && !slotsError && !closed && availableSlots.length === 0 && slots.length > 0 ? (
                    <p className="mt-3 text-xs text-ink/50">
                      No hay cupo para {partySize} personas ese día. Reduce el grupo o elige otra fecha.
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="eyebrow">Paso 3</p>
                  <h2 className="mt-2 text-3xl">Tus datos</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="reservation-name" className="label">
                        Nombre completo
                      </label>
                      <input
                        id="reservation-name"
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
                      <label htmlFor="reservation-phone" className="label">
                        Teléfono
                      </label>
                      <input
                        id="reservation-phone"
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
                      <label htmlFor="reservation-email" className="label">
                        Correo <span className="normal-case tracking-normal text-ink/35">(opcional)</span>
                      </label>
                      <input
                        id="reservation-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="field"
                        placeholder="tu@correo.com"
                        maxLength={160}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="reservation-notes" className="label">
                        Notas <span className="normal-case tracking-normal text-ink/35">(opcional)</span>
                      </label>
                      <textarea
                        id="reservation-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="field min-h-24 resize-y"
                        placeholder="Cumpleaños, alergias, silla para bebé, mesa en la terraza…"
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>

                {formError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {formError}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 border-t border-line/70 pt-6">
                  <button type="submit" disabled={submitting || slotsLoading || closed} className="btn-primary">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
                    {submitting ? 'Guardando…' : 'Confirmar reserva'}
                  </button>
                  {selectedSlot ? (
                    <p className="text-sm text-ink/55">
                      {formatDate(date)} · {time} · {partySize}{' '}
                      {partySize === 1 ? 'persona' : 'personas'}
                    </p>
                  ) : (
                    <p className="text-sm text-ink/40">Selecciona una hora para continuar</p>
                  )}
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl">
              <SmartImage
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80"
                alt="Mesa servida en Casa Veranda"
                className="aspect-[4/3] w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>

            <div className="card p-6">
              <SectionHeading eyebrow="Antes de venir" title="Lo que debes saber" />
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-ink/65">
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    Mantenemos tu mesa por 15 minutos. Si vienes tarde, avísanos por teléfono.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    Grupos de más de 12 personas: escríbenos para coordinar menú y espacio.
                  </span>
                </li>
                <li className="flex gap-3">
                  <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    Podemos adaptar platos a alergias y restricciones si lo avisas con antelación.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{settings?.phone ?? '+1 809 555 0142'}</span>
                </li>
              </ul>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost mt-6 w-full text-forest"
              >
                <MessageCircle className="h-4 w-4" />
                Escribir por WhatsApp
              </a>
            </div>

            <div className="card p-6">
              <p className="eyebrow">Dirección</p>
              <p className="mt-3 font-display text-2xl leading-snug">{settings?.address ?? 'Piantini, Santo Domingo'}</p>
              <p className="mt-2 text-sm text-ink/55">
                {settings?.city ?? 'Santo Domingo'}, {settings?.country ?? 'República Dominicana'}
              </p>
              <Link to="/contacto" className="link-underline mt-4 inline-block text-[0.7rem] font-bold uppercase tracking-[0.16em] text-forest">
                Ver mapa y cómo llegar
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
