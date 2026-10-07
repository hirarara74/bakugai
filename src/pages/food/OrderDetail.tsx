import { lazy, Suspense, useCallback, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import RankUp from '../../components/RankUp'
import { HOME_LNGLAT, getRestaurant } from '../../data/food'
import { useNow } from '../../hooks/useNow'
import { FOOD_STAGES, foodStatusAt } from '../../lib/delivery'
import { yen } from '../../lib/money'
import { useOrders } from '../../store/useOrders'

// 地図は追跡画面を開いた時にだけ読み込む（maplibre は大きいので、トップの表示を重くしない）
const MapView = lazy(() => import('../../components/MapView'))

const COURIERS = ['ハルカ', 'ケンタ', 'ミナト', 'サクラ', 'リク']
const clock = (ms: number) => new Date(ms).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

export default function FoodOrderDetail() {
  const { id } = useParams()
  const fresh = Boolean((useLocation().state as { fresh?: boolean } | null)?.fresh)
  const order = useOrders((s) => s.orders.find((o) => o.id === id))
  const now = useNow(1000)
  const [mapFailed, setMapFailed] = useState(false)
  const onFail = useCallback(() => setMapFailed(true), [])

  if (!order || order.kind !== 'food') return <p className="p-6">注文が見つかりませんでした。<Link to="/food/orders" className="font-bold text-eats-dark underline">注文履歴へ</Link></p>
  const r = getRestaurant(order.restaurantId ?? 0)
  const st = foodStatusAt(order, now)
  const eta = new Date(order.placedAt).getTime() + order.playMs
  const courier = COURIERS[Number(order.id.slice(-1)) % COURIERS.length]

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {fresh && <RankUp order={order} />}
      <section className="space-y-3 rounded-lg bg-white p-5">
        <h2 className="text-xl font-black">{fresh ? '✓ ご注文ありがとうございます' : 'ご注文の状況'}</h2>
        <p className="text-sm text-gray-600">{order.restaurantName} ・ 注文番号 <span data-testid="order-id">{order.id}</span></p>

        <p className="text-3xl font-black" aria-live="polite">
          {st.done ? '到着しました' : <>到着予定 <span className="text-eats-dark">{clock(eta)}</span></>}
        </p>
        <p role="status" className="font-bold" data-testid="status-label">{st.label}</p>

        <ol className="grid grid-cols-5 gap-1" aria-label="注文の進み具合">
          {FOOD_STAGES.map((s, i) => (
            <li key={s} aria-current={i === st.stage ? 'step' : undefined} className="space-y-1 text-center text-[11px]">
              <span className={`block h-1.5 rounded ${i <= st.stage ? 'bg-eats' : 'bg-gray-200'}`} />
              <span className={i === st.stage ? 'font-bold' : 'text-gray-500'}>{s}</span>
            </li>
          ))}
        </ol>

        {st.onMap && r && (
          mapFailed ? (
            <p className="rounded-lg bg-gray-100 p-6 text-center text-sm text-gray-600">この端末では地図を表示できません（進み具合は上のバーで確認できます）。</p>
          ) : (
            <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100 sm:h-80" />}>
              <MapView rest={r.lngLat} home={HOME_LNGLAT} progress={st.progress} onFail={onFail} />
            </Suspense>
          )
        )}

        {st.onMap && (
          <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <span className="text-3xl" aria-hidden>🛵</span>
            <div><p className="font-bold">{courier}さん（配達員）</p><p className="text-gray-600">★4.9 ・ バイク ・ 架空の配達員です</p></div>
          </div>
        )}
        {st.done && <p className="rounded-md bg-green-50 p-3 text-sm">🏠 {order.dropoff}。ご利用ありがとうございました（※架空の配達です）。</p>}
      </section>

      <section className="rounded-lg bg-white p-5 text-sm" aria-label="注文内容">
        <h3 className="mb-2 font-black">ご注文内容</h3>
        <ul className="space-y-1">
          {order.lines.map((l, i) => <li key={i} className="flex justify-between gap-3"><span>{l.emoji} {l.name} × {l.qty}</span><span>{yen(l.unitYen * l.qty)}</span></li>)}
        </ul>
        <div className="mt-2 space-y-1 border-t pt-2">
          <p className="flex justify-between"><span>小計</span><span>{yen(order.subtotal)}</span></p>
          <p className="flex justify-between"><span>配達料・サービス料など</span><span>{yen(order.shipping)}</span></p>
          <p className="flex justify-between"><span>チップ</span><span>{yen(order.tip ?? 0)}</span></p>
          <p className="flex justify-between text-base font-black"><span>合計（税込）</span><span data-testid="order-total">{yen(order.total)}</span></p>
        </div>
        <div className="mt-4 flex gap-3 font-bold">
          <Link to="/food/orders" className="rounded-full border px-4 py-2">注文履歴</Link>
          <Link to="/food" className="rounded-full bg-eats px-4 py-2 text-white">お店を探す</Link>
        </div>
      </section>
    </div>
  )
}
