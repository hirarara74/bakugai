import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PRODUCTS, getCategory, getProduct, siblingsOf, type Product, type Tier } from '../../data/products'
import { reviewsFor, starShares } from '../../data/reviews'
import { Price, ProductCard, ProductImage, Stars } from '../../components/ProductParts'
import { useNow } from '../../hooks/useNow'
import { deliveryInfo } from '../../lib/date'
import { yen } from '../../lib/money'
import { useShop } from '../../store/useShop'

const TIER_LABEL: Record<Tier, string> = { P: 'プレミアム', S: 'スタンダード', B: 'お手頃' }
const TIER_STYLE: Record<Tier, string> = { P: 'bg-gold/30 text-mall-dark', S: 'bg-mall/10 text-mall', B: 'bg-green-100 text-green-800' }

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

/** 同じ品目を売る、ほかのメーカーの商品を並べて比べる */
function OtherMakers({ p }: { p: Product }) {
  const rows = [p, ...siblingsOf(p)].sort((a, b) => a.priceYen - b.priceYen)
  return (
    <section aria-labelledby="others" className="rounded-lg bg-white p-4">
      <h2 id="others" className="mb-1 text-lg font-black">ほかのメーカーの{p.item}</h2>
      <p className="mb-3 text-xs text-gray-600">同じ「{p.item}」を {rows.length} 社が販売しています（価格の安い順）。</p>
      <ul className="divide-y">
        {rows.map((x) => {
          const here = x.id === p.id
          return (
            <li key={x.id} className={`flex items-center gap-3 py-2 ${here ? 'bg-gold/10' : ''}`}>
              <ProductImage p={x} className="size-14 shrink-0 rounded-md [&>span]:!text-3xl" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex flex-wrap items-center gap-1.5">
                  <b>{x.brand}</b>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TIER_STYLE[x.tier]}`}>{TIER_LABEL[x.tier]}</span>
                  {here && <span className="rounded bg-mall px-1.5 py-0.5 text-[10px] font-bold text-white">表示中</span>}
                </p>
                {here ? <p className="line-clamp-1 text-gray-600">{x.name}</p> : <Link to={`/product/${x.id}`} className="line-clamp-1 text-mall underline">{x.name}</Link>}
                <p className="flex items-center gap-1 text-xs text-gray-600"><Stars rating={x.rating} className="text-sm" />{x.rating}（{x.reviewCount.toLocaleString()}件）</p>
              </div>
              <p className="font-black">{yen(x.priceYen)}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Together({ p }: { p: Product }) {
  const add = useShop((s) => s.add)
  const [done, setDone] = useState(false)
  // 同じカテゴリの別の品目を2点（同じ品目のほかメーカーは「ほかのメーカー」に出すので除く）
  const pool = PRODUCTS.filter((x) => x.category === p.category && x.item !== p.item)
  const mates = pool.slice((p.id * 7) % (pool.length - 1), (p.id * 7) % (pool.length - 1) + 2)
  const all = [p, ...mates]
  return (
    <section aria-labelledby="together" className="rounded-lg bg-white p-4">
      <h2 id="together" className="mb-3 text-lg font-black">よく一緒に購入されている商品</h2>
      <div className="grid grid-cols-3 gap-2">{all.map((x) => <ProductCard key={x.id} p={x} />)}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-bold">合計 {yen(all.reduce((s, x) => s + x.priceYen, 0))}</span>
        <button className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-mall-dark" onClick={() => { all.forEach((x) => add(x.id)); setDone(true) }}>
          {all.length}点まとめてカートへ
        </button>
        {done && <span role="status" className="text-sm font-bold text-green-700">✓ 追加しました</span>}
      </div>
    </section>
  )
}

const FILTERS: [string, string, (s: number) => boolean][] = [
  ['all', 'すべて', () => true], ['5', '★5', (s) => s === 5], ['4', '★4', (s) => s === 4], ['low', '★3以下', (s) => s <= 3],
]

function Reviews({ p }: { p: Product }) {
  const [filter, setFilter] = useState('all')
  const [shown, setShown] = useState(8)
  const shares = starShares(p.rating)
  const all = reviewsFor(p)
  const list = all.filter((r) => FILTERS.find((f) => f[0] === filter)![2](r.stars))

  return (
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
      <div>
        <div role="group" aria-label="星で絞り込む" className="mb-3 flex flex-wrap gap-2">
          {FILTERS.map(([id, label]) => (
            <button key={id} aria-pressed={filter === id} className={`rounded-full border px-3 py-1 text-sm font-bold ${filter === id ? 'border-mall bg-mall text-white' : 'bg-white'}`} onClick={() => { setFilter(id); setShown(8) }}>{label}</button>
          ))}
        </div>
        {list.length === 0 && <p className="text-sm text-gray-600">該当するレビューはありません。</p>}
        <ul className="space-y-4">
          {list.slice(0, shown).map((r, i) => (
            <li key={i} className="border-b pb-3 last:border-0">
              <p className="text-xs text-gray-600">{r.name}さん ・ {r.daysAgo}日前{r.verified && <span className="ml-2 font-bold text-orange-700">確認済みの購入</span>}</p>
              <p className="flex items-center gap-2"><Stars rating={r.stars} className="text-sm" /><b className="text-sm">{r.title}</b></p>
              <p className="text-xs text-gray-500">カラー: {p.color}</p>
              <p className="text-sm">{r.body}</p>
              {r.helpful > 0 && <p className="mt-1 text-xs text-gray-500">{r.helpful}人が参考になったと考えています</p>}
            </li>
          ))}
        </ul>
        {shown < list.length && (
          <button className="mt-3 rounded-full border border-gray-300 px-5 py-2 text-sm font-bold" onClick={() => setShown(shown + 8)}>もっとレビューを見る（残り{list.length - shown}件）</button>
        )}
      </div>
    </section>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const p = getProduct(Number(id))
  if (!p) return <p className="p-6">商品が見つかりませんでした。<Link to="/" className="underline">トップへ</Link></p>

  const cat = getCategory(p.category)

  return (
    <div className="space-y-4 p-3 pb-24 sm:p-4 md:pb-4">
      <p className="text-xs text-gray-600">
        <Link to="/" className="underline">トップ</Link> › <Link to={`/search?cat=${p.category}`} className="underline">{cat?.name}</Link> › <Link to={`/search?q=${encodeURIComponent(p.item)}`} className="underline">{p.item}</Link>
      </p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_300px]">
        <ProductImage p={p} className="aspect-square rounded-lg [&>span]:!text-[9rem]" />
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <Link to={`/search?brand=${encodeURIComponent(p.brand)}`} className="text-mall underline">ブランド: {p.brand}</Link>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${TIER_STYLE[p.tier]}`}>{TIER_LABEL[p.tier]}</span>
          </p>
          <h1 className="text-xl font-black leading-snug">{p.name}</h1>
          <p className="flex items-center gap-2 text-sm"><b>{p.rating}</b><Stars rating={p.rating} className="text-lg" /><span className="text-gray-600">{p.reviewCount.toLocaleString()}件の評価</span></p>
          <hr />
          <Price p={p} big />
          <ul className="list-disc space-y-1 pl-5 text-sm">{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
        <BuyBox p={p} />
      </div>

      <OtherMakers p={p} />

      <section aria-labelledby="desc" className="space-y-2 rounded-lg bg-white p-4">
        <h2 id="desc" className="text-lg font-black">商品説明</h2>
        {p.description.map((t, i) => <p key={i} className="text-sm leading-relaxed">{t}</p>)}
      </section>

      <Together p={p} />

      <section aria-labelledby="spec" className="rounded-lg bg-white p-4">
        <h2 id="spec" className="mb-2 text-lg font-black">商品の仕様</h2>
        <table className="w-full text-sm">
          <tbody>{p.specs.map(([k, v]) => (
            <tr key={k} className="border-t"><th scope="row" className="w-1/3 bg-gray-50 p-2 text-left font-bold">{k}</th><td className="p-2">{v}</td></tr>
          ))}</tbody>
        </table>
      </section>

      <Reviews key={p.id} p={p} />

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
