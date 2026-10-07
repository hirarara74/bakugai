import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_FOOD_QTY = 99

export type FoodLine = { key: string; itemId: number; optionIds: string[]; qty: number }
type Food = {
  restaurantId: number | null // カートは1店舗だけ
  lines: FoodLine[]
  /** 別の店のカートが入っているか（追加前に確認を出すため） */
  conflicts: (restaurantId: number) => boolean
  add: (restaurantId: number, itemId: number, optionIds: string[], qty: number, replace?: boolean) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  multiply: (k: number) => void // 「全部×10」
  clear: () => void
}

const clamp = (n: number) => Math.min(MAX_FOOD_QTY, Math.max(1, Math.floor(n) || 1))
// 同じ商品でもオプションが違えば別の行にする
const keyOf = (itemId: number, optionIds: string[]) => `${itemId}:${[...optionIds].sort().join(',')}`

export const useFood = create<Food>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      lines: [],
      conflicts: (rid) => get().restaurantId !== null && get().restaurantId !== rid && get().lines.length > 0,
      add: (rid, itemId, optionIds, qty, replace = false) =>
        set((s) => {
          const base = replace || s.restaurantId !== rid ? [] : s.lines
          const key = keyOf(itemId, optionIds)
          const hit = base.find((l) => l.key === key)
          const lines = hit
            ? base.map((l) => (l === hit ? { ...l, qty: clamp(l.qty + qty) } : l))
            : [...base, { key, itemId, optionIds: [...optionIds], qty: clamp(qty) }]
          return { restaurantId: rid, lines }
        }),
      setQty: (key, qty) => set((s) => ({ lines: s.lines.map((l) => (l.key === key ? { ...l, qty: clamp(qty) } : l)) })),
      remove: (key) =>
        set((s) => {
          const lines = s.lines.filter((l) => l.key !== key)
          return { lines, restaurantId: lines.length ? s.restaurantId : null }
        }),
      multiply: (k) => set((s) => ({ lines: s.lines.map((l) => ({ ...l, qty: clamp(l.qty * k) })) })),
      clear: () => set({ lines: [], restaurantId: null }),
    }),
    { name: 'bakugai:food:v1', version: 1 },
  ),
)

export const foodCount = (lines: FoodLine[]) => lines.reduce((n, l) => n + l.qty, 0)
