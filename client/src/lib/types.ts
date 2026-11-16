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
  facebook: string | null
  official_website: string | null
  currency: string | null
  delivery_fee_cents: string | null
  min_order_cents: string | null
  open_time: string | null
  close_time: string | null
  slot_minutes: string | null
  seats_per_slot: string | null
  closed_days: string | null
  hours_note: string | null
  demo_mode: string | null
  demo_notice: string | null
  hero_title: string | null
  hero_subtitle: string | null
  about_intro: string | null
  careers_intro: string | null
}

export type CategoryKind = 'food' | 'drink'

export type MenuType = 'lunch' | 'dinner' | 'cocktails' | 'beer' | 'wine'

export type Category = {
  id: number
  name: string
  slug: string
  kind: CategoryKind
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

export type Product = {
  id: number
  name: string
  slug: string
  description: string | null
  ingredients: string | null
  origin: string | null
  priceCents: number
  imageUrl: string | null
  isFeatured: boolean
  isAvailable: boolean
  isDemo: boolean
  menuType: MenuType | null
  categoryId: number
  categoryName: string
  categorySlug: string
  categoryKind: CategoryKind
}

export type GalleryImage = {
  id: number
  url: string
  title: string | null
  category: string
}

export type CareerOpening = {
  id: number
  title: string
  description: string | null
  employmentType: 'full_time' | 'part_time' | 'seasonal'
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
    isDemo: boolean
  }
  whatsappUrl: string | null
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

export type CustomerRef = {
  id: number
  name: string
  phone: string
  email: string | null
}

export type AdminOrder = {
  id: number
  code: string
  type: 'delivery' | 'pickup'
  status: OrderStatus
  isDemo: boolean
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  address: string | null
  notes: string | null
  createdAt: string
  customer: CustomerRef
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
  isDemo: boolean
  createdAt: string
  customer: CustomerRef
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
  ingredients: string | null
  origin: string | null
  priceCents: number
  imageUrl: string | null
  isFeatured: boolean
  isAvailable: boolean
  isDemo: boolean
  menuType: MenuType | null
  sortOrder: number
}

export type AdminGalleryImage = {
  id: number
  url: string
  title: string | null
  category: string
  sortOrder: number
  isActive: boolean
}

export type AdminCareerOpening = {
  id: number
  title: string
  description: string | null
  employmentType: 'full_time' | 'part_time' | 'seasonal'
  sortOrder: number
  isActive: boolean
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
