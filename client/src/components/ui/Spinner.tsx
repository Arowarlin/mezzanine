import { Loader2 } from 'lucide-react'

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-5 w-5 animate-spin ${className}`} aria-hidden="true" />
}

export function PageLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink/50">
      <Spinner className="h-6 w-6" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
