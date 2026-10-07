import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Method } from '../lib/money'

export type OrderLine = { productId: number; name: string; emoji: string; unitYen: number; qty: number }
export type Order = {
  id: string
  kind: 'shop' | 'food'
  lines: OrderLine[]
  subtotal: number
  shipping: number
  total: number
  points: number
  method: Method
  slot: string
  dropoff: string
  name: string
  address: string
  placedAt: string // ISO。配送状況はこの時刻と playMs から毎回計算する
  playMs: number // 注文から配達完了までにかかる実時間(ms)。注文時の「配送の進み方」設定で決まる
}

type Orders = {
  orders: Order[] // 新しい順
  place: (o: Omit<Order, 'id' | 'placedAt'>) => string
}

const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')

export const useOrders = create<Orders>()(
  persist(
    (set) => ({
      orders: [],
      place: (o) => {
        const id = `503-${digits(7)}-${digits(7)}`
        set((s) => ({ orders: [{ ...o, id, placedAt: new Date().toISOString() }, ...s.orders] }))
        return id
      },
    }),
    {
      name: 'bakugai:orders:v1',
      version: 2,
      // v1 の注文には playMs がない。早送り相当（2分）で補う
      migrate: (state, from) => {
        const s = state as { orders: Order[] }
        if (from < 2) s.orders = s.orders.map((o) => ({ ...o, playMs: o.playMs ?? 120_000 }))
        return s
      },
    },
  ),
)

export const totalSpent = (orders: Order[]) => orders.reduce((s, o) => s + o.total, 0)
