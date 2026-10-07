import { mulberry32, type Product } from './products'

export type Review = { name: string; stars: number; title: string; body: string; daysAgo: number }

const NAMES = ['ゆうこ', 'たろう', 'mimi', 'K.S', 'ひまわり', 'ごんべえ', '買い物大好き', 'ゆっきー', 'あおぞら', 'ミドリ', 'ryo', 'はなこ']
const POS = [
  ['期待以上でした', '{item}を探していて購入。思っていたよりしっかりしていて、毎日使っています。'],
  ['リピート確定', '家族にも好評でもう一つ買いました。{brand}の{item}はまた選びたいです。'],
  ['迷ったらこれ', '価格のわりに満足度が高いです。届くのも早くて助かりました。'],
]
const MID = [
  ['値段相応です', '悪くはないですが、{item}としては普通かな。使い方次第だと思います。'],
  ['もう少し欲しい', '全体的には満足。説明書がもう少し丁寧だとうれしいです。'],
]
const NEG = [['イメージと違った', '写真より小ぶりに感じました。{item}はサイズを確認してから買うのがおすすめです。']]

/** 星の分布: 「5との差」が平均になるポアソン分布で近似（5★→1★の割合を返す） */
export function starShares(r: number): number[] {
  const lam = Math.max(0.05, 5 - r)
  const w = [0, 1, 2, 3, 4].map((k) => (lam ** k * Math.exp(-lam)) / [1, 1, 2, 6, 24][k])
  const sum = w.reduce((a, b) => a + b, 0)
  return w.map((x) => x / sum)
}

/** 商品IDから毎回同じレビューを作る（保存しない） */
export function reviewsFor(p: Product, n = 6): Review[] {
  const r = mulberry32(p.id * 104729 + 7)
  const shares = starShares(p.rating)
  return Array.from({ length: n }, () => {
    let x = r()
    let stars = 1
    for (let k = 0; k < 5; k++) {
      x -= shares[k]
      if (x <= 0) { stars = 5 - k; break }
    }
    const pool = stars >= 4 ? POS : stars === 3 ? MID : NEG
    const [title, body] = pool[Math.floor(r() * pool.length)]
    return {
      name: NAMES[Math.floor(r() * NAMES.length)],
      stars,
      title,
      body: body.replace('{item}', p.item).replace('{brand}', p.brand),
      daysAgo: 1 + Math.floor(r() * 120),
    }
  }).sort((a, b) => a.daysAgo - b.daysAgo)
}
