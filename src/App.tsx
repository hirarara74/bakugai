import { Route, Routes, useLocation } from 'react-router-dom'
import FictionBanner from './components/FictionBanner'
import Header from './components/Header'
import ShopHome from './pages/shop/Home'
import FoodHome from './pages/food/Home'

export default function App() {
  const food = useLocation().pathname.startsWith('/food')
  return (
    <>
      <FictionBanner />
      <Header food={food} />
      <main className="mx-auto max-w-[1280px]">
        <Routes>
          <Route path="/" element={<ShopHome />} />
          <Route path="/food" element={<FoodHome />} />
          <Route path="*" element={<p className="p-6">ページが見つかりません</p>} />
        </Routes>
      </main>
    </>
  )
}
