import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_QTY = 99

type CartLine = { productId: number; qty: number }
type Shop = {
  cart: CartLine[]
  later: number[] // 「あとで買う」に移した商品
  add: (productId: number, qty?: number) => void
  setQty: (productId: number, qty: number) => void
  remove: (productId: number) => void
  toLater: (productId: number) => void
  fromLater: (productId: number) => void
  multiply: (k: number) => void // 「全部×10」
  clear: () => void
}

const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1))

export const useShop = create<Shop>()(
  persist(
    (set) => ({
      cart: [],
      later: [],
      add: (productId, qty = 1) =>
        set((s) => {
          const hit = s.cart.find((l) => l.productId === productId)
          if (!hit) return { cart: [...s.cart, { productId, qty: clamp(qty) }] }
          return { cart: s.cart.map((l) => (l === hit ? { ...l, qty: clamp(l.qty + qty) } : l)) }
        }),
      setQty: (productId, qty) =>
        set((s) => ({ cart: s.cart.map((l) => (l.productId === productId ? { ...l, qty: clamp(qty) } : l)) })),
      remove: (productId) => set((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) })),
      toLater: (productId) =>
        set((s) => ({
          cart: s.cart.filter((l) => l.productId !== productId),
          later: s.later.includes(productId) ? s.later : [...s.later, productId],
        })),
      fromLater: (productId) =>
        set((s) => ({
          later: s.later.filter((id) => id !== productId),
          cart: s.cart.some((l) => l.productId === productId) ? s.cart : [...s.cart, { productId, qty: 1 }],
        })),
      multiply: (k) => set((s) => ({ cart: s.cart.map((l) => ({ ...l, qty: clamp(l.qty * k) })) })),
      clear: () => set({ cart: [] }),
    }),
    {
      name: 'bakugai:shop:v1',
      version: 2,
      // v1 は商品200点の時代のID。意味が変わったので、カートと「あとで買う」は引き継がない
      migrate: (state, from) => (from < 2 ? { cart: [], later: [] } : state),
    },
  ),
)

export const cartCount = (cart: CartLine[]) => cart.reduce((n, l) => n + l.qty, 0)
