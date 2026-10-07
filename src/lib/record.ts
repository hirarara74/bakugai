import { CATEGORIES, getCategory, getProduct } from '../data/products'
import type { Order } from '../store/useOrders'

/* ───── ランク ───── */
export const RANKS: [number, string][] = [
  [0, 'ビギナー'], [100_000, '常連'], [1_000_000, 'VIP'], [10_000_000, '富豪'], [100_000_000, '石油王'], [1_000_000_000, '伝説'],
]

/** 累計額から、いまのランクと次のランクまでの距離を出す */
export function rankOf(total: number) {
  let i = 0
  RANKS.forEach(([min], k) => { if (total >= min) i = k })
  const next = RANKS[i + 1]
  return {
    name: RANKS[i][1],
    level: i,
    next: next ? { name: next[1], remaining: next[0] - total } : null,
    progress: next ? (total - RANKS[i][0]) / (next[0] - RANKS[i][0]) : 1,
  }
}

export const totalOf = (orders: Order[]) => orders.reduce((s, o) => s + o.total, 0)

/** この注文でランクが上がったか（注文直後の演出用）。それより前の注文だけで前のランクを出す */
export function rankUp(orders: Order[], order: Order) {
  const before = totalOf(orders.filter((o) => o.placedAt < order.placedAt))
  const a = rankOf(before)
  const b = rankOf(before + order.total)
  return b.level > a.level ? b.name : null
}

/* ───── 実績バッジ ───── */
export type Badge = { id: string; emoji: string; name: string; desc: string; earned: boolean }

const DAY = 86_400_000
const itemCount = (o: Order) => o.lines.reduce((n, l) => n + l.qty, 0)

export function badgesOf(orders: Order[]): Badge[] {
  const times = orders.map((o) => new Date(o.placedAt).getTime()).sort((a, b) => a - b)
  const tenIn24h = times.some((t, i) => i + 9 < times.length && times[i + 9] - t < DAY)
  const shopCats = new Set(orders.filter((o) => o.kind === 'shop').flatMap((o) => o.lines.map((l) => getProduct(l.productId)?.category)))
  return [
    { id: 'first', emoji: '🎉', name: '初注文', desc: '最初の注文をする', earned: orders.length >= 1 },
    { id: 'big', emoji: '💰', name: '一撃100万', desc: '1回の注文で合計100万円以上', earned: orders.some((o) => o.total >= 1_000_000) },
    { id: 'hundred', emoji: '📦', name: '100個まとめ買い', desc: '1回の注文で合計100点以上', earned: orders.some((o) => itemCount(o) >= 100) },
    { id: 'ten', emoji: '⚡', name: '24時間で10回', desc: '24時間のうちに10回注文する', earned: tenIn24h },
    { id: 'all', emoji: '🗺️', name: '全カテゴリ制覇', desc: `通販の${CATEGORIES.length}カテゴリすべてで買う`, earned: CATEGORIES.every((c) => shopCats.has(c.id)) },
    { id: 'both', emoji: '🛵', name: '両刀使い', desc: '通販とデリバリーの両方で注文する', earned: orders.some((o) => o.kind === 'shop') && orders.some((o) => o.kind === 'food') },
  ]
}

/* ───── 購入統計 ───── */
export function categoryTotals(orders: Order[]) {
  const sums = new Map<string, number>()
  for (const o of orders) {
    for (const l of o.lines) {
      const id = o.kind === 'food' ? 'delivery' : (getProduct(l.productId)?.category ?? 'other')
      sums.set(id, (sums.get(id) ?? 0) + l.unitYen * l.qty)
    }
  }
  return [...sums]
    .map(([id, yen]) => ({ id, yen, name: id === 'delivery' ? 'デリバリー' : (getCategory(id)?.name ?? 'その他'), emoji: id === 'delivery' ? '🛵' : (getCategory(id)?.emoji ?? '🛍️') }))
    .sort((a, b) => b.yen - a.yen)
}

/** 今日までの days 日間の、日ごとの購入額（古い順） */
export function dailyTotals(orders: Order[], now: Date, days = 7) {
  const out = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - i))
    return { key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, label: `${d.getMonth() + 1}/${d.getDate()}`, yen: 0 }
  })
  for (const o of orders) {
    const d = new Date(o.placedAt)
    const hit = out.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    if (hit) hit.yen += o.total
  }
  return out
}

/** よく買ったもの（個数の多い順） */
export function topItems(orders: Order[], n = 5) {
  const m = new Map<string, { name: string; emoji: string; qty: number }>()
  for (const o of orders) {
    for (const l of o.lines) {
      const cur = m.get(l.name) ?? { name: l.name, emoji: l.emoji, qty: 0 }
      cur.qty += l.qty
      m.set(l.name, cur)
    }
  }
  return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, n)
}
