import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product } from '../lib/types'

const STORAGE_KEY = 'cv_cart_v1'

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotalCents: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  setNotes: (productId: number, notes: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        typeof item.productId === 'number' &&
        typeof item.name === 'string' &&
        typeof item.priceCents === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          quantity,
          notes: '',
        },
      ]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    )
  }, [])

  const setNotes = useCallback((productId: number, notes: string) => {
    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, notes } : item)),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
    return {
      items,
      count,
      subtotalCents,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      setQuantity,
      setNotes,
      clear,
    }
  }, [items, isOpen, addItem, removeItem, setQuantity, setNotes, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}
