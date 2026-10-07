export type Choice = { id: string; name: string; priceYen: number }
export type OptionGroup = { id: string; name: string; required: boolean; max: number; choices: Choice[] }
export type MenuItem = {
  id: number
  restaurantId: number
  name: string
  emoji: string
  priceYen: number
  cat: string
  desc: string
  popular: boolean
  groups: OptionGroup[]
}
export type Restaurant = {
  id: number
  name: string
  genre: string
  emoji: string
  hue: number
  rating: number
  reviews: number
  etaMin: [number, number]
  feeYen: number
  lngLat: [number, number]
}

// お届け先（地図の中心）。実在の街の地図の上に、架空の店と家を置いている
export const HOME_LNGLAT: [number, number] = [139.7671, 35.6812]

const g = (id: string, name: string, required: boolean, max: number, choices: [string, number][]): OptionGroup => ({
  id, name, required, max, choices: choices.map(([n, p], i) => ({ id: `${id}${i}`, name: n, priceYen: p })),
})

// オプションの部品。メニューごとにキーで組み合わせる
const OPT: Record<string, OptionGroup> = {
  size: g('size', 'サイズ', true, 1, [['並', 0], ['大盛', 150]]),
  noodleTop: g('top', 'トッピング', false, 3, [['味玉', 100], ['チャーシュー', 250], ['のり', 100], ['追加ねぎ', 50]]),
  spice: g('spice', '辛さ', true, 1, [['普通', 0], ['辛口', 0], ['激辛', 50]]),
  rice: g('rice', 'ライス', true, 1, [['普通', 0], ['少なめ', 0], ['大盛', 100]]),
  set: g('set', 'セット', true, 1, [['単品', 0], ['ポテト＋ドリンク', 380], ['ポテト＋ドリンク（大）', 480]]),
  pizza: g('psize', 'サイズ', true, 1, [['S（20cm）', 0], ['M（28cm）', 400], ['L（36cm）', 800]]),
  cheese: g('cheese', 'チーズ追加', false, 1, [['チーズ追加', 150]]),
  drink: g('dsize', 'サイズ', true, 1, [['S', 0], ['M', 50], ['L', 100]]),
  milk: g('milk', 'ミルク', true, 1, [['通常', 0], ['オーツミルク', 60], ['豆乳', 60]]),
  shot: g('shot', 'エスプレッソ追加', false, 1, [['追加する', 80]]),
  wasabi: g('wasabi', 'わさび', true, 1, [['あり', 0], ['なし', 0]]),
  sauce: g('sauce', 'ソース（2つまで）', false, 2, [['ガーリック', 0], ['バーベキュー', 0], ['チリ', 0], ['タルタル', 50]]),
  topping: g('dtop', 'トッピング', false, 2, [['温泉卵', 100], ['キムチ', 80], ['ねぎ増し', 50]]),
  dressing: g('dress', 'ドレッシング', true, 1, [['ごま', 0], ['和風', 0], ['シーザー', 0]]),
  salt: g('salt', '味付け', true, 1, [['塩', 0], ['タレ', 0]]),
}

type ItemSeed = [string, string, number, string, string[]] // 品名, 絵文字, 価格, カテゴリ, オプション部品のキー

const SEEDS: { r: Omit<Restaurant, 'id' | 'lngLat'>; items: ItemSeed[] }[] = [
  { r: { name: '麺屋 ほしぞら', genre: 'ラーメン', emoji: '🍜', hue: 25, rating: 4.6, reviews: 2310, etaMin: [20, 30], feeYen: 150 },
    items: [['星空しょうゆラーメン', '🍜', 880, '麺', ['size', 'noodleTop']], ['濃厚みそラーメン', '🍜', 980, '麺', ['size', 'noodleTop']], ['月見とんこつ', '🍜', 950, '麺', ['size', 'noodleTop']], ['つけ麺', '🍜', 1050, '麺', ['size', 'noodleTop']],
      ['チャーシュー丼', '🍚', 520, 'サイドメニュー', []], ['餃子（6個）', '🥟', 420, 'サイドメニュー', []], ['から揚げ', '🍗', 480, 'サイドメニュー', []], ['ウーロン茶', '🍵', 200, 'ドリンク', []]] },
  { r: { name: '回転すし 波まる', genre: '寿司', emoji: '🍣', hue: 200, rating: 4.4, reviews: 1820, etaMin: [30, 45], feeYen: 250 },
    items: [['まぐろ握り（2貫）', '🍣', 480, '握り', ['wasabi']], ['サーモン握り（2貫）', '🍣', 380, '握り', ['wasabi']], ['えび握り（2貫）', '🍤', 360, '握り', ['wasabi']], ['特上おまかせ10貫', '🍣', 2480, 'セット', ['wasabi']],
      ['サーモン丼', '🍚', 980, '丼', ['wasabi']], ['鉄火巻', '🍙', 480, '巻物', ['wasabi']], ['茶碗蒸し', '🥚', 280, 'サイドメニュー', []], ['あおさ味噌汁', '🍲', 180, 'サイドメニュー', []]] },
  { r: { name: 'バーガーラボ ポンポコ', genre: 'ハンバーガー', emoji: '🍔', hue: 15, rating: 4.3, reviews: 3120, etaMin: [15, 25], feeYen: 0 },
    items: [['ポンポコバーガー', '🍔', 690, 'バーガー', ['set', 'cheese']], ['ダブルチーズバーガー', '🍔', 890, 'バーガー', ['set']], ['てりやきチキンバーガー', '🍔', 720, 'バーガー', ['set', 'cheese']], ['フィッシュバーガー', '🍔', 650, 'バーガー', ['set']],
      ['フライドポテト', '🍟', 320, 'サイドメニュー', ['sauce']], ['ナゲット（8個）', '🍗', 450, 'サイドメニュー', ['sauce']], ['コーラ', '🥤', 220, 'ドリンク', ['drink']], ['バニラシェイク', '🥛', 380, 'ドリンク', ['drink']]] },
  { r: { name: 'ピッツェリア ソラ', genre: 'ピザ', emoji: '🍕', hue: 5, rating: 4.5, reviews: 980, etaMin: [30, 40], feeYen: 300 },
    items: [['マルゲリータ', '🍕', 1100, 'ピザ', ['pizza', 'cheese']], ['クワトロフォルマッジ', '🍕', 1400, 'ピザ', ['pizza']], ['ペパロニ', '🍕', 1300, 'ピザ', ['pizza', 'cheese']], ['シーフードミックス', '🍕', 1500, 'ピザ', ['pizza']],
      ['シーザーサラダ', '🥗', 650, 'サイドメニュー', ['dressing']], ['ガーリックブレッド', '🥖', 450, 'サイドメニュー', []], ['ジェラート', '🍨', 400, 'デザート', []], ['ジンジャーエール', '🥤', 280, 'ドリンク', ['drink']]] },
  { r: { name: 'カレーの森', genre: 'カレー', emoji: '🍛', hue: 40, rating: 4.7, reviews: 1540, etaMin: [20, 35], feeYen: 200 },
    items: [['森のバターチキンカレー', '🍛', 980, 'カレー', ['spice', 'rice', 'topping']], ['ほうれん草キーマ', '🍛', 950, 'カレー', ['spice', 'rice', 'topping']], ['野菜たっぷりカレー', '🍛', 920, 'カレー', ['spice', 'rice', 'topping']], ['スパイスポークカレー', '🍛', 1050, 'カレー', ['spice', 'rice', 'topping']],
      ['ナン（2枚）', '🫓', 320, 'サイドメニュー', []], ['サモサ', '🥟', 380, 'サイドメニュー', []], ['ラッシー', '🥛', 350, 'ドリンク', []], ['チャイ', '🍵', 380, 'ドリンク', ['drink']]] },
  { r: { name: '喫茶 ひだまり', genre: 'カフェ', emoji: '☕', hue: 35, rating: 4.5, reviews: 760, etaMin: [15, 25], feeYen: 100 },
    items: [['ブレンドコーヒー', '☕', 450, 'ドリンク', ['drink', 'shot']], ['カフェラテ', '☕', 520, 'ドリンク', ['drink', 'milk', 'shot']], ['抹茶ラテ', '🍵', 580, 'ドリンク', ['drink', 'milk']], ['ミルクティー', '🥛', 520, 'ドリンク', ['drink', 'milk']],
      ['ホットサンド', '🥪', 680, 'フード', []], ['たまごサンド', '🥪', 520, 'フード', []], ['ホットケーキ', '🥞', 780, 'デザート', []], ['プリン', '🍮', 420, 'デザート', []]] },
  { r: { name: '中華 天龍飯店', genre: '中華', emoji: '🥟', hue: 0, rating: 4.2, reviews: 1120, etaMin: [25, 40], feeYen: 200 },
    items: [['天龍チャーハン', '🍚', 880, '主食', ['size', 'spice']], ['麻婆豆腐定食', '🍲', 980, '主食', ['spice', 'rice']], ['エビチリ', '🍤', 1280, '一品', ['spice']], ['酢豚', '🍖', 1180, '一品', []],
      ['焼き餃子（8個）', '🥟', 580, '点心', []], ['小籠包（4個）', '🥟', 620, '点心', []], ['春巻（2本）', '🥠', 480, '点心', []], ['杏仁豆腐', '🍮', 380, 'デザート', []]] },
  { r: { name: '韓国食堂 ソウルの月', genre: '韓国料理', emoji: '🍲', hue: 350, rating: 4.4, reviews: 890, etaMin: [25, 35], feeYen: 250 },
    items: [['純豆腐チゲ', '🍲', 1080, 'チゲ', ['spice', 'rice']], ['ビビンバ', '🍚', 1050, 'ご飯', ['spice', 'topping']], ['プルコギ定食', '🥩', 1280, 'ご飯', ['rice']], ['チーズタッカルビ', '🍗', 1380, '一品', ['spice']],
      ['チヂミ', '🥞', 680, 'サイドメニュー', []], ['キンパ', '🍙', 580, 'サイドメニュー', []], ['トッポギ', '🍢', 620, 'サイドメニュー', ['spice']], ['マッコリ風ドリンク', '🥛', 420, 'ドリンク', []]] },
  { r: { name: '丼屋 たぬき', genre: '丼もの', emoji: '🍚', hue: 45, rating: 4.1, reviews: 2680, etaMin: [15, 25], feeYen: 0 },
    items: [['特製牛丼', '🍚', 580, '丼', ['size', 'topping']], ['カツ丼', '🍚', 780, '丼', ['size', 'topping']], ['親子丼', '🍚', 680, '丼', ['size', 'topping']], ['天丼', '🍤', 880, '丼', ['size']],
      ['豚汁', '🍲', 220, 'サイドメニュー', []], ['お新香', '🥒', 150, 'サイドメニュー', []], ['生卵', '🥚', 80, 'サイドメニュー', []], ['緑茶', '🍵', 150, 'ドリンク', []]] },
  { r: { name: 'スイーツ工房 ミルフィーユ', genre: 'スイーツ', emoji: '🍰', hue: 320, rating: 4.8, reviews: 540, etaMin: [25, 40], feeYen: 350 },
    items: [['いちごショート', '🍰', 620, 'ケーキ', []], ['濃厚チーズケーキ', '🍰', 580, 'ケーキ', []], ['モンブラン', '🌰', 680, 'ケーキ', []], ['季節のタルト', '🥧', 720, 'ケーキ', []],
      ['生チョコ（6粒）', '🍫', 780, '焼き菓子', []], ['マカロン（4個）', '🍪', 880, '焼き菓子', []], ['シュークリーム', '🥐', 320, '焼き菓子', []], ['紅茶', '🍵', 400, 'ドリンク', ['drink']]] },
  { r: { name: 'グリーンボウル', genre: 'ヘルシー', emoji: '🥗', hue: 130, rating: 4.5, reviews: 670, etaMin: [15, 25], feeYen: 150 },
    items: [['チキンサラダボウル', '🥗', 980, 'ボウル', ['dressing', 'topping']], ['アボカドボウル', '🥑', 1080, 'ボウル', ['dressing', 'topping']], ['サーモンボウル', '🥗', 1180, 'ボウル', ['dressing', 'topping']], ['豆腐ボウル', '🥗', 880, 'ボウル', ['dressing']],
      ['スムージー', '🥤', 580, 'ドリンク', ['drink']], ['野菜スープ', '🍲', 380, 'サイドメニュー', []], ['フルーツカップ', '🍓', 420, 'サイドメニュー', []], ['ナッツバー', '🥜', 280, 'サイドメニュー', []]] },
  { r: { name: '焼き鳥 とり吉', genre: '焼き鳥', emoji: '🍢', hue: 20, rating: 4.3, reviews: 1030, etaMin: [25, 40], feeYen: 200 },
    items: [['もも串（2本）', '🍢', 320, '串', ['salt']], ['ねぎま串（2本）', '🍢', 320, '串', ['salt']], ['つくね串（2本）', '🍢', 380, '串', ['salt']], ['皮串（2本）', '🍢', 280, '串', ['salt']],
      ['焼き鳥盛り合わせ10本', '🍢', 1580, '串', ['salt']], ['だし巻き卵', '🥚', 480, '一品', []], ['冷やしトマト', '🍅', 350, '一品', []], ['烏龍茶', '🍵', 250, 'ドリンク', []]] },
]

export const RESTAURANTS: Restaurant[] = SEEDS.map(({ r }, i) => {
  const id = i + 1
  return {
    ...r,
    id,
    // 家のまわりに、毎回同じ位置で散らす
    lngLat: [
      HOME_LNGLAT[0] + Math.cos(id * 2.1) * (0.004 + 0.0015 * (id % 4)),
      HOME_LNGLAT[1] + Math.sin(id * 2.1) * (0.003 + 0.001 * (id % 3)),
    ],
  }
})

export const MENU: MenuItem[] = SEEDS.flatMap(({ items }, ri) =>
  items.map(([name, emoji, priceYen, cat, keys], ii) => ({
    id: (ri + 1) * 100 + ii + 1,
    restaurantId: ri + 1,
    name, emoji, priceYen, cat,
    desc: `${SEEDS[ri].r.name}の人気メニュー「${name}」。`,
    popular: ii < 3,
    groups: keys.map((k) => OPT[k]),
  })),
)

export const GENRES = [...new Set(RESTAURANTS.map((r) => r.genre))]
export const getRestaurant = (id: number) => RESTAURANTS.find((r) => r.id === id)
export const getMenuItem = (id: number) => MENU.find((m) => m.id === id)
export const menuOf = (restaurantId: number) => MENU.filter((m) => m.restaurantId === restaurantId)
