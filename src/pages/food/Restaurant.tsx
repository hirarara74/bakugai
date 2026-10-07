import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ItemSheet from '../../components/ItemSheet'
import { getRestaurant, menuOf, type MenuItem } from '../../data/food'
import { yen } from '../../lib/money'
import { foodCount, useFood } from '../../store/useFood'

export default function Restaurant() {
  const { id } = useParams()
  const r = getRestaurant(Number(id))
  const [item, setItem] = useState<MenuItem | null>(null)
  const count = useFood((s) => (s.restaurantId === r?.id ? foodCount(s.lines) : 0))
  if (!r) return <p className="p-6">お店が見つかりませんでした。<Link to="/food" className="font-bold text-eats-dark underline">店一覧へ</Link></p>

  const menu = menuOf(r.id)
  const cats = ['人気', ...new Set(menu.map((m) => m.cat))]
  const itemsOf = (c: string) => (c === '人気' ? menu.filter((m) => m.popular) : menu.filter((m) => m.cat === c))

  return (
    <div className="pb-24">
      <div className="flex items-center gap-4 p-4" style={{ background: `linear-gradient(135deg, hsl(${r.hue} 80% 92%), hsl(${r.hue} 70% 80%))` }}>
        <span className="text-6xl" aria-hidden>{r.emoji}</span>
        <div>
          <h2 className="text-xl font-black">{r.name}</h2>
          <p className="text-sm">{r.genre} ・ ★{r.rating} ・ {r.etaMin[0]}〜{r.etaMin[1]}分 ・ 配達料 {r.feeYen === 0 ? '無料' : yen(r.feeYen)}</p>
        </div>
      </div>

      <nav aria-label="メニューのカテゴリ" className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b bg-white px-3 py-2">
        {cats.map((c) => (
          <button key={c} className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold" onClick={() => document.getElementById(`cat-${c}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{c}</button>
        ))}
      </nav>

      <div className="space-y-6 p-3 sm:p-4">
        {cats.map((c) => (
          <section key={c} id={`cat-${c}`} aria-labelledby={`h-${c}`} className="scroll-mt-14">
            <h3 id={`h-${c}`} className="mb-2 text-lg font-black">{c === '人気' ? '🔥 人気メニュー' : c}</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {itemsOf(c).map((m) => (
                <li key={m.id}>
                  <button className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left shadow-sm hover:shadow-md" onClick={() => setItem(m)}>
                    <span className="text-4xl" aria-hidden>{m.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{m.name}</span>
                      <span className="block text-sm text-gray-600">{yen(m.priceYen)}{m.groups.length > 0 && '〜'}</span>
                    </span>
                    <span className="rounded-full bg-eats px-3 py-1 text-sm font-bold text-white" aria-hidden>＋</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {count > 0 && (
        <Link to="/food/checkout" className="fixed inset-x-3 bottom-3 z-10 mx-auto flex max-w-xl items-center justify-between rounded-full bg-eats px-5 py-3 font-bold text-white shadow-lg">
          <span>🛒 カートを見る</span><span>{count}点</span>
        </Link>
      )}
      {item && <ItemSheet item={item} onClose={() => setItem(null)} />}
    </div>
  )
}
