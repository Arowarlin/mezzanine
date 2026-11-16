import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { errorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { Brand } from '../../components/layout/Brand'
import { SmartImage } from '../../components/ui/SmartImage'

type LocationState = { from?: string } | null

export function AdminLoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user) return <Navigate to={from} replace />

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <SmartImage
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
          alt="Mesa servida en Mezzanine"
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover opacity-45"
          eager
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream">
          <Brand light />
          <div>
            <p className="eyebrow">Panel administrativo</p>
            <h1 className="mt-4 max-w-md text-balance text-5xl leading-[1.02]">
              El rooftop, <em className="text-gold">bajo control</em>.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
              Pedidos, reservas, clientes y carta en un solo lugar. Solo el personal autorizado puede entrar.
            </p>
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-cream/30">
            Egg Harbor · Wisconsin
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-cream px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Brand />
          </div>
          <p className="eyebrow mt-10 lg:mt-0">Acceso privado</p>
          <h2 className="mt-3 text-4xl leading-tight">Entra al panel</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/55">
            Usa las credenciales del administrador del restaurante.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="label">
                Correo
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="field pl-11"
                  placeholder="admin@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field pl-11 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/35 transition hover:text-ink"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink/40 transition hover:text-forest"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  )
}
