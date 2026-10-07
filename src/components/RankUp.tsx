import { rankUp } from '../lib/record'
import { useOrders, type Order } from '../store/useOrders'

/** 注文直後だけ出す。この注文で境目をまたいだ時だけ表示される */
export default function RankUp({ order }: { order: Order }) {
  const name = rankUp(useOrders((s) => s.orders), order)
  if (!name) return null
  return <p role="status" className="rounded-lg bg-gold p-3 text-center text-lg font-black text-mall-dark">🎉 ランクアップ！ 「{name}」になりました</p>
}
