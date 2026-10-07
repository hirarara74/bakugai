import { useEffect, useRef, useState } from 'react'
import type { MenuItem } from '../data/food'
import { defaultOptionIds, selectionValid, unitPrice } from '../lib/foodMoney'
import { yen } from '../lib/money'
import { useFood } from '../store/useFood'

/** メニューの詳細シート。スマホでは下から出る。<dialog> の標準機能で開閉する（ESCキー・背景クリックで閉じる） */
export default function ItemSheet({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [picked, setPicked] = useState<string[]>(() => defaultOptionIds(item))
  const [qty, setQty] = useState(1)
  const [ask, setAsk] = useState(false)
  const { add, conflicts } = useFood()

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  const toggle = (gid: string, cid: string) => {
    const g = item.groups.find((x) => x.id === gid)!
    const ids = g.choices.map((c) => c.id)
    setPicked((p) => {
      if (g.max === 1 && g.required) return [...p.filter((x) => !ids.includes(x)), cid] // 必須の単一選択は入れ替え（ラジオ）
      if (p.includes(cid)) return p.filter((x) => x !== cid)
      return p.filter((x) => ids.includes(x)).length >= g.max ? p : [...p, cid]
    })
  }

  const valid = selectionValid(item, picked)
  const total = unitPrice(item, picked) * qty
  const commit = (replace: boolean) => {
    add(item.restaurantId, item.id, picked, qty, replace)
    onClose()
  }

  return (
    <dialog
      ref={ref}
      aria-label={item.name}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-0 mt-auto max-h-[92vh] w-full max-w-full overflow-y-auto rounded-t-2xl p-0 backdrop:bg-black/50 sm:m-auto sm:max-w-md sm:rounded-2xl"
    >
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span className="text-5xl">{item.emoji}</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black">{item.name}</h2>
            <p className="text-sm text-gray-600">{item.desc}</p>
            <p className="font-bold">{yen(item.priceYen)}</p>
          </div>
          <button className="rounded-full px-2 text-xl" aria-label="閉じる" onClick={() => ref.current?.close()}>✕</button>
        </div>

        {item.groups.map((g) => (
          <fieldset key={g.id} className="space-y-1">
            <legend className="mb-1 flex w-full items-center justify-between font-bold">
              {g.name}
              <span className={`rounded px-1.5 py-0.5 text-[11px] ${g.required ? 'bg-eats text-white' : 'bg-gray-200 text-gray-700'}`}>{g.required ? '必須' : g.max > 1 ? `任意・${g.max}つまで` : '任意'}</span>
            </legend>
            {g.choices.map((c) => {
              const on = picked.includes(c.id)
              const radio = g.max === 1 && g.required
              const full = !on && !radio && g.choices.filter((x) => picked.includes(x.id)).length >= g.max
              return (
                <label key={c.id} className={`flex items-center gap-3 rounded-md border p-2.5 text-sm ${on ? 'border-eats bg-eats/10' : ''} ${full ? 'opacity-40' : 'cursor-pointer'}`}>
                  <input
                    type={radio ? 'radio' : 'checkbox'} name={g.id} checked={on} disabled={full}
                    onChange={() => toggle(g.id, c.id)}
                  />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-gray-600">{c.priceYen ? `+${yen(c.priceYen)}` : ''}</span>
                </label>
              )
            })}
          </fieldset>
        ))}

        <div className="flex items-center justify-between">
          <span className="font-bold">数量</span>
          <div className="flex items-center gap-3">
            <button className="size-9 rounded-full border text-lg" aria-label="減らす" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button>
            <span className="w-6 text-center font-bold" aria-live="polite">{qty}</span>
            <button className="size-9 rounded-full border text-lg" aria-label="増やす" disabled={qty >= 99} onClick={() => setQty(qty + 1)}>＋</button>
          </div>
        </div>

        {ask ? (
          <div role="alertdialog" className="space-y-2 rounded-lg bg-gold/20 p-3 text-sm">
            <p className="font-bold">別のお店の商品がカートに入っています。カートを空にして、この商品を追加しますか？</p>
            <div className="flex gap-2">
              <button className="flex-1 rounded-full border py-2 font-bold" onClick={() => setAsk(false)}>キャンセル</button>
              <button className="flex-1 rounded-full bg-eats py-2 font-bold text-white" onClick={() => commit(true)}>空にして追加</button>
            </div>
          </div>
        ) : (
          <button
            className="w-full rounded-full bg-eats py-3 font-bold text-white disabled:opacity-40"
            disabled={!valid}
            onClick={() => (conflicts(item.restaurantId) ? setAsk(true) : commit(false))}
          >
            {valid ? `カートに追加 ${yen(total)}` : '必須の項目を選んでください'}
          </button>
        )}
      </div>
    </dialog>
  )
}
