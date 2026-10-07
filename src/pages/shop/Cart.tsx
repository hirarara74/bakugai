import { Link } from 'react-router-dom'
import { ProductImage } from '../../components/ProductParts'
import { getProduct } from '../../data/products'
import { cartItems } from '../../lib/cart'
import { deliveryInfo } from '../../lib/date'
import { FREE_SHIPPING_YEN, totals, untilFreeShipping, yen } from '../../lib/money'
import { MAX_QTY, cartCount, useShop } from '../../store/useShop'

export default function Cart() {
  const { cart, later, setQty, remove, toLater, fromLater, multiply } = useShop()
  const items = cartItems(cart)
  const t = totals(items.map((i) => ({ unitYen: i.product.priceYen, qty: i.qty })), 'standard')
  const rest = untilFreeShipping(t.subtotal)
  const d = deliveryInfo(new Date(), false)

  return (
    <div className="grid gap-4 p-3 sm:p-4 md:grid-cols-[1fr_320px]">
      <section aria-labelledby="cart-h" className="rounded-lg bg-white p-4">
        <h2 id="cart-h" className="mb-3 text-xl font-black">ショッピングカート</h2>
        {items.length === 0 ? (
          <p className="py-8 text-center text-gray-600">カートは空です。<Link to="/" className="font-bold text-mall underline">商品を探しに行く</Link></p>
        ) : (
          <ul className="divide-y">
            {items.map(({ product: p, qty }) => (
              <li key={p.id} className="flex gap-3 py-4">
                <Link to={`/product/${p.id}`}><ProductImage p={p} className="size-24 shrink-0 rounded-md [&>span]:!text-5xl" /></Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <Link to={`/product/${p.id}`} className="line-clamp-2 font-bold">{p.name}</Link>
                  <p className="text-lg font-black">{yen(p.priceYen)}<span className="ml-1 text-[11px] font-normal text-gray-500">税込</span></p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <label>数量
                      <input
                        type="number" min={1} max={MAX_QTY} value={qty} aria-label={`${p.name}の数量`}
                        className="ml-2 w-16 rounded-md border border-gray-300 px-2 py-1"
                        onChange={(e) => setQty(p.id, Number(e.target.value))}
                      />
                    </label>
                    <button className="text-mall underline" onClick={() => remove(p.id)}>削除</button>
                    <button className="text-mall underline" onClick={() => toLater(p.id)}>あとで買う</button>
                  </div>
                </div>
                <p className="hidden font-black sm:block">{yen(p.priceYen * qty)}</p>
              </li>
            ))}
          </ul>
        )}

        {later.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="mb-2 font-black">あとで買う（{later.length}点）</h3>
            <ul className="space-y-2">
              {later.map((id) => getProduct(id)).flatMap((p) => (p ? [p] : [])).map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">{p.emoji}</span>
                  <Link to={`/product/${p.id}`} className="line-clamp-1 flex-1">{p.name}</Link>
                  <span className="font-bold">{yen(p.priceYen)}</span>
                  <button className="text-mall underline" onClick={() => fromLater(p.id)}>カートに戻す</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <aside className="h-fit space-y-3 rounded-lg bg-white p-4 md:sticky md:top-4">
        {items.length > 0 && (
          <>
            <div>
              <p className="text-sm font-bold">
                {rest === 0 ? '✓ 送料無料の対象です' : `あと ${yen(rest)} で送料無料`}
              </p>
              <div className="mt-1 h-2 overflow-hidden rounded bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={FREE_SHIPPING_YEN} aria-valuenow={Math.min(t.subtotal, FREE_SHIPPING_YEN)}>
                <div className="h-full bg-green-600" style={{ width: `${Math.min(100, (t.subtotal / FREE_SHIPPING_YEN) * 100)}%` }} />
              </div>
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt>小計（{cartCount(cart)}点）</dt><dd>{yen(t.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>送料（通常便）</dt><dd>{t.shipping === 0 ? '無料' : yen(t.shipping)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-lg font-black"><dt>合計（税込）</dt><dd>{yen(t.total)}</dd></div>
            </dl>
            <p className="text-xs text-gray-600">通常便なら <b>{d.label}</b> お届け</p>
            <button className="w-full rounded-full border-2 border-gold py-2 font-bold text-mall-dark hover:bg-gold/20" onClick={() => multiply(10)}>🔥 カートの中身を全部×10</button>
            <Link to="/checkout" className="block rounded-full bg-gold py-2.5 text-center font-bold text-mall-dark hover:brightness-95">レジに進む</Link>
          </>
        )}
        {items.length === 0 && <p className="text-sm text-gray-600">商品を追加すると、ここに合計が表示されます。</p>}
      </aside>
    </div>
  )
}
