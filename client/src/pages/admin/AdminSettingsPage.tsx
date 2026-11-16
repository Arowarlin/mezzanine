import { useEffect, useState } from 'react'
import { Check, Clock, Loader2, MapPin, Percent, Save, Store } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import { useSettings } from '../../context/SettingsContext'
import { PageHeader } from '../../components/admin/PageHeader'
import { PageLoader } from '../../components/ui/Spinner'

const DAYS = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
]

type FormState = {
  restaurant_name: string
  tagline: string
  description: string
  phone: string
  whatsapp: string
  email: string
  instagram: string
  facebook: string
  official_website: string
  address: string
  city: string
  country: string
  currency: string
  deliveryFee: string
  minOrder: string
  open_time: string
  close_time: string
  slot_minutes: string
  seats_per_slot: string
  hours_note: string
  demo_mode: string
  demo_notice: string
  hero_title: string
  hero_subtitle: string
  about_intro: string
  careers_intro: string
}

const EMPTY: FormState = {
  restaurant_name: '',
  tagline: '',
  description: '',
  phone: '',
  whatsapp: '',
  email: '',
  instagram: '',
  facebook: '',
  official_website: '',
  address: '',
  city: '',
  country: '',
  currency: 'USD',
  deliveryFee: '0.00',
  minOrder: '0.00',
  open_time: '11:00',
  close_time: '21:00',
  slot_minutes: '30',
  seats_per_slot: '40',
  hours_note: '',
  demo_mode: 'true',
  demo_notice: '',
  hero_title: '',
  hero_subtitle: '',
  about_intro: '',
  careers_intro: '',
}

function centsToInput(value: string | undefined): string {
  const cents = Number(value ?? 0)
  return (Number.isFinite(cents) ? cents / 100 : 0).toFixed(2)
}

export function AdminSettingsPage() {
  const { refresh } = useSettings()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [closedDays, setClosedDays] = useState<string[]>(['2', '3'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    api<{ settings: Record<string, string> }>('/api/admin/settings')
      .then((data) => {
        if (!active) return
        const settings = data.settings
        setForm({
          restaurant_name: settings.restaurant_name ?? '',
          tagline: settings.tagline ?? '',
          description: settings.description ?? '',
          phone: settings.phone ?? '',
          whatsapp: settings.whatsapp ?? '',
          email: settings.email ?? '',
          instagram: settings.instagram ?? '',
          facebook: settings.facebook ?? '',
          official_website: settings.official_website ?? '',
          address: settings.address ?? '',
          city: settings.city ?? '',
          country: settings.country ?? '',
          currency: settings.currency ?? 'USD',
          deliveryFee: centsToInput(settings.delivery_fee_cents),
          minOrder: centsToInput(settings.min_order_cents),
          open_time: settings.open_time ?? '11:00',
          close_time: settings.close_time ?? '21:00',
          slot_minutes: settings.slot_minutes ?? '30',
          seats_per_slot: settings.seats_per_slot ?? '40',
          hours_note: settings.hours_note ?? '',
          demo_mode: settings.demo_mode ?? 'true',
          demo_notice: settings.demo_notice ?? '',
          hero_title: settings.hero_title ?? '',
          hero_subtitle: settings.hero_subtitle ?? '',
          about_intro: settings.about_intro ?? '',
          careers_intro: settings.careers_intro ?? '',
        })
        setClosedDays(
          (settings.closed_days ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value !== ''),
        )
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
  }, [])

  const set = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleDay = (day: string) => {
    setClosedDays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day].sort(),
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const delivery = Number(form.deliveryFee.replace(',', '.'))
    const minimum = Number(form.minOrder.replace(',', '.'))
    if (!Number.isFinite(delivery) || delivery < 0 || !Number.isFinite(minimum) || minimum < 0) {
      setError('Los montos de envío y pedido mínimo deben ser números válidos.')
      return
    }
    if (form.whatsapp.trim() && !/^\d{7,15}$/.test(form.whatsapp)) {
      setError('El WhatsApp debe tener solo dígitos, entre 7 y 15, o quedar vacío.')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, string> = {
        restaurant_name: form.restaurant_name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        instagram: form.instagram.trim(),
        facebook: form.facebook.trim(),
        official_website: form.official_website.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        currency: form.currency.trim().toUpperCase(),
        delivery_fee_cents: String(Math.round(delivery * 100)),
        min_order_cents: String(Math.round(minimum * 100)),
        open_time: form.open_time,
        close_time: form.close_time,
        slot_minutes: form.slot_minutes,
        seats_per_slot: form.seats_per_slot,
        closed_days: closedDays.length > 0 ? closedDays.join(',') : '0',
        hours_note: form.hours_note.trim(),
        demo_mode: form.demo_mode,
        demo_notice: form.demo_notice.trim(),
        hero_title: form.hero_title.trim(),
        hero_subtitle: form.hero_subtitle.trim(),
        about_intro: form.about_intro.trim(),
        careers_intro: form.careers_intro.trim(),
      }

      await api<{ settings: Record<string, string> }>('/api/admin/settings', { method: 'PUT', body: payload })
      await refresh()
      setNotice('Ajustes guardados. El sitio ya muestra los cambios.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Cargando ajustes…" />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Ajustes del restaurante"
        description="Marca, contacto, precios de envío, horario y días de cierre. Todo se refleja en el sitio público."
        actions={
          <button type="submit" disabled={saving} className="btn-primary px-4 py-2.5 text-[0.7rem]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Guardando…' : 'Guardar ajustes'}
          </button>
        }
      />

      {notice ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="h-4 w-4" />
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-gold" />
          <h2 className="text-2xl">Identidad</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-name" className="label">
              Nombre del restaurante
            </label>
            <input
              id="settings-name"
              type="text"
              value={form.restaurant_name}
              onChange={(event) => set('restaurant_name', event.target.value)}
              className="field"
              maxLength={120}
              required
            />
          </div>
          <div>
            <label htmlFor="settings-tagline" className="label">
              Lema
            </label>
            <input
              id="settings-tagline"
              type="text"
              value={form.tagline}
              onChange={(event) => set('tagline', event.target.value)}
              className="field"
              maxLength={160}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="settings-description" className="label">
              Descripción
            </label>
            <textarea
              id="settings-description"
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              className="field min-h-24 resize-y"
              maxLength={1000}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" />
          <h2 className="text-2xl">Contacto</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-phone" className="label">
              Teléfono
            </label>
            <input
              id="settings-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => set('phone', event.target.value)}
              className="field"
              maxLength={30}
            />
          </div>
          <div>
            <label htmlFor="settings-whatsapp" className="label">
              WhatsApp (solo dígitos, opcional)
            </label>
            <input
              id="settings-whatsapp"
              type="text"
              inputMode="numeric"
              value={form.whatsapp}
              onChange={(event) => set('whatsapp', event.target.value.replace(/\D/g, ''))}
              className="field"
              maxLength={15}
              placeholder="Se deja vacío si no hay WhatsApp público"
            />
          </div>
          <div>
            <label htmlFor="settings-email" className="label">
              Correo
            </label>
            <input
              id="settings-email"
              type="email"
              value={form.email}
              onChange={(event) => set('email', event.target.value)}
              className="field"
              maxLength={160}
            />
          </div>
          <div>
            <label htmlFor="settings-instagram" className="label">
              Instagram
            </label>
            <input
              id="settings-instagram"
              type="text"
              value={form.instagram}
              onChange={(event) => set('instagram', event.target.value)}
              className="field"
              maxLength={80}
            />
          </div>
          <div>
            <label htmlFor="settings-facebook" className="label">
              Facebook (URL)
            </label>
            <input
              id="settings-facebook"
              type="url"
              value={form.facebook}
              onChange={(event) => set('facebook', event.target.value)}
              className="field"
              maxLength={300}
              placeholder="https://www.facebook.com/…"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="settings-official" className="label">
              Sitio oficial (URL)
            </label>
            <input
              id="settings-official"
              type="url"
              value={form.official_website}
              onChange={(event) => set('official_website', event.target.value)}
              className="field"
              maxLength={300}
              placeholder="https://www.mezzaninerooftop.com/"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="settings-address" className="label">
              Dirección
            </label>
            <input
              id="settings-address"
              type="text"
              value={form.address}
              onChange={(event) => set('address', event.target.value)}
              className="field"
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="settings-city" className="label">
              Ciudad
            </label>
            <input
              id="settings-city"
              type="text"
              value={form.city}
              onChange={(event) => set('city', event.target.value)}
              className="field"
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="settings-country" className="label">
              País
            </label>
            <input
              id="settings-country"
              type="text"
              value={form.country}
              onChange={(event) => set('country', event.target.value)}
              className="field"
              maxLength={120}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="settings-hours-note" className="label">
              Nota de horarios
            </label>
            <textarea
              id="settings-hours-note"
              value={form.hours_note}
              onChange={(event) => set('hours_note', event.target.value)}
              className="field min-h-20 resize-y"
              maxLength={1000}
              placeholder="Explica cualquier conflicto de horarios antes de confirmarlos…"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-gold" />
          <h2 className="text-2xl">Pedidos y moneda</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="settings-currency" className="label">
              Moneda (ISO)
            </label>
            <input
              id="settings-currency"
              type="text"
              value={form.currency}
              onChange={(event) => set('currency', event.target.value.toUpperCase())}
              className="field uppercase"
              maxLength={3}
              required
            />
          </div>
          <div>
            <label htmlFor="settings-delivery" className="label">
              Costo de envío
            </label>
            <input
              id="settings-delivery"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.deliveryFee}
              onChange={(event) => set('deliveryFee', event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="settings-minimum" className="label">
              Pedido mínimo a domicilio
            </label>
            <input
              id="settings-minimum"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.minOrder}
              onChange={(event) => set('minOrder', event.target.value)}
              className="field"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold" />
          <h2 className="text-2xl">Horario y reservas</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="settings-open" className="label">
              Apertura
            </label>
            <input
              id="settings-open"
              type="time"
              value={form.open_time}
              onChange={(event) => set('open_time', event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="settings-close" className="label">
              Cierre
            </label>
            <input
              id="settings-close"
              type="time"
              value={form.close_time}
              onChange={(event) => set('close_time', event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="settings-slot" className="label">
              Minutos por franja
            </label>
            <input
              id="settings-slot"
              type="number"
              min="10"
              max="180"
              step="5"
              value={form.slot_minutes}
              onChange={(event) => set('slot_minutes', event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="settings-seats" className="label">
              Asientos por franja
            </label>
            <input
              id="settings-seats"
              type="number"
              min="1"
              max="500"
              step="1"
              value={form.seats_per_slot}
              onChange={(event) => set('seats_per_slot', event.target.value)}
              className="field"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <span className="label">Días cerrados</span>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = closedDays.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] transition ${
                    active
                      ? 'border-clay bg-clay text-cream'
                      : 'border-line bg-white/60 text-ink/55 hover:border-clay/50 hover:text-ink'
                  }`}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-[0.68rem] text-ink/40">
            Los días marcados no aceptan reservas y el sitio lo indica al cliente.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line/70 bg-white/70 p-6">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-gold" />
          <h2 className="text-2xl">Contenido de páginas</h2>
        </div>
        <p className="mt-1 text-xs text-ink/45">
          Textos de la portada, la página About y Careers. En esta demo conviene mantener el aviso de propuesta no
          oficial.
        </p>
        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="settings-hero-title" className="label">
              Titular de la portada
            </label>
            <input
              id="settings-hero-title"
              type="text"
              value={form.hero_title}
              onChange={(event) => set('hero_title', event.target.value)}
              className="field"
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="settings-hero-subtitle" className="label">
              Subtítulo de la portada
            </label>
            <textarea
              id="settings-hero-subtitle"
              value={form.hero_subtitle}
              onChange={(event) => set('hero_subtitle', event.target.value)}
              className="field min-h-20 resize-y"
              maxLength={500}
            />
          </div>
          <div>
            <label htmlFor="settings-about-intro" className="label">
              Introducción de About
            </label>
            <textarea
              id="settings-about-intro"
              value={form.about_intro}
              onChange={(event) => set('about_intro', event.target.value)}
              className="field min-h-24 resize-y"
              maxLength={1000}
            />
          </div>
          <div>
            <label htmlFor="settings-careers-intro" className="label">
              Introducción de Careers
            </label>
            <textarea
              id="settings-careers-intro"
              value={form.careers_intro}
              onChange={(event) => set('careers_intro', event.target.value)}
              className="field min-h-20 resize-y"
              maxLength={1000}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[0.4fr_1fr]">
            <div>
              <label htmlFor="settings-demo-mode" className="label">
                Modo demo
              </label>
              <select
                id="settings-demo-mode"
                value={form.demo_mode}
                onChange={(event) => set('demo_mode', event.target.value)}
                className="field"
              >
                <option value="true">Activo</option>
                <option value="false">Desactivado</option>
              </select>
            </div>
            <div>
              <label htmlFor="settings-demo-notice" className="label">
                Aviso de demostración
              </label>
              <textarea
                id="settings-demo-notice"
                value={form.demo_notice}
                onChange={(event) => set('demo_notice', event.target.value)}
                className="field min-h-20 resize-y"
                maxLength={1000}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary px-5 py-3 text-[0.7rem]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando…' : 'Guardar ajustes'}
        </button>
      </div>
    </form>
  )
}
