import { expect, test } from 'vitest'
import { PRODUCTS, CATEGORIES } from './products'
import { starShares, reviewsFor } from './reviews'

test('商品は200点・カテゴリは10・IDは1始まりで連番', () => {
  expect(PRODUCTS).toHaveLength(200)
  expect(CATEGORIES).toHaveLength(10)
  expect(PRODUCTS.map((p) => p.id)).toEqual(Array.from({ length: 200 }, (_, i) => i + 1))
})

test('同じ商品のレビューは毎回同じ（乱数が固定）', () => {
  expect(reviewsFor(PRODUCTS[5])).toEqual(reviewsFor(PRODUCTS[5]))
})

test('価格は100円以上で、定価があるなら価格より高い', () => {
  for (const p of PRODUCTS) {
    expect(p.priceYen).toBeGreaterThanOrEqual(100)
    if (p.listPriceYen) expect(p.listPriceYen).toBeGreaterThan(p.priceYen)
  }
})

test('星の割合は合計1で、評価が高いほど5★が多い', () => {
  const hi = starShares(4.8)
  const lo = starShares(3.8)
  expect(hi.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  expect(hi[0]).toBeGreaterThan(lo[0])
})
