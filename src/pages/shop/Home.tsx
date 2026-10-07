import { Link } from 'react-router-dom'
import { CATEGORIES, PRODUCTS, discountPct, score } from '../../data/products'
import { ProductGrid } from '../../components/ProductParts'
import { useNow } from '../../hooks/useNow'

const pad = (n: number) => String(n).padStart(2, '0')
const SALE = [...PRODUCTS].filter((p) => p.listPriceYen).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 10)
const TOP = [...PRODUCTS].sort((a, b) => score(b) - score(a)).slice(0, 15)

export default function ShopHome() {
  const now = useNow()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))

  return (
    <div className="space-y-8 p-3 sm:p-4">
      <section className="rounded-xl bg-gradient-to-r from-mall to-[#3b4a9a] p-6 text-white sm:p-10">
        <p className="text-sm font-bold text-gold">本日限り タイムセール開催中</p>
        <h2 className="mt-1 text-2xl font-black sm:text-4xl">爆買い、はじめよう。</h2>
        <p className="mt-2 text-sm text-white/80">200点の架空の商品を、お財布を気にせず好きなだけ。</p>
        <p className="mt-4 inline-block rounded-md bg-black/30 px-3 py-1.5 font-mono text-lg font-bold" aria-label="セール終了までの時間">
          終了まで {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
        </p>
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats" className="mb-2 text-lg font-black">カテゴリから探す</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/search?cat=${c.id}`} className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-bold shadow-sm hover:shadow-md">
              <span className="text-2xl">{c.emoji}</span>{c.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="sale">
        <h2 id="sale" className="mb-2 text-lg font-black">🔥 タイムセール</h2>
        <ProductGrid items={SALE} />
      </section>

      <section aria-labelledby="top">
        <h2 id="top" className="mb-2 text-lg font-black">みんなが選んだ高評価</h2>
        <ProductGrid items={TOP} />
      </section>
    </div>
  )
}
