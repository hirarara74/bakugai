import { useState } from 'react'
import { Link } from 'react-router-dom'
import { discountPct, getCategory, type Product } from '../data/products'
import { deliveryInfo } from '../lib/date'
import { yen } from '../lib/money'

/** 商品写真（AIで生成した画像）。画像が無い・読めない時は、カテゴリ色のグラデーション + 絵文字を出す */
export function ProductImage({ p, className = '' }: { p: Product; className?: string }) {
  const hue = getCategory(p.category)?.hue ?? 220
  const [failed, setFailed] = useState(false)
  return (
    <div
      role="img"
      aria-label={p.name}
      className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 94%), hsl(${hue} 60% 82%))` }}
    >
      {failed ? (
        <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 6px 6px rgb(0 0 0 / .18))' }}>{p.emoji}</span>
      ) : (
        <img src={`${import.meta.env.BASE_URL}img/p/${p.id}.webp`} alt="" loading="lazy" className="size-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  )
}

export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span className={`relative inline-block leading-none ${className}`} role="img" aria-label={`5つ星のうち${rating}`}>
      <span className="text-gray-300">★★★★★</span>
      <span className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-gold" style={{ width: `${(rating / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  )
}

export function Price({ p, big = false }: { p: Product; big?: boolean }) {
  const off = discountPct(p)
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {off > 0 && <span className="text-sm font-bold text-red-600">-{off}%</span>}
      <span className={`font-black ${big ? 'text-3xl' : 'text-lg'}`}>{yen(p.priceYen)}</span>
      <span className="text-[11px] text-gray-500">税込</span>
      {p.listPriceYen && <span className="text-xs text-gray-500 line-through">{yen(p.listPriceYen)}</span>}
    </div>
  )
}

export function ProductCard({ p }: { p: Product }) {
  const d = deliveryInfo(new Date(), p.express)
  return (
    <Link to={`/product/${p.id}`} className="flex flex-col rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <ProductImage p={p} className="aspect-square" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug">{p.name}</h3>
        <div className="flex items-center gap-1 text-xs">
          <Stars rating={p.rating} className="text-sm" />
          <span className="text-gray-500">{p.reviewCount.toLocaleString()}</span>
        </div>
        <Price p={p} />
        <div className="mt-auto pt-1 text-[11px] text-gray-600">
          {p.express && <span className="mr-1 rounded bg-mall px-1 py-0.5 font-bold text-white">お急ぎ便</span>}
          {d.label} お届け
        </div>
      </div>
    </Link>
  )
}

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  )
}
