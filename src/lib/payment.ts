// 支払い方法はすべて架空。カード番号などの入力欄は作らない（実在の情報を打ち込ませないため）
export type Payment = { id: string; name: string; note: string; fee: number }

export const SHOP_PAYMENTS: Payment[] = [
  { id: 'money', name: '爆買いマネー', note: '残高 ∞。いつでも使い放題の架空の電子マネーです。', fee: 0 },
  { id: 'card', name: 'バクガイカード（架空のクレジットカード）', note: '翌月一括払いの設定です。カード番号の入力は不要で、請求も発生しません。', fee: 0 },
  { id: 'konbini', name: 'コンビニ払い（架空）', note: '注文後に支払番号が発行される、という設定です。実際の支払いは不要です。', fee: 0 },
  { id: 'cod', name: '代金引換（架空）', note: '商品のお届け時に現金でお支払い、という設定です。手数料がかかります。', fee: 330 },
]

export const FOOD_PAYMENTS: Payment[] = [
  { id: 'money', name: '爆買いマネー', note: '残高 ∞。いつでも使い放題の架空の電子マネーです。', fee: 0 },
  { id: 'card', name: 'バクガイカード（架空のクレジットカード）', note: 'アプリに登録済み、という設定です。番号の入力は不要です。', fee: 0 },
  { id: 'cash', name: '現金（受け取り時に支払い・架空）', note: '配達員にお渡しする、という設定です。実際の支払いは不要です。', fee: 0 },
]

export const paymentName = (id: string | undefined) =>
  [...SHOP_PAYMENTS, ...FOOD_PAYMENTS].find((p) => p.id === id)?.name ?? '爆買いマネー'
