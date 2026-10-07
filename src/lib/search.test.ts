import { expect, test } from 'vitest'
import { searchProducts } from './search'

test('「イヤホン」で絞れて、全件が名前にイヤホンを含む', () => {
  const r = searchProducts({ q: 'イヤホン' })
  expect(r.length).toBeGreaterThan(0)
  expect(r.every((p) => p.name.includes('イヤホン'))).toBe(true)
})

test('空白区切りはAND条件。ヒットしない語を足すと0件', () => {
  expect(searchProducts({ q: 'イヤホン 存在しない語' })).toHaveLength(0)
})

test('価格順で並べ替えると昇順・降順になる', () => {
  const asc = searchProducts({ sort: 'priceAsc' }).map((p) => p.priceYen)
  const desc = searchProducts({ sort: 'priceDesc' }).map((p) => p.priceYen)
  expect(asc).toEqual([...asc].sort((a, b) => a - b))
  expect(desc).toEqual([...desc].sort((a, b) => b - a))
})

test('絞り込み: カテゴリ・価格帯・評価・お急ぎ便が効く', () => {
  const r = searchProducts({ cat: 'kitchen', band: '2', minRating: 4.2, express: true })
  expect(r.every((p) => p.category === 'kitchen' && p.priceYen >= 1000 && p.priceYen < 3000 && p.rating >= 4.2 && p.express)).toBe(true)
})
