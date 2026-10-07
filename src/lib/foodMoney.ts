import type { MenuItem } from '../data/food'

export const TIPS = [0, 100, 200, 300]
export const SMALL_ORDER_LIMIT = 1000

/** 選んだオプション(choice id の配列)の追加料金の合計 */
export function optionsExtra(item: MenuItem, optionIds: string[]): number {
  return item.groups.flatMap((g) => g.choices).filter((c) => optionIds.includes(c.id)).reduce((s, c) => s + c.priceYen, 0)
}

export const unitPrice = (item: MenuItem, optionIds: string[]) => item.priceYen + optionsExtra(item, optionIds)

/** 選んだオプションの名前（グループの並び順） */
export function optionNames(item: MenuItem, optionIds: string[]): string[] {
  return item.groups.flatMap((g) => g.choices).filter((c) => optionIds.includes(c.id)).map((c) => c.name)
}

/** 必須グループは1つ以上、すべてのグループが max 以下なら注文できる */
export function selectionValid(item: MenuItem, optionIds: string[]): boolean {
  return item.groups.every((g) => {
    const n = g.choices.filter((c) => optionIds.includes(c.id)).length
    return n <= g.max && (!g.required || n >= 1)
  })
}

/** 小計 + 配達料 + サービス料(小計の10%) + 少額注文手数料(1,000円未満の不足分) + チップ。価格はすべて税込 */
export function foodTotals(subtotal: number, deliveryFee: number, tip: number) {
  const empty = subtotal === 0
  const delivery = empty ? 0 : deliveryFee
  const service = Math.floor(subtotal * 0.1)
  const small = empty ? 0 : Math.max(0, SMALL_ORDER_LIMIT - subtotal)
  const tipYen = empty ? 0 : Math.max(0, Math.floor(tip) || 0)
  return { subtotal, delivery, service, small, tip: tipYen, fees: delivery + service + small, total: subtotal + delivery + service + small + tipYen }
}
