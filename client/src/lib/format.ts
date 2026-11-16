export function formatMoney(cents: number, currency = 'DOP'): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short' }).format(date)
}

export function formatDateTime(value: string): string {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function todayISO(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function whatsappLink(phone: string, message?: string): string {
  const clean = digitsOnly(phone)
  return message ? `https://wa.me/${clean}?text=${encodeURIComponent(message)}` : `https://wa.me/${clean}`
}
