import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_QTY = 99

type CartLine = { productId: number; qty: number }
type Shop = {
  cart: CartLine[]
  add: (productId: number, qty?: number) => void
}

export const useShop = create<Shop>()(
  persist(
    (set) => ({
      cart: [],
      add: (productId, qty = 1) =>
        set((s) => {
          const hit = s.cart.find((l) => l.productId === productId)
          if (!hit) return { cart: [...s.cart, { productId, qty: Math.min(qty, MAX_QTY) }] }
          return { cart: s.cart.map((l) => (l === hit ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l)) }
        }),
    }),
    { name: 'bakugai:shop:v1', version: 1 },
  ),
)

export const cartCount = (cart: CartLine[]) => cart.reduce((n, l) => n + l.qty, 0)
