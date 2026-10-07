import { mulberry32, reviewAspects, type Product, type Tier } from './products'

export type Review = { name: string; stars: number; title: string; body: string; daysAgo: number; verified: boolean; helpful: number }

const NAMES = ['ゆうこ', 'たろう', 'mimi', 'K.S', 'ひまわり', 'ごんべえ', '買い物大好き', 'ゆっきー', 'あおぞら', 'ミドリ', 'ryo', 'はなこ', 'ねこまる', 'S.T', 'ぽんた', 'さくらもち', 'ハル', 'ken_1985', 'みかん', '通りすがり', 'こうちゃん', 'M.A', 'ひろみ', 'ダイ']

const TITLES: Record<number, string[]> = {
  5: ['期待以上でした', '買ってよかった', 'リピート確定', '大満足です', '迷ったらこれ'],
  4: ['おおむね満足', 'コスパ良好', '使いやすい', 'いい買い物でした'],
  3: ['普通です', '値段相応', 'もう少し…', '好みが分かれそう'],
  2: ['イメージと違った', '期待外れ', '少し残念'],
  1: ['おすすめできません', '残念…', '失敗しました'],
}
const OPEN: Record<number, string[]> = {
  5: ['届いてすぐ使いましたが、とても良いです。', '購入してよかったです。', '迷いましたが、思い切って買って正解でした。', '毎日使っています。'],
  4: ['しばらく使ってみての感想です。', '全体的に満足しています。', '使い始めて数週間たちました。'],
  3: ['使ってみての正直な感想です。', '良いところも気になるところもあります。'],
  2: ['期待していただけに残念でした。', '少し期待外れでした。'],
  1: ['おすすめできません。', '正直、がっかりしました。'],
}
const CLOSE: Record<number, string[]> = {
  5: ['また買いたいです。', 'おすすめです！', '家族にもすすめました。'],
  4: ['星4つにしました。', '満足しています。'],
  3: ['総合的には普通です。', '価格を考えると妥当かなと思います。'],
  2: ['改善を期待します。', '買い直すかは迷います。'],
  1: ['他の商品を選べばよかったです。', '返品を検討しています（※架空です）。'],
}
// メーカーの価格帯(P=プレミアム/S=標準/B=お手頃)ごとの、評価のされ方
const TIER_GOOD: Record<Tier, string[]> = {
  P: ['質感が高く、持っているだけで満足感があります', '細部の仕上げが丁寧で、価格以上の価値を感じます'],
  S: ['使いやすさと価格のバランスがちょうどいいです', '毎日使っても不満がなく、安心して使えます'],
  B: ['この価格でこれだけ使えるなら十分満足です', 'コスパが良く、気軽に買えたのが嬉しいです'],
}
const TIER_BAD: Record<Tier, string[]> = {
  P: ['価格が高めなので、人によっては割高に感じるかもしれません', '値段のわりに、期待したほどの差は感じませんでした'],
  S: ['悪くはないですが、突出した特徴は少ないです', '普通に使えますが、もう一歩ほしいところです'],
  B: ['価格相応で、長く使うと耐久性が気になりそうです', '安いぶん、作りの細かさは期待しない方がいいです'],
}

/** 星の分布: 「5との差」が平均になるポアソン分布で近似（5★→1★の割合を返す） */
export function starShares(r: number): number[] {
  const lam = Math.max(0.05, 5 - r)
  const w = [0, 1, 2, 3, 4].map((k) => (lam ** k * Math.exp(-lam)) / [1, 1, 2, 6, 24][k])
  const sum = w.reduce((a, b) => a + b, 0)
  return w.map((x) => x / sum)
}

/** 商品IDから毎回同じレビューを作る（保存しない）。商品の特長・カテゴリの観点・メーカーの価格帯を文に反映する */
export function reviewsFor(p: Product, n = 24): Review[] {
  const r = mulberry32(p.id * 104729 + 7)
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]
  const shares = starShares(p.rating)
  const aspects = reviewAspects(p.category)
  const feats = p.bullets.slice(0, 3)

  return Array.from({ length: n }, () => {
    let x = r()
    let stars = 1
    for (let k = 0; k < 5; k++) {
      x -= shares[k]
      if (x <= 0) { stars = 5 - k; break }
    }
    const [aGood, aBad] = pick(aspects)
    const [bGood, bBad] = pick(aspects)
    const f = pick(feats)
    const goodFeat = `「${f}」という点が決め手でしたが、実際そのとおりでした`
    const badFeat = `「${f}」とありますが、期待したほどではありませんでした`
    const tg = pick(TIER_GOOD[p.tier])
    const tb = pick(TIER_BAD[p.tier])
    const parts =
      stars === 5 ? [aGood, r() < 0.5 ? goodFeat : tg, bGood] :
      stars === 4 ? [aGood, tg, `ただ、${bBad}`] :
      stars === 3 ? [aGood, `一方で、${aBad}`, tb] :
      stars === 2 ? [aBad, badFeat, tb] :
      [aBad, bBad, badFeat]
    return {
      name: pick(NAMES),
      stars,
      title: pick(TITLES[stars]),
      body: [pick(OPEN[stars]), ...parts.map((s) => `${s}。`), pick(CLOSE[stars])].join(''),
      daysAgo: 1 + Math.floor(r() * 400),
      verified: r() < 0.85,
      helpful: stars >= 4 ? Math.floor(10 ** (r() * 1.8)) : Math.floor(10 ** (r() * 1.3)),
    }
  }).sort((a, b) => a.daysAgo - b.daysAgo)
}
