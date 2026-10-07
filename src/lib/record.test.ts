import { expect, test } from 'vitest'
import { CATEGORIES, PRODUCTS } from '../data/products'
import type { Order } from '../store/useOrders'
import { badgesOf, categoryTotals, dailyTotals, rankOf, rankUp, topItems } from './record'

let n = 0
const order = (o: Partial<Order> & { lines?: Order['lines'] }): Order => ({
  id: `o${++n}`, kind: 'shop', lines: [{ productId: 1, name: 'A', emoji: '🛍️', unitYen: 1000, qty: 1 }],
  subtotal: 1000, shipping: 0, total: 1000, points: 0, method: 'standard', slot: '', dropoff: '', name: '', address: '',
  placedAt: new Date(2026, 9, 7, 12, 0).toISOString(), playMs: 1, ...o,
})

test('ランクは累計額の境目で上がる', () => {
  expect(rankOf(0).name).toBe('ビギナー')
  expect(rankOf(99_999).name).toBe('ビギナー')
  expect(rankOf(100_000).name).toBe('常連')
  expect(rankOf(1_000_000).name).toBe('VIP')
  expect(rankOf(10_000_000).name).toBe('富豪')
  expect(rankOf(100_000_000).name).toBe('石油王')
  expect(rankOf(5_000_000_000).name).toBe('伝説')
  expect(rankOf(5_000_000_000).next).toBeNull()
})

test('次のランクまでの残額と進み具合', () => {
  const r = rankOf(55_000)
  expect(r.next).toEqual({ name: '常連', remaining: 45_000 })
  expect(r.progress).toBeCloseTo(0.55)
})

test('rankUp: その注文で境目をまたいだ時だけランク名を返す', () => {
  const a = order({ total: 90_000, placedAt: new Date(2026, 9, 7, 10, 0).toISOString() })
  const b = order({ total: 20_000, placedAt: new Date(2026, 9, 7, 11, 0).toISOString() })
  const c = order({ total: 5_000, placedAt: new Date(2026, 9, 7, 12, 0).toISOString() })
  expect(rankUp([c, b, a], a)).toBeNull() // 9万円ではまだビギナー
  expect(rankUp([c, b, a], b)).toBe('常連') // 11万円で常連に
  expect(rankUp([c, b, a], c)).toBeNull() // 常連のまま
})

test('バッジ: 初注文・一撃100万・100点・両刀', () => {
  expect(badgesOf([]).every((b) => !b.earned)).toBe(true)
  const got = (os: Order[]) => badgesOf(os).filter((b) => b.earned).map((b) => b.id)
  expect(got([order({})])).toEqual(['first'])
  expect(got([order({ total: 1_000_000 })])).toContain('big')
  expect(got([order({ lines: [{ productId: 1, name: 'A', emoji: '', unitYen: 100, qty: 100 }] })])).toContain('hundred')
  expect(got([order({}), order({ kind: 'food' })])).toContain('both')
})

test('バッジ: 24時間で10回は、11回目が24時間以上あとなら成立しない', () => {
  const at = (h: number) => order({ placedAt: new Date(new Date(2026, 9, 7, 0, 0).getTime() + h * 3600_000).toISOString() })
  const ten = Array.from({ length: 10 }, (_, i) => at(i)) // 0〜9時間
  expect(badgesOf(ten).find((b) => b.id === 'ten')!.earned).toBe(true)
  const spread = Array.from({ length: 10 }, (_, i) => at(i * 3)) // 0〜27時間（最初と10個目が24時間以上離れる）
  expect(badgesOf(spread).find((b) => b.id === 'ten')!.earned).toBe(false)
})

test('バッジ: 全カテゴリ制覇は、10カテゴリすべての商品を買った時だけ', () => {
  const firstOfEach = CATEGORIES.map((c) => PRODUCTS.find((p) => p.category === c.id)!)
  const lines = (ps: typeof PRODUCTS) => ps.map((p) => ({ productId: p.id, name: p.name, emoji: p.emoji, unitYen: p.priceYen, qty: 1 }))
  expect(badgesOf([order({ lines: lines(firstOfEach) })]).find((b) => b.id === 'all')!.earned).toBe(true)
  expect(badgesOf([order({ lines: lines(firstOfEach.slice(1)) })]).find((b) => b.id === 'all')!.earned).toBe(false)
})

test('統計: カテゴリ別・日別・よく買ったもの', () => {
  const p1 = PRODUCTS[0]
  const os = [
    order({ lines: [{ productId: p1.id, name: p1.name, emoji: p1.emoji, unitYen: 500, qty: 2 }], total: 1000 }),
    order({ kind: 'food', lines: [{ productId: 101, name: 'ラーメン', emoji: '🍜', unitYen: 900, qty: 3 }], total: 2700 }),
  ]
  const cats = categoryTotals(os)
  expect(cats.map((c) => [c.id, c.yen])).toEqual([['delivery', 2700], [p1.category, 1000]])

  const days = dailyTotals(os, new Date(2026, 9, 8, 9, 0), 7)
  expect(days).toHaveLength(7)
  expect(days[6].label).toBe('10/8')
  expect(days[5]).toMatchObject({ label: '10/7', yen: 3700 }) // 注文は10/7
  expect(days[6].yen).toBe(0)

  expect(topItems(os, 1)).toEqual([{ name: 'ラーメン', emoji: '🍜', qty: 3 }])
})
