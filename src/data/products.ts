export type Category = { id: string; name: string; emoji: string; hue: number }
export type Product = {
  id: number
  name: string
  item: string
  brand: string
  category: string
  priceYen: number
  listPriceYen?: number
  emoji: string
  rating: number
  reviewCount: number
  stock: number
  express: boolean
  bullets: string[]
  specs: [string, string][]
}

// [品名, 絵文字, 最低価格, 最高価格]
type Seed = [string, string, number, number]
const RAW: (Category & { items: Seed[] })[] = [
  { id: 'appliance', name: '家電', emoji: '🌀', hue: 230, items: [
    ['空気清浄機', '🌀', 9800, 49800], ['扇風機', '🌀', 2980, 14800], ['ドライヤー', '💨', 2480, 19800], ['電気毛布', '🛏️', 2980, 9800], ['ロボット掃除機', '🤖', 14800, 69800],
    ['ワイヤレスイヤホン', '🎧', 2980, 14800], ['Bluetoothスピーカー', '🔊', 2480, 19800], ['ヘッドホン', '🎧', 3980, 29800], ['サウンドバー', '📻', 6980, 39800], ['ポータブルラジオ', '📻', 1980, 6980] ] },
  { id: 'gadget', name: 'ガジェット', emoji: '⌚', hue: 190, items: [
    ['スマートウォッチ', '⌚', 2980, 29800], ['モバイルバッテリー', '🔋', 1480, 7980], ['USB充電器', '🔌', 1280, 5980], ['ワイヤレスマウス', '🖱️', 980, 8980], ['メカニカルキーボード', '⌨️', 3980, 24800],
    ['Webカメラ', '📷', 1980, 12800], ['ノートPCスタンド', '💻', 1280, 6980], ['ポータブルSSD', '💾', 4980, 19800], ['スマホスタンド', '📱', 780, 3980], ['LEDデスクライト', '💡', 1980, 9800] ] },
  { id: 'kitchen', name: 'キッチン', emoji: '🍳', hue: 30, items: [
    ['炊飯器', '🍚', 6980, 49800], ['フライパン', '🍳', 1480, 8980], ['包丁', '🔪', 1980, 19800], ['ホットプレート', '🥘', 3980, 14800], ['コーヒーメーカー', '☕', 3980, 24800],
    ['トースター', '🍞', 3480, 19800], ['保温ボトル', '🍶', 1480, 4980], ['圧力鍋', '🍲', 3980, 19800], ['ミキサー', '🥤', 2980, 12800], ['食器セット', '🍽️', 1980, 9800] ] },
  { id: 'food', name: '食品・飲料', emoji: '🥩', hue: 120, items: [
    ['高級和牛', '🥩', 2980, 19800], ['完熟みかん', '🍊', 1280, 4980], ['有機コーヒー豆', '☕', 980, 3980], ['抹茶スイーツ', '🍵', 1280, 4980], ['生チョコ', '🍫', 980, 3980],
    ['天然水24本', '💧', 1280, 3480], ['ミックスナッツ', '🥜', 880, 2980], ['特濃ミルク', '🥛', 680, 2480], ['熟成チーズ', '🧀', 980, 4980], ['寿司セット', '🍣', 2980, 12800] ] },
  { id: 'fashion', name: 'ファッション', emoji: '👟', hue: 330, items: [
    ['スニーカー', '👟', 3980, 24800], ['トートバッグ', '👜', 1980, 14800], ['ダウンジャケット', '🧥', 6980, 39800], ['サングラス', '🕶️', 1480, 12800], ['腕時計', '⌚', 2980, 29800],
    ['デニムパンツ', '👖', 2980, 12800], ['ワンピース', '👗', 2980, 14800], ['ニット帽', '🧢', 780, 3980], ['レザー財布', '👛', 1980, 14800], ['マフラー', '🧣', 1280, 6980] ] },
  { id: 'books', name: '本・文具', emoji: '📚', hue: 50, items: [
    ['万年筆', '🖋️', 1480, 19800], ['ノートセット', '📓', 480, 2980], ['小説全集', '📚', 1980, 12800], ['画集', '🎨', 1980, 9800], ['色鉛筆48色', '🖍️', 880, 4980],
    ['電子辞書', '📖', 5980, 29800], ['スケジュール帳', '📅', 780, 2980], ['地球儀', '🌏', 1980, 14800], ['ペンケース', '✏️', 580, 3480], ['付箋セット', '🗒️', 280, 1480] ] },
  { id: 'toys', name: 'おもちゃ・ホビー', emoji: '🧸', hue: 280, items: [
    ['ブロックセット', '🧱', 1980, 19800], ['ボードゲーム', '🎲', 1480, 7980], ['ぬいぐるみ', '🧸', 980, 6980], ['ラジコンカー', '🏎️', 2980, 14800], ['ジグソーパズル', '🧩', 780, 4980],
    ['ロケット模型', '🚀', 1980, 12800], ['ギターキット', '🎸', 3980, 24800], ['ドローン', '🛸', 4980, 39800], ['トイカメラ', '📸', 2980, 12800], ['けん玉', '🪀', 580, 2480] ] },
  { id: 'interior', name: '家具・インテリア', emoji: '🛋️', hue: 20, items: [
    ['ソファ', '🛋️', 14800, 99800], ['ワークチェア', '🪑', 6980, 49800], ['観葉植物', '🪴', 980, 9800], ['アロマキャンドル', '🕯️', 980, 4980], ['姿見', '🪞', 1980, 14800],
    ['掛け時計', '🕰️', 1480, 9800], ['ラグ', '🧶', 2980, 19800], ['本棚', '📚', 3980, 29800], ['ベッド', '🛏️', 9800, 79800], ['カーテン', '🪟', 1980, 12800] ] },
  { id: 'outdoor', name: 'スポーツ・アウトドア', emoji: '⛺', hue: 150, items: [
    ['テント', '⛺', 4980, 39800], ['ヨガマット', '🧘', 1480, 6980], ['ランニングシューズ', '👟', 3980, 19800], ['クロスバイク', '🚲', 19800, 99800], ['寝袋', '🏕️', 2480, 14800],
    ['ダンベルセット', '🏋️', 1980, 9800], ['サッカーボール', '⚽', 1280, 5980], ['釣り竿', '🎣', 1980, 19800], ['ゴーグル', '🥽', 2480, 12800], ['バックパック', '🎒', 2980, 19800] ] },
  { id: 'beauty', name: 'ビューティー・日用品', emoji: '🧴', hue: 350, items: [
    ['化粧水', '🧴', 980, 6980], ['美容液', '💧', 1480, 9800], ['シャンプー', '🧼', 780, 3980], ['電動歯ブラシ', '🪥', 1980, 12800], ['フェイスパック', '🎭', 580, 2980],
    ['香水', '🌸', 1980, 14800], ['ヘアアイロン', '💇', 2980, 14800], ['バスソルト', '🛁', 680, 2980], ['タオルセット', '🧺', 1480, 7980], ['ティッシュ箱買い', '🧻', 780, 2480] ] },
]

export const CATEGORIES: Category[] = RAW.map(({ id, name, emoji, hue }) => ({ id, name, emoji, hue }))

// 実在のブランドと被らない架空名
const BRANDS = ['ノヴァリス', 'ミライテック', '月見堂', 'ゼフィラ', 'ハレノヒ', 'ぽんぽこ工房', 'アオバ商会', 'ルミエール・ノア', 'コトノハ', 'ヤマビコ', 'シロクマ堂', 'オルテンシア']
const ADJ = ['極', '軽量', 'プレミアム', 'スリム', '大容量', '静音', 'ミニ', 'プロ', 'クラシック', 'ふんわり', 'うるおい', 'スマート']
const COLORS = ['ミッドナイト', 'ミルクホワイト', 'サクラ', 'フォレスト', 'サンセット', 'ストーン']
const CODES = ['NV', 'MR', 'TK', 'ZF', 'HR', 'AO']

// 決まった種(seed)から毎回同じ値を出す乱数。再読み込みしても同じ商品が並ぶ
export function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 末尾を 80 / 98 に揃える（¥3,980 / ¥3,998）
const priceLike = (v: number, r: number) => Math.max(100, Math.round(v / 100) * 100 - (r < 0.5 ? 20 : 2))

function build(): Product[] {
  const out: Product[] = []
  RAW.forEach((cat) =>
    cat.items.forEach(([item, emoji, lo, hi], ii) =>
      [0, 1].forEach((v) => {
        const id = out.length + 1
        const r = mulberry32(id * 7919 + 13)
        const brand = BRANDS[Math.floor(r() * BRANDS.length)]
        const adj = ADJ[(ii * 2 + v * 5) % ADJ.length]
        const model = `${CODES[Math.floor(r() * CODES.length)]}-${1000 + Math.floor(r() * 9000)}`
        const color = COLORS[Math.floor(r() * COLORS.length)]
        const priceYen = priceLike(lo + r() * (hi - lo), r())
        const discounted = r() < 0.45
        out.push({
          id, item, emoji, brand, category: cat.id, priceYen,
          name: `${brand} ${adj}${item} ${model}`,
          listPriceYen: discounted ? priceLike(priceYen * (1.15 + r() * 0.5), r()) : undefined,
          rating: Math.round((3.7 + r() * 1.2) * 10) / 10,
          reviewCount: Math.floor(10 ** (1 + r() * 3.6)),
          stock: r() < 0.15 ? 1 + Math.floor(r() * 5) : 20 + Math.floor(r() * 280),
          express: r() < 0.6,
          bullets: [
            `${brand}が手がけた${adj}な${item}。毎日の暮らしにちょうどいい一品です。`,
            `カラーは${color}。部屋にも持ち歩きにもなじむデザイン。`,
            '1年間のメーカー保証付き（※すべて架空の商品です）。',
          ],
          specs: [
            ['ブランド', brand], ['型番', model], ['カラー', color],
            ['サイズ', `W${10 + Math.floor(r() * 50)}×D${10 + Math.floor(r() * 40)}×H${5 + Math.floor(r() * 40)} cm`],
            ['保証期間', '1年間'], ['原産国', 'ノヴァ共和国（架空）'],
          ],
        })
      }),
    ),
  )
  return out
}

export const PRODUCTS: Product[] = build()
export const getProduct = (id: number) => PRODUCTS.find((p) => p.id === id)
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id)
export const SUGGESTIONS = [...new Set(PRODUCTS.map((p) => p.item))]
export const discountPct = (p: Product) => (p.listPriceYen ? Math.round((1 - p.priceYen / p.listPriceYen) * 100) : 0)
// おすすめ順: 評価 × 件数の対数
export const score = (p: Product) => p.rating * Math.log10(p.reviewCount + 10)
