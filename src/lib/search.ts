import { PRODUCTS, getCategory, score, type Product } from '../data/products'

export type SortKey = 'recommended' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest'
export const SORTS: [SortKey, string][] = [
  ['recommended', 'おすすめ順'], ['priceAsc', '価格の安い順'], ['priceDesc', '価格の高い順'], ['rating', '評価の高い順'], ['newest', '新着順'],
]
export const PRICE_BANDS: [string, string, number, number][] = [
  ['', 'すべての価格', 0, Infinity], ['1', '〜¥1,000', 0, 1000], ['2', '¥1,000〜¥3,000', 1000, 3000],
  ['3', '¥3,000〜¥10,000', 3000, 10000], ['4', '¥10,000〜', 10000, Infinity],
]

export type Query = { q?: string; cat?: string; brand?: string; band?: string; sort?: string; minRating?: number; express?: boolean }

/** 空白区切りの語がすべて「商品名・ブランド・カテゴリ名」のどこかに含まれる商品を、指定順で返す */
export function searchProducts({ q = '', cat, brand, band = '', sort = 'recommended', minRating = 0, express = false }: Query): Product[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const [, , lo, hi] = PRICE_BANDS.find((b) => b[0] === band) ?? PRICE_BANDS[0]
  const list = PRODUCTS.filter((p) => {
    if (cat && p.category !== cat) return false
    if (brand && p.brand !== brand) return false
    if (p.priceYen < lo || p.priceYen >= hi) return false
    if (p.rating < minRating) return false
    if (express && !p.express) return false
    const hay = `${p.name} ${p.brand} ${getCategory(p.category)?.name ?? ''}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
  const by: Record<string, (a: Product, b: Product) => number> = {
    priceAsc: (a, b) => a.priceYen - b.priceYen,
    priceDesc: (a, b) => b.priceYen - a.priceYen,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    newest: (a, b) => b.id - a.id,
    recommended: (a, b) => score(b) - score(a),
  }
  return list.sort(by[sort] ?? by.recommended)
}
