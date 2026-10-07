export const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`

export const FREE_SHIPPING_YEN = 3000
export const STANDARD_FEE = 400
export const EXPRESS_FEE = 500
export type Method = 'standard' | 'express'

type Line = { unitYen: number; qty: number }

/** 通常便は小計が3,000円以上で無料（未満は400円）。お急ぎ便は一律500円。空のカートは0円 */
export function shippingFee(subtotal: number, method: Method): number {
  if (subtotal === 0) return 0
  if (method === 'express') return EXPRESS_FEE
  return subtotal >= FREE_SHIPPING_YEN ? 0 : STANDARD_FEE
}

/** 送料無料まであといくらか（0なら達成済み） */
export const untilFreeShipping = (subtotal: number) => Math.max(0, FREE_SHIPPING_YEN - subtotal)

/** 価格はすべて税込。カート・レジ・注文履歴の合計は必ずこの関数から出す */
export function totals(lines: Line[], method: Method) {
  const subtotal = lines.reduce((s, l) => s + l.unitYen * l.qty, 0)
  const shipping = shippingFee(subtotal, method)
  const total = subtotal + shipping
  return {
    subtotal,
    shipping,
    total,
    tax: Math.floor((total * 10) / 110), // 内消費税（10%）
    points: Math.floor(subtotal / 100), // 1%還元
  }
}
