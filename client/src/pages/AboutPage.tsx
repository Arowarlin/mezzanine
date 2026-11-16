import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Flame, HeartHandshake } from 'lucide-react'
import { Reveal } from '../components/ui/Reveal'
import { SectionHeading } from '../components/ui/SectionHeading'
import { SmartImage } from '../components/ui/SmartImage'
import { VALUES } from '../lib/site'

const ICONS = [Leaf, Flame, HeartHandshake]

export function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-20 pt-40 text-cream sm:pb-24 sm:pt-48">
        <SmartImage
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1800&q=80"
          alt="Mesa preparada en Casa Veranda"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="container-page relative">
          <p className="eyebrow">Nosotros</p>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-7xl">
            Una casa que huele a <em className="text-gold">sofrito</em>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/70 sm:text-base">
            No somos un restaurante de paso. Somos la mesa de una familia que decidió abrir las puertas
            y servir lo que cocina para los suyos.
          </p>
        </div>
      </section>

      <section className="container-page py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <div className="space-y-6 text-[0.98rem] leading-relaxed text-ink/70">
              <p className="font-display text-3xl leading-snug text-ink">
                Empezamos con una mesa plegable en Villa Mella, un caldero de chivo y los vecinos
                sentados en la acera.
              </p>
              <p>
                Diez años después, Casa Veranda ocupa una casa de los años cincuenta en Piantini. La
                terraza sigue siendo el centro: allí se cena despacio, se conversa y se ve pasar la
                noche. La cocina está abierta a la sala, sin misterio.
              </p>
              <p>
                Trabajamos con pescadores de Boca Chica, agricultores de Constanza y queseros de
                Monte Plata. La carta cambia cuando cambia la pesca. No tenemos un menú de temporada
                por moda: lo tenemos porque cocinar con lo que hay es la única forma que conocemos de
                cocinar bien.
              </p>
              <p>
                El fuego de leña es nuestra herramienta principal. La brasa da fondo, humo y carácter.
                Todo lo demás —la vajilla, la luz, la música— está para que la comida no tenga que
                competir con nada.
              </p>
            </div>

            <figure className="mt-10 border-l-2 border-gold pl-6">
              <blockquote className="font-display text-2xl italic leading-snug text-forest">
                “Cocinar el Caribe es respetar lo que ya está bueno y no taparlo con nada.”
              </blockquote>
              <figcaption className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink/45">
                La cocina · Casa Veranda
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={120} className="space-y-4">
            <div className="overflow-hidden rounded-[2rem]">
              <SmartImage
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
                alt="Comedor de Casa Veranda"
                className="aspect-[4/5] w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl">
                <SmartImage
                  src="https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=600&q=80"
                  alt="Plato de la casa"
                  className="aspect-square w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl">
                <SmartImage
                  src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=600&q=80"
                  alt="Producto fresco"
                  className="aspect-square w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-sand/45 py-20 sm:py-28">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Cómo trabajamos"
              title={
                <>
                  Tres cosas que
                  <br />
                  <em className="text-moss">no negociamos</em>
                </>
              }
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {VALUES.map((value, index) => {
              const Icon = ICONS[index] ?? Leaf
              return (
                <Reveal key={value.title} delay={index * 80}>
                  <div className="h-full rounded-2xl border border-line/70 bg-white/70 p-7">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-2xl">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{value.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-20 text-center sm:py-24">
        <Reveal>
          <p className="eyebrow">Ven a la mesa</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance text-4xl leading-tight sm:text-5xl">
            La historia se entiende mejor <em className="text-moss">sentado</em>.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/reservaciones" className="btn-primary">
              Reservar una mesa
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/menu" className="btn-ghost text-forest">
              Ver el menú
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
