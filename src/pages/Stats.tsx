import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNow } from '../hooks/useNow'
import { SPEEDS, type Speed } from '../lib/delivery'
import { yen } from '../lib/money'
import { badgesOf, categoryTotals, dailyTotals, rankOf, topItems, totalOf } from '../lib/record'
import { useOrders } from '../store/useOrders'
import { useProfile } from '../store/useProfile'

export default function Stats() {
  const orders = useOrders((s) => s.orders)
  const { speed, setSpeed } = useProfile()
  const now = useNow(60_000)
  const [ask, setAsk] = useState(false)

  const total = totalOf(orders)
  const rank = rankOf(total)
  const badges = badgesOf(orders)
  const cats = categoryTotals(orders)
  const catSum = cats.reduce((s, c) => s + c.yen, 0) || 1
  const days = dailyTotals(orders, now)
  const maxDay = Math.max(1, ...days.map((d) => d.yen))
  const top = topItems(orders)
  const card = 'rounded-lg bg-white p-4'

  const reset = () => {
    Object.keys(localStorage).filter((k) => k.startsWith('bakugai:')).forEach((k) => localStorage.removeItem(k))
    location.hash = '#/'
    location.reload()
  }

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <section className="rounded-xl bg-gradient-to-r from-mall to-[#3b4a9a] p-6 text-white" aria-label="爆買いランク">
        <p className="text-sm text-gold">あなたの爆買いランク</p>
        <p className="text-4xl font-black" data-testid="rank-name">👑 {rank.name}</p>
        <p className="mt-1 text-lg font-bold">累計 {yen(total)}（{orders.length}回の注文）</p>
        {rank.next ? (
          <>
            <div className="mt-3 h-3 overflow-hidden rounded bg-white/20" role="progressbar" aria-label={`${rank.next.name}までの進み具合`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(rank.progress * 100)}>
              <div className="h-full bg-gold" style={{ width: `${rank.progress * 100}%` }} />
            </div>
            <p className="mt-1 text-sm text-white/80">「{rank.next.name}」まであと {yen(rank.next.remaining)}</p>
          </>
        ) : <p className="mt-2 text-sm text-white/80">最高ランクです。もう買うものがありません（※あります）。</p>}
      </section>

      <section aria-labelledby="badges" className={card}>
        <h2 id="badges" className="mb-3 text-lg font-black">実績バッジ（{badges.filter((b) => b.earned).length}/{badges.length}）</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {badges.map((b) => (
            <li key={b.id} data-earned={b.earned} className={`rounded-lg border p-3 text-sm ${b.earned ? 'border-gold bg-gold/15' : 'opacity-50'}`}>
              <p className="text-2xl" aria-hidden>{b.earned ? b.emoji : '🔒'}</p>
              <p className="font-bold">{b.name}</p>
              <p className="text-xs text-gray-600">{b.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {orders.length === 0 ? (
        <p className={`${card} text-center text-gray-600`}>まだ注文がありません。<Link to="/" className="font-bold text-mall underline">買い物をはじめる</Link></p>
      ) : (
        <>
          <section aria-labelledby="cats" className={card}>
            <h2 id="cats" className="mb-3 text-lg font-black">カテゴリ別の購入額</h2>
            <ul className="space-y-2">
              {cats.map((c) => (
                <li key={c.id} className="text-sm">
                  <div className="flex justify-between"><span>{c.emoji} {c.name}</span><span>{yen(c.yen)}（{Math.round((c.yen / catSum) * 100)}%）</span></div>
                  <div className="h-2.5 overflow-hidden rounded bg-gray-200"><div className="h-full bg-mall" style={{ width: `${(c.yen / catSum) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="days" className={card}>
            <h2 id="days" className="mb-3 text-lg font-black">この7日間の購入額</h2>
            <ul className="flex h-40 items-end gap-2">
              {days.map((d) => (
                <li key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1 text-[10px]">
                  <span className="text-gray-600">{d.yen ? yen(d.yen) : ''}</span>
                  <span className="w-full rounded-t bg-gold" style={{ height: `${(d.yen / maxDay) * 100}%`, minHeight: d.yen ? 4 : 0 }} />
                  <span>{d.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="top" className={card}>
            <h2 id="top" className="mb-3 text-lg font-black">よく買ったもの TOP5</h2>
            <ol className="space-y-1 text-sm">
              {top.map((t, i) => <li key={t.name} className="flex gap-2"><b>{i + 1}.</b><span className="flex-1 line-clamp-1">{t.emoji} {t.name}</span><b>{t.qty}点</b></li>)}
            </ol>
          </section>
        </>
      )}

      <section aria-labelledby="settings" className={`${card} space-y-4`}>
        <h2 id="settings" className="text-lg font-black">設定</h2>
        <label className="block text-sm font-bold">配送の進み方（次の注文から）
          <select className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2" value={speed} onChange={(e) => setSpeed(e.target.value as Speed)}>
            {SPEEDS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </label>
        {ask ? (
          <div role="alertdialog" className="space-y-2 rounded-lg bg-red-50 p-3 text-sm">
            <p className="font-bold">注文履歴・カート・累計額・実績をすべて消します。元に戻せません。よろしいですか？</p>
            <div className="flex gap-2">
              <button className="flex-1 rounded-full border bg-white py-2 font-bold" onClick={() => setAsk(false)}>キャンセル</button>
              <button className="flex-1 rounded-full bg-red-600 py-2 font-bold text-white" onClick={reset}>すべて消す</button>
            </div>
          </div>
        ) : (
          <button className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-700" onClick={() => setAsk(true)}>データをリセット</button>
        )}
        <p className="text-xs text-gray-500">データはこの端末のブラウザにだけ保存されています。</p>
      </section>
    </div>
  )
}
