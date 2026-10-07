import { useState } from 'react'
import { Link } from 'react-router-dom'
import FoodPhoto from '../../components/FoodPhoto'
import { GENRES, RESTAURANTS } from '../../data/food'

export default function FoodHome() {
  const [genre, setGenre] = useState('')
  const list = RESTAURANTS.filter((r) => !genre || r.genre === genre)
  const chip = (on: boolean) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-bold ${on ? 'border-eats bg-eats text-white' : 'bg-white'}`

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <section className="rounded-xl bg-gradient-to-r from-eats to-[#8fd17a] p-6 text-white sm:p-8">
        <h2 className="text-2xl font-black sm:text-3xl">おなかすいた、を爆買い。</h2>
        <p className="mt-1 text-sm text-white/90">12店舗・96品。配達料も注文もすべて架空です。</p>
      </section>

      <div role="group" aria-label="ジャンル" className="flex gap-2 overflow-x-auto pb-1">
        <button className={chip(genre === '')} onClick={() => setGenre('')}>すべて</button>
        {GENRES.map((x) => <button key={x} className={chip(genre === x)} onClick={() => setGenre(x)}>{x}</button>)}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <li key={r.id}>
            <Link to={`/food/r/${r.id}`} className="block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
              <FoodPhoto kind="r" id={r.id} emoji={r.emoji} hue={r.hue} className="h-36 w-full text-4xl" />
              <div className="space-y-1 p-3">
                <h3 className="font-black">{r.name}</h3>
                <p className="text-sm text-gray-600">{r.genre} ・ ★{r.rating}（{r.reviews.toLocaleString()}）</p>
                <p className="text-sm">
                  <span className="font-bold">{r.etaMin[0]}〜{r.etaMin[1]}分</span>
                  <span className="mx-1 text-gray-400">・</span>
                  配達料 {r.feeYen === 0 ? <b className="text-eats-dark">無料</b> : `¥${r.feeYen}`}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
