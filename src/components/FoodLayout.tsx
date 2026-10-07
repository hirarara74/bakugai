import { Link, Outlet } from 'react-router-dom'
import { foodCount, useFood } from '../store/useFood'
import { useProfile } from '../store/useProfile'

export default function FoodLayout() {
  const count = useFood((s) => foodCount(s.lines))
  const { address } = useProfile()
  return (
    <>
      <div className="bg-eats text-white">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-3 py-2 text-sm sm:px-4">
          <Link to="/food" className="font-bold">🏠 ホーム</Link>
          <span className="min-w-0 flex-1 truncate text-white/90" title="お届け先">📍 {address.address}</span>
          <Link to="/food/orders" className="whitespace-nowrap font-bold">注文履歴</Link>
          <Link to="/food/checkout" className="whitespace-nowrap font-bold" aria-label={`カート ${count}点`}>
            🛒 カート{count > 0 && <span className="ml-1 rounded-full bg-white px-1.5 text-xs text-eats-dark">{count}</span>}
          </Link>
        </div>
      </div>
      <Outlet />
    </>
  )
}
