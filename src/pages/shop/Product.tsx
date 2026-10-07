import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PRODUCTS, getCategory, getProduct, type Product } from '../../data/products'
import { reviewsFor, starShares } from '../../data/reviews'
import { Price, ProductCard, ProductImage, Stars } from '../../components/ProductParts'
import { useNow } from '../../hooks/useNow'
import { deliveryInfo } from '../../lib/date'
import { yen } from '../../lib/money'
import { useShop } from '../../store/useShop'

function BuyBox({ p }: { p: Product }) {
  const now = useNow(30000)
  const nav = useNavigate()
  const add = useShop((s) => s.add)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const d = deliveryInfo(now, p.express)
  const low = p.stock <= 5

  return (
    <div className="space-y-3 rounded-lg border border-gray-300 bg-white p-4">
      <Price p={p} big />
      <p className="text-xs text-gray-600">{Math.floor(p.priceYen * 0.01)}ポイント（1%）</p>
      <div className="text-sm">
        <p><b className="text-mall">{d.label}</b> お届け{p.express && <span className="ml-1 rounded bg-mall px-1 py-0.5 text-[11px] font-bold text-white">お急ぎ便</span>}</p>
        <p className="text-xs text-gray-600">あと {d.hours}時間{d.minutes}分 以内のご注文で</p>
      </div>
      <p className={low ? 'font-bold text-red-600' : 'font-bold text-green-700'}>
        {low ? `残り${p.stock}点 ご注文はお早めに` : '在庫あり'}
      </p>
      <label className="block text-sm">数量
        <select className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
          {Array.from({ length: Math.min(30, p.stock) }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <button
        className="w-full rounded-full bg-gold py-2.5 font-bold text-mall-dark hover:brightness-95"
        onClick={() => { add(p.id, qty); setAdded(true) }}
      >カートに入れる</button>
      <button
        className="w-full rounded-full bg-mall py-2.5 font-bold text-white hover:brightness-110"
        onClick={() => { add(p.id, qty); nav('/cart') }}
      >今すぐ買う</button>
      {added && (
        <p role="status" className="text-sm font-bold text-green-700">
          ✓ カートに追加しました。<Link to="/cart" className="underline">カートを見る</Link>
        </p>
      )}
      <p className="text-[11px] text-gray-500">※ 架空のショップです。請求も配送もありません。</p>
    </div>
  )
}

function Together({ p }: { p: Product }) {
  const add = useShop((s) => s.add)
  const [done, setDone] = useState(false)
  const mates = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(p.id % 5, (p.id % 5) + 2)
  const all = [p, ...mates]
  return (
    <section aria-labelledby="together" className="rounded-lg bg-white p-4">
      <h2 id="together" className="mb-3 text-lg font-black">よく一緒に購入されている商品</h2>
      <div className="grid grid-cols-3 gap-2">{all.map((x) => <ProductCard key={x.id} p={x} />)}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-bold">合計 {yen(all.reduce((s, x) => s + x.priceYen, 0))}</span>
        <button className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-mall-dark" onClick={() => { all.forEach((x) => add(x.id)); setDone(true) }}>
          3点まとめてカートへ
        </button>
        {done && <span role="status" className="text-sm font-bold text-green-700">✓ 追加しました</span>}
      </div>
    </section>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const p = getProduct(Number(id))
  if (!p) return <p className="p-6">商品が見つかりませんでした。<Link to="/" className="underline">トップへ</Link></p>

  const shares = starShares(p.rating)
  const reviews = reviewsFor(p)
  const cat = getCategory(p.category)

  return (
    <div className="space-y-4 p-3 pb-24 sm:p-4 md:pb-4">
      <p className="text-xs text-gray-600">
        <Link to="/" className="underline">トップ</Link> › <Link to={`/search?cat=${p.category}`} className="underline">{cat?.name}</Link>
      </p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_300px]">
        <ProductImage p={p} className="aspect-square rounded-lg [&>span]:!text-[9rem]" />
        <div className="space-y-3">
          <p className="text-sm text-mall">ブランド: {p.brand}</p>
          <h1 className="text-xl font-black leading-snug">{p.name}</h1>
          <p className="flex items-center gap-2 text-sm"><b>{p.rating}</b><Stars rating={p.rating} className="text-lg" /><span className="text-gray-600">{p.reviewCount.toLocaleString()}件の評価</span></p>
          <hr />
          <Price p={p} big />
          <ul className="list-disc space-y-1 pl-5 text-sm">{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
        <BuyBox p={p} />
      </div>

      <Together p={p} />

      <section aria-labelledby="spec" className="rounded-lg bg-white p-4">
        <h2 id="spec" className="mb-2 text-lg font-black">商品の仕様</h2>
        <table className="w-full text-sm">
          <tbody>{p.specs.map(([k, v]) => (
            <tr key={k} className="border-t"><th scope="row" className="w-1/3 bg-gray-50 p-2 text-left font-bold">{k}</th><td className="p-2">{v}</td></tr>
          ))}</tbody>
        </table>
      </section>

      <section aria-labelledby="reviews" className="grid gap-4 rounded-lg bg-white p-4 md:grid-cols-[280px_1fr]">
        <div>
          <h2 id="reviews" className="mb-2 text-lg font-black">カスタマーレビュー</h2>
          <p className="flex items-center gap-2"><Stars rating={p.rating} className="text-xl" /><b className="text-lg">星{p.rating}</b></p>
          <p className="mb-3 text-xs text-gray-600">{p.reviewCount.toLocaleString()}件の評価</p>
          {shares.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-8">星{5 - i}</span>
              <span className="h-3 flex-1 overflow-hidden rounded bg-gray-200"><span className="block h-full bg-gold" style={{ width: `${Math.round(s * 100)}%` }} /></span>
              <span className="w-10 text-right">{Math.round(s * 100)}%</span>
            </div>
          ))}
        </div>
        <ul className="space-y-4">
          {reviews.map((r, i) => (
            <li key={i}>
              <p className="text-xs text-gray-600">{r.name}さん ・ {r.daysAgo}日前</p>
              <p className="flex items-center gap-2"><Stars rating={r.stars} className="text-sm" /><b className="text-sm">{r.title}</b></p>
              <p className="text-sm">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* スマホは購入ボタンを画面下に固定 */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-white p-3 md:hidden">
        <span className="text-xl font-black">{yen(p.priceYen)}</span>
        <StickyAdd p={p} />
      </div>
    </div>
  )
}

function StickyAdd({ p }: { p: Product }) {
  const add = useShop((s) => s.add)
  const [added, setAdded] = useState(false)
  return (
    <button className="flex-1 rounded-full bg-gold py-2.5 font-bold text-mall-dark" onClick={() => { add(p.id); setAdded(true) }}>
      {added ? '✓ 追加しました' : 'カートに入れる'}
    </button>
  )
}
