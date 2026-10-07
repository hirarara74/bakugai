import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { CATEGORIES, SUGGESTIONS } from '../data/products'
import { cartCount, useShop } from '../store/useShop'

export default function ShopLayout() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const count = useShop((s) => cartCount(s.cart))

  return (
    <>
      <div className="bg-mall-dark text-white">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-3 py-2 sm:px-4">
          <form
            role="search"
            className="flex flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              const q = new FormData(e.currentTarget).get('q')?.toString().trim() ?? ''
              nav(`/search?q=${encodeURIComponent(q)}`)
            }}
          >
            <input
              key={params.get('q') ?? ''}
              name="q"
              defaultValue={params.get('q') ?? ''}
              list="suggest"
              placeholder="商品を検索（例: イヤホン）"
              aria-label="商品を検索"
              className="min-w-0 flex-1 rounded-l-md bg-white px-3 py-2 text-sm text-black outline-none"
            />
            <button className="rounded-r-md bg-gold px-4 text-sm font-bold text-mall-dark" aria-label="検索する">検索</button>
            <datalist id="suggest">{SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
          </form>
          <Link to="/orders" className="hidden whitespace-nowrap rounded-md px-2 py-1 text-sm font-bold sm:block">注文履歴</Link>
          <Link to="/cart" className="relative whitespace-nowrap rounded-md px-2 py-1 text-sm font-bold" aria-label={`カート ${count}点`}>
            🛒 カート
            {count > 0 && <span className="ml-1 rounded-full bg-gold px-1.5 text-xs text-mall-dark">{count}</span>}
          </Link>
        </div>
        <nav aria-label="カテゴリ" className="mx-auto flex max-w-[1280px] gap-4 overflow-x-auto px-3 pb-2 text-xs sm:px-4">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/search?cat=${c.id}`} className="whitespace-nowrap text-white/80 hover:text-white">{c.name}</Link>
          ))}
          <Link to="/orders" className="whitespace-nowrap text-white/80 hover:text-white sm:hidden">注文履歴</Link>
        </nav>
      </div>
      <Outlet />
    </>
  )
}
