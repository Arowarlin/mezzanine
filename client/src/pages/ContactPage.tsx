import { useState } from 'react'
import { AtSign, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'

const HOURS = [
  { day: 'Martes a jueves', time: '12:00 p.m. – 11:00 p.m.' },
  { day: 'Viernes y sábado', time: '12:00 p.m. – 12:00 a.m.' },
  { day: 'Domingo', time: '12:00 p.m. – 9:00 p.m.' },
  { day: 'Lunes', time: 'Cerrado' },
]

export function ContactPage() {
  const { settings, whatsapp } = useSettings()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const phone = settings?.phone ?? '+1 809 555 0142'
  const email = settings?.email ?? 'reservas@casaveranda.do'
  const instagram = settings?.instagram ?? '@casaveranda'
  const address = settings?.address ?? 'Calle Gustavo Mejía Ricart 45, Piantini'
  const city = settings?.city ?? 'Santo Domingo'
  const country = settings?.country ?? 'República Dominicana'

  const mapQuery = encodeURIComponent(`${address}, ${city}, ${country}`)
  const whatsappMessage = `Hola, soy ${name || 'un cliente'}. ${message || 'Quisiera hacer una consulta.'}`

  return (
    <>
      <section className="bg-forest pb-16 pt-36 text-cream sm:pb-20 sm:pt-44">
        <div className="container-page">
          <p className="eyebrow">Contacto</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-7xl">
            Hablemos, <em className="text-gold">sin formularios eternos</em>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/65 sm:text-base">
            Escríbenos por WhatsApp para consultas, grupos, eventos privados o cualquier detalle del menú.
            Respondemos en horario de cocina.
          </p>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="space-y-8">
            <Reveal>
              <SectionHeading eyebrow="La casa" title="Dónde estamos" />
              <ul className="mt-6 space-y-5 text-sm leading-relaxed text-ink/70">
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>
                    <strong className="block font-semibold text-ink">{address}</strong>
                    {city}, {country}
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <strong className="block font-semibold text-ink">Teléfono</strong>
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-forest">
                      {phone}
                    </a>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <strong className="block font-semibold text-ink">Correo</strong>
                    <a href={`mailto:${email}`} className="hover:text-forest">
                      {email}
                    </a>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream">
                    <AtSign className="h-4 w-4" />
                  </span>
                  <span>
                    <strong className="block font-semibold text-ink">Instagram</strong>
                    <span>{instagram}</span>
                  </span>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={100}>
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gold" />
                  <h2 className="text-2xl">Horario</h2>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {HOURS.map((item) => (
                    <li key={item.day} className="flex justify-between gap-4 border-b border-line/40 pb-2 last:border-0 last:pb-0">
                      <span className="text-ink/60">{item.day}</span>
                      <span className={item.time === 'Cerrado' ? 'text-ink/35' : 'font-semibold'}>{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="overflow-hidden rounded-2xl border border-line/70">
                <iframe
                  title={`Mapa de ${address}`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="rounded-3xl border border-line/70 bg-white/75 p-6 shadow-soft sm:p-8">
              <p className="eyebrow">Escríbenos</p>
              <h2 className="mt-2 text-3xl leading-tight">Un mensaje directo a la casa</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/55">
                Escribe tu consulta y el botón abrirá WhatsApp con el mensaje listo para enviar. Sin registros ni
                esperas.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="label">
                    Tu nombre
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="field"
                    placeholder="María Fernández"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="label">
                    Mensaje
                  </label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="field min-h-36 resize-y"
                    placeholder="Quisiera reservar para un grupo de 10 personas el sábado…"
                    maxLength={1000}
                  />
                </div>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar por WhatsApp
                </a>
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent('Consulta desde la web')}&body=${encodeURIComponent(
                    whatsappMessage,
                  )}`}
                  className="btn-ghost w-full text-forest"
                >
                  <Send className="h-4 w-4" />
                  Enviar por correo
                </a>
              </div>

              <p className="mt-5 border-t border-line/50 pt-4 text-xs leading-relaxed text-ink/40">
                Para reservas de más de 12 personas o eventos privados, llámanos directamente al {phone}. Así
                coordinamos menú, espacio y horario.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
