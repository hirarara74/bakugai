import { Link, NavLink } from 'react-router-dom'
import { useCountUp } from '../hooks/useCountUp'
import { rankOf, totalOf } from '../lib/record'
import { useOrders } from '../store/useOrders'
import { yen } from '../lib/money'

const tab = (color: string) => ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${isActive ? `${color} text-white` : 'text-white/70 hover:text-white'}`

export default function Header({ food }: { food: boolean }) {
  const total = useOrders((s) => totalOf(s.orders))
  const shown = useCountUp(total)
  const rank = rankOf(total)
  return (
    <header className={`${food ? 'bg-eats-dark' : 'bg-mall'} text-white`}>
      <div className="mx-auto max-w-[1280px] flex items-center gap-2 px-3 sm:px-4 py-3">
        <h1 className="text-sm sm:text-lg font-black tracking-wide mr-auto whitespace-nowrap">
          <Link to={food ? '/food' : '/'} aria-label={`${food ? 'BAKUGAI EATS' : 'BAKUGAI MALL'} のホームへ`}>
            {food ? 'BAKUGAI EATS' : 'BAKUGAI MALL'}
          </Link>
        </h1>
        <nav aria-label="モード切替" className="flex gap-1">
          <NavLink to="/" end className={tab('bg-gold !text-mall-dark')}>通販</NavLink>
          <NavLink to="/food" className={tab('bg-eats')}>デリバリー</NavLink>
        </nav>
        <Link to="/stats" className="text-right leading-tight whitespace-nowrap" aria-label={`累計購入額 ${yen(total)}、ランク ${rank.name}。爆買い記録を見る`}>
          <div className="text-[10px] text-gold">👑 {rank.name}</div>
          <div className="font-black" data-testid="header-total">{yen(shown)}</div>
        </Link>
      </div>
    </header>
  )
}
