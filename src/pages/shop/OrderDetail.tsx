import { Link, useLocation, useParams } from 'react-router-dom'
import RankUp from '../../components/RankUp'
import Tracking from '../../components/Tracking'
import { deliveryInfo } from '../../lib/date'
import { yen } from '../../lib/money'
import { paymentName } from '../../lib/payment'
import { useOrders } from '../../store/useOrders'

/** 注文完了 兼 注文詳細。注文直後（fresh）だけ「ありがとうございます」の見出しにする */
export default function OrderDetail() {
  const { id } = useParams()
  const fresh = Boolean((useLocation().state as { fresh?: boolean } | null)?.fresh)
  const order = useOrders((s) => s.orders.find((o) => o.id === id))
  if (!order) return <p className="p-6">注文が見つかりませんでした。<Link to="/orders" className="font-bold text-mall underline">注文履歴へ</Link></p>

  const placed = new Date(order.placedAt)
  const eta = deliveryInfo(placed, order.method === 'express').label

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {fresh && <RankUp order={order} />}
      <section className="rounded-lg bg-white p-5">
        <h2 className="text-xl font-black">{fresh ? '✓ ご注文ありがとうございます' : 'ご注文の詳細'}</h2>
        <p className="mt-1 text-sm">注文番号 <b data-testid="order-id">{order.id}</b></p>
        <p className="text-sm">お届け予定: <b className="text-mall">{eta}</b>（{order.method === 'express' ? 'お急ぎ便' : '通常便'}／{order.slot}）</p>
        <p className="mt-3 text-xs text-gray-600">※ 架空のショップです。実際の配送・請求は発生しません。</p>
        <div className="mt-4 flex gap-3 text-sm font-bold">
          <Link to="/orders" className="rounded-full border border-gray-300 px-4 py-2">注文履歴を見る</Link>
          <Link to="/" className="rounded-full bg-gold px-4 py-2 text-mall-dark">買い物を続ける</Link>
        </div>
      </section>

      <Tracking order={order} />

      <section className="rounded-lg border border-dashed border-gray-400 bg-white p-5 text-sm" aria-label="確認メール">
        <p className="text-xs text-gray-500">件名: 【BAKUGAI MALL】ご注文を受け付けました（架空のメールです）</p>
        <p className="mt-2">{order.name} 様</p>
        <p>ご注文ありがとうございます。以下の内容で承りました。</p>
        <ul className="my-3 space-y-1">
          {order.lines.map((l) => <li key={l.productId} className="flex justify-between gap-3"><span>{l.emoji} {l.name} × {l.qty}</span><span>{yen(l.unitYen * l.qty)}</span></li>)}
        </ul>
        <div className="space-y-1 border-t pt-2">
          <p className="flex justify-between"><span>小計</span><span>{yen(order.subtotal)}</span></p>
          <p className="flex justify-between"><span>送料</span><span>{order.shipping === 0 ? '無料' : yen(order.shipping)}</span></p>
          {(order.payFee ?? 0) > 0 && <p className="flex justify-between"><span>支払い手数料</span><span>{yen(order.payFee ?? 0)}</span></p>}
          <p className="flex justify-between text-base font-black"><span>合計（税込）</span><span data-testid="order-total">{yen(order.total)}</span></p>
          <p className="text-xs text-gray-500">獲得ポイント {order.points}pt</p>
        </div>
        <p className="mt-3 text-xs text-gray-600">お届け先: {order.address}（置き配: {order.dropoff}）</p>
        <p className="text-xs text-gray-600">お支払い: {paymentName(order.payment)}</p>
      </section>
    </div>
  )
}
