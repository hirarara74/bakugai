import { expect, test } from 'vitest'
import { totals, shippingFee, untilFreeShipping, yen } from './money'

test('送料無料の境目: 2,999円は400円、3,000円は無料', () => {
  expect(shippingFee(2999, 'standard')).toBe(400)
  expect(shippingFee(3000, 'standard')).toBe(0)
  expect(untilFreeShipping(2000)).toBe(1000)
  expect(untilFreeShipping(3500)).toBe(0)
})

test('お急ぎ便は小計に関わらず500円。空のカートは0円', () => {
  expect(shippingFee(10000, 'express')).toBe(500)
  expect(shippingFee(0, 'express')).toBe(0)
})

test('数量99でも合計が正しい（小計 + 送料 = 合計）', () => {
  const t = totals([{ unitYen: 3980, qty: 99 }], 'standard')
  expect(t.subtotal).toBe(394020)
  expect(t.shipping).toBe(0)
  expect(t.total).toBe(394020)
  expect(t.tax).toBe(35820) // floor(394020 * 10 / 110)
  expect(t.points).toBe(3940)
})

test('複数行・お急ぎ便の合計', () => {
  const t = totals([{ unitYen: 980, qty: 2 }, { unitYen: 1000, qty: 1 }], 'express')
  expect(t).toMatchObject({ subtotal: 2960, shipping: 500, total: 3460 })
})

test('yen は桁区切り付きで表示する', () => {
  expect(yen(1234567)).toBe('¥1,234,567')
})
