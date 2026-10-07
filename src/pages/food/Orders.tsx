import { Link } from 'react-router-dom'
import { useNow } from '../../hooks/useNow'
import { foodStatusAt } from '../../lib/delivery'
import { yen } from '../../lib/money'
import { useOrders } from '../../store/useOrders'

export default function FoodOrders() {
  const orders = useOrders((s) => s.orders).filter((o) => o.kind === 'food')
  const now = useNow(1000)
  return (
    <div className="space-y-3 p-3 sm:p-4">
      <h2 className="text-xl font-black">デリバリーの注文履歴</h2>
      {orders.length === 0 && <p className="rounded-lg bg-white p-6 text-center text-gray-600">まだ注文がありません。<Link to="/food" className="font-bold text-eats-dark underline">お店を探す</Link></p>}
      {orders.map((o) => {
        const d = new Date(o.placedAt)
        return (
          <article key={o.id} className="space-y-1 rounded-lg bg-white p-4 text-sm">
            <p className="flex flex-wrap items-center justify-between gap-2">
              <b className="text-base">{o.restaurantName}</b>
              <span className="rounded bg-eats px-2 py-0.5 text-xs font-bold text-white">{foodStatusAt(o, now).label}</span>
            </p>
            <p className="text-xs text-gray-600">{d.getMonth() + 1}/{d.getDate()} {d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} ・ 合計 <b className="text-black">{yen(o.total)}</b></p>
            <ul>{o.lines.map((l, i) => <li key={i} className="line-clamp-1">{l.emoji} {l.name} × {l.qty}</li>)}</ul>
            <Link to={`/food/order/${o.id}`} className="inline-block rounded-full border px-4 py-1.5 font-bold">注文の状況</Link>
          </article>
        )
      })}
    </div>
  )
}
