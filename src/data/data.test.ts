import { expect, test } from 'vitest'
import { PRODUCTS, CATEGORIES, MAKER_NAMES, imagePrompt, makersInCategory, siblingsOf } from './products'
import { reviewsFor, starShares } from './reviews'

test('商品は400点（100品目 × 4メーカー）・カテゴリは10・IDは1始まりで連番', () => {
  expect(PRODUCTS).toHaveLength(400)
  expect(CATEGORIES).toHaveLength(10)
  expect(PRODUCTS.map((p) => p.id)).toEqual(Array.from({ length: 400 }, (_, i) => i + 1))
  expect(new Set(PRODUCTS.map((p) => p.item)).size).toBe(100)
})

test('同じ品目は4つの別々のメーカーが売っている', () => {
  for (const item of new Set(PRODUCTS.map((p) => p.item))) {
    const brands = PRODUCTS.filter((p) => p.item === item).map((p) => p.brand)
    expect(brands).toHaveLength(4)
    expect(new Set(brands).size).toBe(4)
  }
})

test('カテゴリごとに複数メーカーがあり、価格帯（プレミアム・標準・お手頃）が混ざる', () => {
  expect(MAKER_NAMES).toHaveLength(18)
  for (const c of CATEGORIES) {
    expect(makersInCategory(c.id).length).toBeGreaterThanOrEqual(5)
    const tiers = new Set(PRODUCTS.filter((p) => p.category === c.id).map((p) => p.tier))
    expect(tiers.size).toBe(3)
  }
})

test('プレミアムは平均価格が高く、お手頃は安い（同じ品目どうしで比べる）', () => {
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const by = (t: string) => avg(PRODUCTS.filter((p) => p.tier === t).map((p) => p.priceYen / PRODUCTS.filter((q) => q.item === p.item).reduce((s, q) => s + q.priceYen, 0)))
  expect(by('P')).toBeGreaterThan(by('S'))
  expect(by('S')).toBeGreaterThan(by('B'))
})

test('siblingsOf は同じ品目の他メーカー3件を、安い順に返す', () => {
  const p = PRODUCTS[0]
  const s = siblingsOf(p)
  expect(s).toHaveLength(3)
  expect(s.every((x) => x.item === p.item && x.id !== p.id)).toBe(true)
  expect(s.map((x) => x.priceYen)).toEqual([...s.map((x) => x.priceYen)].sort((a, b) => a - b))
})

test('商品説明: 3段落・仕様9項目・特長4つ、メーカー名が文に入る', () => {
  for (const p of PRODUCTS) {
    expect(p.description).toHaveLength(3)
    expect(p.description[0]).toContain(p.brand)
    expect(p.specs).toHaveLength(9)
    expect(p.bullets).toHaveLength(4)
  }
})

test('同じ商品のレビューは毎回同じ（乱数が固定）で24件、星は1〜5', () => {
  const a = reviewsFor(PRODUCTS[5])
  expect(a).toEqual(reviewsFor(PRODUCTS[5]))
  expect(a).toHaveLength(24)
  expect(a.every((r) => r.stars >= 1 && r.stars <= 5 && r.body.length > 20)).toBe(true)
})

test('レビューの文面はメーカーの価格帯で変わる（お手頃は価格、プレミアムは質感）', () => {
  const text = (tier: string) => PRODUCTS.filter((p) => p.tier === tier).slice(0, 40).flatMap((p) => reviewsFor(p)).map((r) => r.body).join('')
  expect(text('B')).toMatch(/コスパ|この価格/)
  expect(text('P')).toMatch(/質感|仕上げ/)
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

test('画像プロンプト: 全商品で作れる。食品は料理写真、それ以外は色とメーカーの雰囲気入り', () => {
  for (const p of PRODUCTS) expect(imagePrompt(p).prompt.length).toBeGreaterThan(30)
  const food = PRODUCTS.find((p) => p.category === 'food')!
  expect(imagePrompt(food).prompt).toContain('professional product photo')
  const gadget = PRODUCTS.find((p) => p.category === 'gadget')!
  expect(imagePrompt(gadget).prompt).toMatch(/product photo of a .+, .+design/)
  expect(imagePrompt(gadget).negative).toContain('food')
})
