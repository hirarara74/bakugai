import { getProduct, type Product } from '../data/products'
import type { OrderLine } from '../store/useOrders'

export type CartItem = { product: Product; qty: number }

/** カートの中身を商品情報つきに（存在しない商品IDは捨てる） */
export function cartItems(cart: { productId: number; qty: number }[]): CartItem[] {
  return cart.flatMap((l) => {
    const product = getProduct(l.productId)
    return product ? [{ product, qty: l.qty }] : []
  })
}

/** 注文後に商品情報が変わっても履歴が崩れないよう、名前と単価を写し取る */
export const toLine = ({ product: p, qty }: CartItem): OrderLine => ({
  productId: p.id, name: p.name, emoji: p.emoji, unitYen: p.priceYen, qty,
})
