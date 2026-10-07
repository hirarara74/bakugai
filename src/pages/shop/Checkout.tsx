import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartItems, toLine } from '../../lib/cart'
import { deliveryInfo } from '../../lib/date'
import { playMsFor } from '../../lib/delivery'
import { EXPRESS_FEE, STANDARD_FEE, totals, yen, type Method } from '../../lib/money'
import { useOrders } from '../../store/useOrders'
import { ZIP_TABLE, useProfile } from '../../store/useProfile'
import { useShop } from '../../store/useShop'

const STEPS = ['お届け先', '配送方法', 'お支払い', '確認']
const SLOTS = ['指定なし', '午前中', '14〜16時', '16〜18時', '18〜20時', '19〜21時']
const DROPOFFS = ['玄関前', '宅配ボックス', 'ガスメーターボックス', '手渡し']
const input = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2'

export default function Checkout() {
  const nav = useNavigate()
  const cart = useShop((s) => s.cart)
  const clear = useShop((s) => s.clear)
  const place = useOrders((s) => s.place)
  const { address, setAddress, speed } = useProfile()
  const [step, setStep] = useState(0)
  const [method, setMethod] = useState<Method>('standard')
  const [slot, setSlot] = useState(SLOTS[0])
  const [dropoff, setDropoff] = useState(DROPOFFS[0])
  const [zipMsg, setZipMsg] = useState('')
  const placed = useRef(false)

  const items = cartItems(cart)
  const lines = items.map(toLine)
  const t = totals(lines, method)
  const canExpress = items.every((i) => i.product.express)
  const std = deliveryInfo(new Date(), false)
  const exp = deliveryInfo(new Date(), true)
  const eta = method === 'express' ? exp.label : std.label

  const addressOk = address.name.trim() !== '' && /^\d{3}-?\d{4}$/.test(address.zip.trim()) && address.address.trim() !== ''

  if (items.length === 0 && !placed.current) {
    return <p className="p-6">カートが空です。<Link to="/" className="font-bold text-mall underline">商品を探しに行く</Link></p>
  }

  const fillZip = () => {
    const z = address.zip.trim().replace(/^(\d{3})(\d{4})$/, '$1-$2')
    const hit = ZIP_TABLE[z]
    if (hit) { setAddress({ zip: z, address: `${hit} 1-2-3` }); setZipMsg('') }
    else setZipMsg(`見つかりません。架空の郵便番号（${Object.keys(ZIP_TABLE).join('、')}）を試してください`)
  }

  const confirm = () => {
    placed.current = true
    const id = place({
      kind: 'shop', lines, subtotal: t.subtotal, shipping: t.shipping, total: t.total, points: t.points,
      method, slot, dropoff, name: address.name, address: `${address.zip} ${address.address}`,
      playMs: playMsFor(speed, new Date(), method === 'express'),
    })
    nav(`/order/${id}`, { replace: true, state: { fresh: true } })
    clear()
  }

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <ol className="flex gap-1 text-xs sm:text-sm" aria-label="レジの進み具合">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? 'step' : undefined}
            className={`flex-1 rounded-md py-2 text-center font-bold ${i === step ? 'bg-mall text-white' : i < step ? 'bg-mall/20 text-mall' : 'bg-white text-gray-500'}`}>
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <section className="space-y-4 rounded-lg bg-white p-4">
          {step === 0 && (
            <>
              <h2 className="text-lg font-black">お届け先</h2>
              <p className="rounded-md bg-gold/20 p-2 text-xs">ダミーの住所です。本名・実際の住所・電話番号は入力しないでください（入力した内容はこの端末にだけ保存されます）。</p>
              <label className="block text-sm font-bold">お名前
                <input className={input} value={address.name} onChange={(e) => setAddress({ name: e.target.value })} />
              </label>
              <div className="text-sm font-bold">郵便番号
                <div className="flex gap-2">
                  <input className={input} inputMode="numeric" value={address.zip} onChange={(e) => setAddress({ zip: e.target.value })} />
                  <button className="mt-1 whitespace-nowrap rounded-md border border-gray-300 px-3 text-sm" onClick={fillZip}>住所を自動入力</button>
                </div>
                {zipMsg && <p role="alert" className="mt-1 text-xs font-normal text-red-600">{zipMsg}</p>}
              </div>
              <label className="block text-sm font-bold">住所
                <input className={input} value={address.address} onChange={(e) => setAddress({ address: e.target.value })} />
              </label>
              {!addressOk && <p role="alert" className="text-xs text-red-600">お名前・郵便番号（例: 999-0001）・住所をすべて入力してください。</p>}
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-black">配送方法</h2>
              <fieldset className="space-y-2">
                <legend className="sr-only">配送方法</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[:checked]:border-mall has-[:checked]:bg-mall/5">
                  <input type="radio" name="m" checked={method === 'standard'} onChange={() => setMethod('standard')} />
                  <span><b>通常便</b> {totals(lines, 'standard').shipping === 0 ? '無料' : yen(STANDARD_FEE)}<br /><span className="text-sm text-gray-600">{std.label} お届け</span></span>
                </label>
                <label className={`flex items-start gap-3 rounded-md border p-3 has-[:checked]:border-mall has-[:checked]:bg-mall/5 ${canExpress ? 'cursor-pointer' : 'opacity-50'}`}>
                  <input type="radio" name="m" disabled={!canExpress} checked={method === 'express'} onChange={() => setMethod('express')} />
                  <span><b>お急ぎ便</b> {yen(EXPRESS_FEE)}<br /><span className="text-sm text-gray-600">{canExpress ? `${exp.label} お届け` : 'お急ぎ便に対応していない商品が含まれています'}</span></span>
                </label>
              </fieldset>
              <label className="block text-sm font-bold">お届け時間帯
                <select className={input} value={slot} onChange={(e) => setSlot(e.target.value)}>{SLOTS.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
              <label className="block text-sm font-bold">置き配の場所
                <select className={input} value={dropoff} onChange={(e) => setDropoff(e.target.value)}>{DROPOFFS.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-black">お支払い方法</h2>
              <label className="flex items-start gap-3 rounded-md border border-mall bg-mall/5 p-3">
                <input type="radio" name="pay" checked readOnly />
                <span><b>爆買いマネー</b>（残高 ∞）<br /><span className="text-sm text-gray-600">架空の電子マネーです。カード番号などの入力は一切ありません。請求は発生しません。</span></span>
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-black">ご注文内容の確認</h2>
              <dl className="divide-y text-sm">
                <div className="flex items-start justify-between gap-3 py-3"><div><dt className="font-bold">お届け先</dt><dd>{address.name}<br />{address.zip} {address.address}</dd></div><button className="text-mall underline" onClick={() => setStep(0)}>変更</button></div>
                <div className="flex items-start justify-between gap-3 py-3"><div><dt className="font-bold">配送方法</dt><dd>{method === 'express' ? 'お急ぎ便' : '通常便'} ／ {eta} お届け<br />時間帯: {slot} ／ 置き配: {dropoff}</dd></div><button className="text-mall underline" onClick={() => setStep(1)}>変更</button></div>
                <div className="flex items-start justify-between gap-3 py-3"><div><dt className="font-bold">お支払い</dt><dd>爆買いマネー</dd></div><button className="text-mall underline" onClick={() => setStep(2)}>変更</button></div>
                <div className="py-3"><dt className="mb-1 font-bold">商品</dt>
                  <dd><ul className="space-y-1">{lines.map((l) => <li key={l.productId} className="flex justify-between gap-3"><span className="line-clamp-1">{l.emoji} {l.name} × {l.qty}</span><span>{yen(l.unitYen * l.qty)}</span></li>)}</ul></dd>
                </div>
              </dl>
            </>
          )}

          <div className="flex justify-between pt-2">
            <button className="rounded-full border border-gray-300 px-5 py-2 text-sm font-bold disabled:opacity-30" disabled={step === 0} onClick={() => setStep(step - 1)}>戻る</button>
            {step < 3 ? (
              <button className="rounded-full bg-gold px-6 py-2 text-sm font-bold text-mall-dark disabled:opacity-40" disabled={step === 0 && !addressOk} onClick={() => setStep(step + 1)}>次へ</button>
            ) : (
              <button className="rounded-full bg-mall px-6 py-2 text-sm font-bold text-white hover:brightness-110" onClick={confirm}>注文を確定する</button>
            )}
          </div>
        </section>

        <aside className="h-fit space-y-2 rounded-lg bg-white p-4 text-sm md:sticky md:top-4" aria-label="ご注文金額">
          <h3 className="font-black">ご注文金額</h3>
          <div className="flex justify-between"><span>商品の小計</span><span>{yen(t.subtotal)}</span></div>
          <div className="flex justify-between"><span>送料</span><span>{t.shipping === 0 ? '無料' : yen(t.shipping)}</span></div>
          <div className="flex justify-between border-t pt-2 text-lg font-black"><span>ご請求額</span><span data-testid="total">{yen(t.total)}</span></div>
          <p className="text-xs text-gray-500">（うち消費税 {yen(t.tax)}）／ 獲得ポイント {t.points}pt</p>
          <p className="text-xs text-gray-500">※ 架空のショップのため、実際の請求は発生しません。</p>
        </aside>
      </div>
    </div>
  )
}
