export type Settings = {
  restaurant_name: string | null
  tagline: string | null
  description: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  instagram: string | null
  currency: string | null
  delivery_fee_cents: string | null
  min_order_cents: string | null
  open_time: string | null
  close_time: string | null
  slot_minutes: string | null
  seats_per_slot: string | null
  closed_days: string | null
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

export type Product = {
  id: number
  name: string
  slug: string
  description: string | null
  priceCents: number
  imageUrl: string | null
  isFeatured: boolean
  isAvailable: boolean
  categoryId: number
  categoryName: string
  categorySlug: string
}

export type GalleryImage = {
  id: number
  url: string
  title: string | null
}

export type CartItem = {
  productId: number
  name: string
  priceCents: number
  imageUrl: string | null
  quantity: number
  notes: string
}

export type OrderResponse = {
  order: {
    id: number
    code: string
    subtotalCents: number
    deliveryFeeCents: number
    totalCents: number
    type: 'delivery' | 'pickup'
  }
  whatsappUrl: string
}

export type ReservationSlot = {
  time: string
  remaining: number
}

export type ReservationResponse = {
  reservation: {
    id: number
    code: string
    date: string
    time: string
    partySize: number
  }
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type AdminOrder = {
  id: number
  code: string
  type: 'delivery' | 'pickup'
  status: OrderStatus
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  address: string | null
  notes: string | null
  createdAt: string
  customer: { id: number; name: string; phone: string }
}

export type AdminOrderItem = {
  id: number
  productId: number | null
  productName: string
  unitPriceCents: number
  quantity: number
  notes: string | null
  lineTotalCents: number
}

export type AdminReservation = {
  id: number
  code: string
  date: string
  time: string
  partySize: number
  notes: string | null
  status: ReservationStatus
  createdAt: string
  customer: { id: number; name: string; phone: string }
}

export type AdminCustomer = {
  id: number
  name: string
  phone: string
  email: string | null
  notes: string | null
  createdAt: string
  ordersCount: number
  reservationsCount: number
  totalSpentCents: number
}

export type AdminCategory = Category & {
  isActive: boolean
  productCount?: number
}

export type AdminProduct = {
  id: number
  categoryId: number
  categoryName: string
  name: string
  slug: string
  description: string | null
  priceCents: number
  imageUrl: string | null
  isFeatured: boolean
  isAvailable: boolean
  sortOrder: number
}

export type Stats = {
  today: { orders: number; revenueCents: number }
  pendingOrders: number
  todayReservations: { total: number; guests: number }
  customers: number
  products: { total: number; available: number }
  revenueSeries: Array<{ day: string; revenueCents: number; orders: number }>
  topProducts: Array<{ name: string; quantity: number; revenueCents: number }>
  upcomingReservations: Array<{
    id: number
    code: string
    date: string
    time: string
    partySize: number
    status: ReservationStatus
    customerName: string
  }>
  recentOrders: Array<{
    id: number
    code: string
    type: 'delivery' | 'pickup'
    status: OrderStatus
    totalCents: number
    createdAt: string
    customerName: string
  }>
}

export type AuthUser = {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff'
}
