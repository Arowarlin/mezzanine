import demoJson from '../data/static-demo.json'
import type { CareerOpening, Category, GalleryImage, Product, Settings } from './types'

type StaticDemoData = {
  generatedAt: string
  settings: Settings
  categories: Category[]
  products: Product[]
  images: GalleryImage[]
  openings: CareerOpening[]
}

type StaticOptions = {
  method?: string
  body?: unknown
}

const data = demoJson as StaticDemoData

function toMinutes(value: string | null | undefined, fallback: string): number {
  const [hours, minutes] = (value ?? fallback).split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function localToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00`).getDay()
}

function demoCode(prefix: string): string {
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let code = ''
  for (let index = 0; index < 5; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `${prefix}-${code}`
}

function productsFor(params: URLSearchParams): Product[] {
  let products = data.products.filter((product) => product.isAvailable)

  const menu = params.get('menu')
  if (menu) products = products.filter((product) => product.menuType === menu)

  const category = params.get('category')
  if (category) products = products.filter((product) => product.categorySlug === category)

  if (params.get('featured') === 'true') {
    products = products.filter((product) => product.isFeatured)
  }

  const query = params.get('q')?.trim().toLowerCase()
  if (query) {
    products = products.filter((product) =>
      `${product.name} ${product.description ?? ''} ${product.ingredients ?? ''}`
        .toLowerCase()
        .includes(query),
    )
  }

  return products
}

function slotsFor(date: string) {
  const settings = data.settings
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date (YYYY-MM-DD)')
  if (Number.isNaN(new Date(`${date}T12:00:00`).getTime())) throw new Error('Invalid date')
  if (date < localToday()) throw new Error('Reservations cannot be made for a past date')

  const closedDays = (settings.closed_days ?? '')
    .split(',')
    .map((day) => Number.parseInt(day.trim(), 10))
    .filter((day) => Number.isInteger(day))
  if (closedDays.includes(weekdayOf(date))) {
    return { date, closed: true, slots: [] }
  }

  const open = toMinutes(settings.open_time, '12:00')
  const close = toMinutes(settings.close_time, '20:00')
  const slot = Number(settings.slot_minutes ?? 30)
  const seats = Number(settings.seats_per_slot ?? 40)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const isToday = date === localToday()
  const slots: Array<{ time: string; remaining: number }> = []

  for (let minute = open; minute + slot <= close; minute += slot) {
    if (isToday && minute <= nowMinutes + 30) continue
    slots.push({ time: fromMinutes(minute), remaining: seats })
  }

  return { date, closed: false, slots }
}

/**
 * API simulada para la demo estática de GitHub Pages.
 * No hay servidor ni base de datos: los datos vienen del JSON exportado y las
 * reservas/pedidos devuelven una confirmación ficticia.
 */
export async function staticApi<T>(path: string, options: StaticOptions = {}): Promise<T> {
  const [pathname, queryString = ''] = path.split('?')
  const params = new URLSearchParams(queryString)
  const method = (options.method ?? 'GET').toUpperCase()

  if (method === 'GET' && pathname === '/api/public/settings') {
    return { settings: data.settings } as T
  }
  if (method === 'GET' && pathname === '/api/public/categories') {
    return { categories: data.categories } as T
  }
  if (method === 'GET' && pathname === '/api/public/products') {
    return { products: productsFor(params) } as T
  }
  if (method === 'GET' && pathname === '/api/public/gallery') {
    const category = params.get('category')
    const images = category ? data.images.filter((image) => image.category === category) : data.images
    return { images } as T
  }
  if (method === 'GET' && pathname === '/api/public/careers') {
    return { openings: data.openings } as T
  }
  if (method === 'GET' && pathname === '/api/public/reservations/slots') {
    return slotsFor(params.get('date') ?? '') as T
  }

  if (method === 'POST' && pathname === '/api/public/reservations') {
    const body = (options.body ?? {}) as {
      customer?: { name?: string; phone?: string; email?: string }
      date?: string
      time?: string
      partySize?: number
    }
    if (!body.customer?.name || body.customer.name.trim().length < 2) throw new Error('Name is required')
    if (!body.customer.phone || body.customer.phone.trim().length < 7) throw new Error('Phone is required')
    if (!body.date || !body.time) throw new Error('Choose an available date and time')
    const partySize = Number(body.partySize)
    if (!Number.isInteger(partySize) || partySize < 1) throw new Error('Choose the number of guests')
    return {
      reservation: {
        id: Date.now(),
        code: demoCode('DEMO'),
        date: body.date,
        time: body.time,
        partySize,
      },
    } as T
  }

  if (method === 'POST' && pathname === '/api/public/orders') {
    const body = (options.body ?? {}) as {
      items?: Array<{ productId: number; quantity: number; notes?: string }>
    }
    if (!body.items || body.items.length === 0) throw new Error('The order needs at least one item')
    const byId = new Map(data.products.map((product) => [product.id, product]))
    let subtotalCents = 0
    for (const item of body.items) {
      const product = byId.get(item.productId)
      if (!product || !product.isAvailable) throw new Error('One of the items is no longer available')
      if (product.priceCents <= 0) throw new Error('Some items do not have a confirmed price yet')
      subtotalCents += product.priceCents * item.quantity
    }
    return {
      order: {
        id: Date.now(),
        code: demoCode('MZ'),
        subtotalCents,
        deliveryFeeCents: 0,
        totalCents: subtotalCents,
        type: 'pickup',
        isDemo: true,
      },
      whatsappUrl: null,
    } as T
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/auth')) {
    throw new Error('The admin panel is not available in the static GitHub Pages demo.')
  }

  throw new Error('This endpoint is not available in the static demo.')
}
