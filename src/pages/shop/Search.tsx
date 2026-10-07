import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, getCategory, makersInCategory } from '../../data/products'
import { ProductGrid } from '../../components/ProductParts'
import { PRICE_BANDS, SORTS, searchProducts } from '../../lib/search'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const get = (k: string) => params.get(k) ?? ''
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }
  const items = searchProducts({
    q: get('q'), cat: get('cat') || undefined, brand: get('brand') || undefined, band: get('band'), sort: get('sort') || undefined,
    minRating: Number(get('rating')) || 0, express: get('express') === '1',
  })
  const makers = makersInCategory(get('cat') || undefined)
  const title = get('brand') && !get('q') ? `${get('brand')} の商品` : get('q') ? `「${get('q')}」の検索結果` : getCategory(get('cat'))?.name ?? 'すべての商品'
  const field = 'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm'

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 md:flex-row">
      <aside className="md:w-56 md:shrink-0">
        <details open className="rounded-lg bg-white p-3 shadow-sm">
          <summary className="cursor-pointer text-sm font-black">絞り込み</summary>
          <div className="mt-3 space-y-3">
            <label className="block text-xs font-bold">カテゴリ
              <select className={field} value={get('cat')} onChange={(e) => set('cat', e.target.value)}>
                <option value="">すべて</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold">メーカー
              <select className={field} value={get('brand')} onChange={(e) => set('brand', e.target.value)}>
                <option value="">すべて</option>
                {makers.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold">価格
              <select className={field} value={get('band')} onChange={(e) => set('band', e.target.value)}>
                {PRICE_BANDS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={get('rating') === '4'} onChange={(e) => set('rating', e.target.checked ? '4' : '')} />
              ★4以上
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={get('express') === '1'} onChange={(e) => set('express', e.target.checked ? '1' : '')} />
              お急ぎ便対象
            </label>
          </div>
        </details>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black">{title} <span className="text-sm font-normal text-gray-500">{items.length}件</span></h2>
          <label className="flex items-center gap-2 text-sm">並べ替え
            <select className="rounded-md border border-gray-300 bg-white px-2 py-1.5" value={get('sort') || 'recommended'} onChange={(e) => set('sort', e.target.value)}>
              {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </label>
        </div>
        {items.length ? <ProductGrid items={items} /> : <p className="rounded-lg bg-white p-6 text-center text-gray-600">条件に合う商品が見つかりませんでした。</p>}
      </section>
    </div>
  )
}
