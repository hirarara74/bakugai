import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FoodPhoto from '../../components/FoodPhoto'
import { getMenuItem, getRestaurant } from '../../data/food'
import { celebrate } from '../../lib/celebrate'
import { foodPlayMs } from '../../lib/delivery'
import { TIPS, foodTotals, optionNames, unitPrice } from '../../lib/foodMoney'
import { yen } from '../../lib/money'
import { FOOD_PAYMENTS } from '../../lib/payment'
import { MAX_FOOD_QTY, useFood } from '../../store/useFood'
import { useOrders, type OrderLine } from '../../store/useOrders'
import { useProfile } from '../../store/useProfile'

const DROPOFFS = ['玄関前に置く', '手渡し', 'ドアの前に置く（インターホンなし）']

export default function FoodCheckout() {
  const nav = useNavigate()
  const { restaurantId, lines, setQty, remove, multiply, clear } = useFood()
  const place = useOrders((s) => s.place)
  const { address, speed } = useProfile()
  const [tip, setTip] = useState(100)
  const [custom, setCustom] = useState(false)
  const [dropoff, setDropoff] = useState(DROPOFFS[0])
  const [payId, setPayId] = useState(FOOD_PAYMENTS[0].id)
  const placed = useRef(false)

  const r = restaurantId ? getRestaurant(restaurantId) : undefined
  const rows = lines.flatMap((l) => {
    const item = getMenuItem(l.itemId)
    return item ? [{ l, item, unit: unitPrice(item, l.optionIds), opts: optionNames(item, l.optionIds) }] : []
  })
  const subtotal = rows.reduce((s, x) => s + x.unit * x.l.qty, 0)
  const t = foodTotals(subtotal, r?.feeYen ?? 0, tip)

  if (!r || rows.length === 0) {
    if (placed.current) return null
    return <p className="p-6">カートは空です。<Link to="/food" className="font-bold text-eats-dark underline">お店を探す</Link></p>
  }

  const confirm = () => {
    placed.current = true
    const orderLines: OrderLine[] = rows.map(({ l, item, unit, opts }) => ({
      productId: item.id, emoji: item.emoji, unitYen: unit, qty: l.qty,
      name: opts.length ? `${item.name}（${opts.join('・')}）` : item.name,
    }))
    const id = place({
      kind: 'food', lines: orderLines, subtotal: t.subtotal, shipping: t.fees, total: t.total, points: 0, tip: t.tip,
      method: 'standard', slot: '', dropoff, payment: payId, payFee: 0, name: address.name, address: `${address.zip} ${address.address}`,
      playMs: foodPlayMs(speed, r.etaMin), restaurantId: r.id, restaurantName: r.name,
    })
    nav(`/food/order/${id}`, { replace: true, state: { fresh: true } })
    clear()
    void celebrate(t.total)
  }

  return (
    <div className="grid gap-4 p-3 sm:p-4 md:grid-cols-[1fr_320px]">
      <section className="space-y-4 rounded-lg bg-white p-4">
        <h2 className="text-xl font-black">{r.emoji} {r.name} のカート</h2>
        <ul className="divide-y">
          {rows.map(({ l, item, unit, opts }) => (
            <li key={l.key} className="flex items-center gap-3 py-3">
              <FoodPhoto kind="f" id={item.id} emoji={item.emoji} hue={r.hue} className="size-14 rounded-lg text-xl" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.name}</p>
                {opts.length > 0 && <p className="text-xs text-gray-600">{opts.join('・')}</p>}
                <p className="text-sm">{yen(unit * l.qty)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-8 rounded-full border" aria-label={`${item.name}を減らす`} disabled={l.qty <= 1} onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                <span className="w-6 text-center font-bold">{l.qty}</span>
                <button className="size-8 rounded-full border" aria-label={`${item.name}を増やす`} disabled={l.qty >= MAX_FOOD_QTY} onClick={() => setQty(l.key, l.qty + 1)}>＋</button>
                <button className="ml-1 text-sm text-gray-600 underline" onClick={() => remove(l.key)}>削除</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <Link to={`/food/r/${r.id}`} className="text-sm font-bold text-eats-dark underline">＋ 商品を追加する</Link>
          <button className="rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-mall-dark" onClick={() => multiply(10)}>🔥 全部×10</button>
        </div>

        <fieldset>
          <legend className="mb-2 font-bold">配達員へのチップ</legend>
          <div className="flex flex-wrap gap-2">
            {TIPS.map((v) => (
              <label key={v} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-bold ${!custom && tip === v ? 'border-eats bg-eats text-white' : ''}`}>
                <input type="radio" name="tip" className="sr-only" checked={!custom && tip === v} onChange={() => { setCustom(false); setTip(v) }} />
                {v === 0 ? 'なし' : yen(v)}
              </label>
            ))}
            <label className={`flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold ${custom ? 'border-eats' : ''}`}>
              <input type="radio" name="tip" className="sr-only" checked={custom} onChange={() => setCustom(true)} />
              その他 ¥
              <input type="number" min={0} aria-label="チップの金額" className="w-20 rounded border px-1 py-0.5" value={custom ? tip : ''} onFocus={() => setCustom(true)} onChange={(e) => { setCustom(true); setTip(Math.max(0, Number(e.target.value) || 0)) }} />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-1 font-bold">お支払い方法</legend>
          <p className="text-xs text-gray-600">すべて架空です。カード番号などの入力は不要で、請求は発生しません。</p>
          {FOOD_PAYMENTS.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm has-[:checked]:border-eats has-[:checked]:bg-eats/10">
              <input type="radio" name="pay" checked={payId === p.id} onChange={() => setPayId(p.id)} />
              <span><b>{p.name}</b><br /><span className="text-gray-600">{p.note}</span></span>
            </label>
          ))}
        </fieldset>

        <label className="block text-sm font-bold">受け渡し方法
          <select className="mt-1 w-full rounded-md border px-3 py-2" value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
            {DROPOFFS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <p className="text-sm text-gray-600">お届け先: {address.address}（{address.name} 様）</p>
      </section>

      <aside className="h-fit space-y-2 rounded-lg bg-white p-4 text-sm md:sticky md:top-4" aria-label="ご注文金額">
        <h3 className="font-black">ご注文金額</h3>
        <div className="flex justify-between"><span>小計</span><span>{yen(t.subtotal)}</span></div>
        <div className="flex justify-between"><span>配達料</span><span>{t.delivery === 0 ? '無料' : yen(t.delivery)}</span></div>
        <div className="flex justify-between"><span>サービス料（10%）</span><span>{yen(t.service)}</span></div>
        {t.small > 0 && <div className="flex justify-between text-red-700"><span>少額注文手数料</span><span>{yen(t.small)}</span></div>}
        <div className="flex justify-between"><span>チップ</span><span>{yen(t.tip)}</span></div>
        <div className="flex justify-between border-t pt-2 text-lg font-black"><span>合計（税込）</span><span data-testid="total">{yen(t.total)}</span></div>
        {t.small > 0 && <p className="text-xs text-gray-600">あと {yen(t.small)} 注文すると少額注文手数料がかかりません。</p>}
        <p className="text-xs text-gray-600">お支払い: {FOOD_PAYMENTS.find((p) => p.id === payId)?.name}</p>
        <button className="w-full rounded-full bg-eats py-3 font-bold text-white hover:brightness-110" onClick={confirm}>注文を確定する</button>
        <p className="text-xs text-gray-500">※ 架空のサービスです。請求も配達も発生しません。</p>
      </aside>
    </div>
  )
}
