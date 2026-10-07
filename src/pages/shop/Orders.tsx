import { Link } from 'react-router-dom'
import { deliveryInfo } from '../../lib/date'
import { yen } from '../../lib/money'
import { useOrders } from '../../store/useOrders'

export default function Orders() {
  const orders = useOrders((s) => s.orders).filter((o) => o.kind === 'shop')
  return (
    <div className="space-y-3 p-3 sm:p-4">
      <h2 className="text-xl font-black">注文履歴</h2>
      {orders.length === 0 && <p className="rounded-lg bg-white p-6 text-center text-gray-600">まだ注文がありません。<Link to="/" className="font-bold text-mall underline">買い物をはじめる</Link></p>}
      {orders.map((o) => {
        const placed = new Date(o.placedAt)
        return (
          <article key={o.id} className="rounded-lg bg-white">
            <header className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg bg-gray-100 px-4 py-2 text-xs text-gray-700">
              <span>注文日 {placed.getFullYear()}/{placed.getMonth() + 1}/{placed.getDate()}</span>
              <span>合計 <b className="text-sm text-black">{yen(o.total)}</b></span>
              <span>注文番号 {o.id}</span>
            </header>
            <div className="space-y-2 p-4 text-sm">
              <p className="font-bold text-mall">お届け予定: {deliveryInfo(placed, o.method === 'express').label}</p>
              <ul className="space-y-1">
                {o.lines.map((l) => <li key={l.productId} className="line-clamp-1">{l.emoji} {l.name} × {l.qty}</li>)}
              </ul>
              <Link to={`/order/${o.id}`} className="inline-block rounded-full border border-gray-300 px-4 py-1.5 font-bold">注文の詳細</Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
