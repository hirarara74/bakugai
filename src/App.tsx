import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import FictionBanner from './components/FictionBanner'
import Header from './components/Header'
import ShopLayout from './components/ShopLayout'
import ShopHome from './pages/shop/Home'
import Search from './pages/shop/Search'
import ProductPage from './pages/shop/Product'
import FoodHome from './pages/food/Home'

export default function App() {
  const { pathname } = useLocation()
  const food = pathname.startsWith('/food')
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <>
      <FictionBanner />
      <Header food={food} />
      <main className="mx-auto max-w-[1280px]">
        <Routes>
          <Route element={<ShopLayout />}>
            <Route index element={<ShopHome />} />
            <Route path="search" element={<Search />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="cart" element={<p className="p-6">カート（フェーズ3で作ります）</p>} />
          </Route>
          <Route path="food" element={<FoodHome />} />
          <Route path="*" element={<p className="p-6">ページが見つかりません</p>} />
        </Routes>
      </main>
    </>
  )
}
