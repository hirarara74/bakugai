export type Category = { id: string; name: string; emoji: string; hue: number }
export type Tier = 'P' | 'S' | 'B' // プレミアム / 標準 / お手頃
export type Product = {
  id: number
  name: string
  item: string // 品目（例: ワイヤレスイヤホン）。同じ品目を複数メーカーが売る
  brand: string
  makerId: number
  tier: Tier
  category: string
  priceYen: number
  listPriceYen?: number
  emoji: string
  color: string
  rating: number
  reviewCount: number
  stock: number
  express: boolean
  bullets: string[]
  description: string[]
  specs: [string, string][]
}

/* ───── メーカー（すべて架空） ───── */
type Maker = { name: string; tier: Tier; look: string; colors: [string, string][] } // colors: [日本語, 画像用の英語]
const MAKERS: Maker[] = [
  { name: 'ノヴァリス', tier: 'P', look: 'sleek minimalist design with brushed metal accents', colors: [['ミルクホワイト', 'matte white'], ['ストーングレー', 'light stone gray']] },
  { name: 'ミライテック', tier: 'S', look: 'modern tech design', colors: [['ミッドナイト', 'black'], ['シルバー', 'silver']] },
  { name: 'ハレノヒ', tier: 'B', look: 'simple bright design', colors: [['サクラ', 'pastel pink'], ['ミント', 'pastel mint']] },
  { name: '月見堂', tier: 'S', look: 'retro vintage design with rounded corners', colors: [['クリーム', 'cream'], ['あずき', 'dusty red-brown']] },
  { name: 'ゼフィラ', tier: 'P', look: 'premium luxury design', colors: [['チャコール', 'charcoal'], ['シャンパンゴールド', 'champagne gold']] },
  { name: 'ぽんぽこ工房', tier: 'B', look: 'cute rounded design', colors: [['ミントグリーン', 'mint green'], ['ミルクティー', 'milk tea beige']] },
  { name: 'アオバ商会', tier: 'S', look: 'natural scandinavian design', colors: [['ナチュラル', 'natural wood'], ['ホワイト', 'white']] },
  { name: 'ルミエール・ノア', tier: 'P', look: 'elegant refined design', colors: [['ブラック', 'black'], ['ゴールド', 'gold']] },
  { name: 'コトノハ', tier: 'S', look: 'soft calm design', colors: [['ベージュ', 'beige'], ['セージグリーン', 'sage green']] },
  { name: 'ヤマビコ', tier: 'S', look: 'rugged outdoor design', colors: [['オリーブ', 'olive green'], ['ブラック', 'black']] },
  { name: 'シロクマ堂', tier: 'B', look: 'plain budget design', colors: [['ホワイト', 'white'], ['ライトブルー', 'light blue']] },
  { name: 'オルテンシア', tier: 'P', look: 'refined elegant design', colors: [['ネイビー', 'navy blue'], ['シルバー', 'silver']] },
  { name: 'ココロ雑貨店', tier: 'B', look: 'colorful playful design', colors: [['レッド', 'red'], ['イエロー', 'yellow']] },
  { name: 'テツノ製作所', tier: 'P', look: 'industrial professional design', colors: [['ステンレス', 'stainless steel'], ['ガンメタル', 'gunmetal gray']] },
  { name: 'そよかぜ', tier: 'S', look: 'light airy design', colors: [['スカイブルー', 'sky blue'], ['ホワイト', 'white']] },
  { name: 'クラウドナイン', tier: 'S', look: 'modern gradient design', colors: [['グレー', 'gray'], ['オレンジ', 'orange']] },
  { name: 'ハナマル', tier: 'B', look: 'cheerful friendly design', colors: [['イエロー', 'yellow'], ['ホワイト', 'white']] },
  { name: 'ミナモ', tier: 'P', look: 'premium pearl finish design', colors: [['ティール', 'deep teal'], ['パールホワイト', 'pearl white']] },
]

// 価格帯(品目の最低〜最高価格の中の位置)・評価・保証・商品名に付ける言葉
const TIER = {
  P: { pos: [0.55, 1], rating: [4.3, 4.9], logRev: [1.5, 3.3], warranty: '2年間', words: ['プレミアム', '極', 'Signature', 'Pro'] },
  S: { pos: [0.25, 0.65], rating: [4.0, 4.6], logRev: [2, 3.9], warranty: '1年間', words: ['スタンダード', 'スマート', 'クラシック', 'ベーシック'] },
  B: { pos: [0, 0.3], rating: [3.6, 4.3], logRev: [2.2, 4.3], warranty: '6か月', words: ['お手軽', 'コンパクト', 'ミニ', 'エントリー'] },
} as const

/* ───── 品目 ───── */
// [品名, 絵文字, 最低価格, 最高価格, 画像用の英語, 特長3つ('|'区切り)]
type ItemSeed = [string, string, number, number, string, string]
type CatSeed = Category & { scene: string[]; aspects: [string, string][]; items: ItemSeed[] }

const RAW: CatSeed[] = [
  { id: 'appliance', name: '家電', emoji: '🌀', hue: 230,
    scene: ['毎日の暮らしを、静かに、快適に支える家電です。', 'リビングにも寝室にもなじむデザインで、置く場所を選びません。', '忙しい毎日でも手間をかけず、ボタンひとつで頼れる存在になります。'],
    aspects: [['動作音が静かで、夜でも気になりません', '動作音が思ったより大きく感じました'], ['操作がシンプルで迷いません', 'ボタンの表示が少し分かりづらいです'], ['パワーが十分で、効果を実感できます', 'パワーはやや控えめに感じました'], ['デザインがすっきりしていて部屋になじみます', 'デザインがシンプルすぎて少し味気ないです'], ['お手入れが簡単で助かっています', 'お手入れに少し手間がかかります'], ['コードの長さがちょうどよく使いやすいです', 'コードがもう少し長いと助かります']],
    items: [
      ['空気清浄機', '🌀', 9800, 49800, 'air purifier for living room', 'HEPAフィルターで微細なほこりを除去|静音モードは就寝時も気にならない|花粉・ニオイ・ハウスダストに対応'],
      ['扇風機', '🌀', 2980, 14800, 'standing electric fan', '首振りと上下角度調整で部屋全体に送風|風量は多段階で調整できる|軽量で持ち運びしやすい'],
      ['ドライヤー', '💨', 2480, 19800, 'hair dryer', '大風量で髪をすばやく乾かす|温風と冷風の切り替えで仕上げまで|軽くて腕が疲れにくい'],
      ['電気毛布', '🛏️', 2980, 9800, 'folded soft fleece blanket with a small remote controller', 'ベッドでもソファでも使える|温度は段階調整で切り忘れ防止タイマー付き|洗濯機で丸洗いできる'],
      ['ロボット掃除機', '🤖', 14800, 69800, 'robot vacuum cleaner', '段差や障害物を避けて自動で掃除|アプリでスケジュール設定ができる|充電が減ると自動で充電台へ戻る'],
      ['ワイヤレスイヤホン', '🎧', 2980, 14800, 'wireless earbuds with charging case', 'ノイズキャンセリングで周囲の音を抑える|ケース込みで最大24時間再生|防滴仕様でスポーツにも'],
      ['Bluetoothスピーカー', '🔊', 2480, 19800, 'portable bluetooth speaker', '小型でも迫力のある低音|防水仕様でお風呂やアウトドアでも|1回の充電で長時間再生'],
      ['ヘッドホン', '🎧', 3980, 29800, 'over-ear headphones', '長時間着けても疲れにくいイヤーパッド|有線・無線の両方に対応|折りたたんで持ち運びやすい'],
      ['サウンドバー', '📻', 6980, 39800, 'soundbar speaker for television', 'テレビの音声がくっきり聞き取りやすい|HDMI接続で簡単セットアップ|Bluetoothで音楽も楽しめる'],
      ['ポータブルラジオ', '📻', 1980, 6980, 'portable radio', '防災に役立つ手回し充電に対応|AM・FMにワイドFM対応|ライト付きで停電時も安心'],
    ] },
  { id: 'gadget', name: 'ガジェット', emoji: '⌚', hue: 190,
    scene: ['仕事も趣味もスマートにこなせる、デスクまわりの相棒です。', '持ち歩きやすく、カバンの中でもかさばりません。', '毎日の「ちょっと不便」を、ひとつずつ解消してくれます。'],
    aspects: [['接続がすぐにつながって快適です', 'たまに接続が不安定になることがあります'], ['軽くて持ち運びが苦になりません', '見た目より重く感じました'], ['作りがしっかりしていて安心感があります', '少しチープな質感が気になりました'], ['バッテリーの持ちが良いです', 'バッテリーの減りがやや早いです'], ['設定が簡単で、すぐ使い始められました', '説明書が簡素で、設定に少し迷いました'], ['サイズがちょうどよくデスクで邪魔になりません', 'サイズが少し大きめでした']],
    items: [
      ['スマートウォッチ', '⌚', 2980, 29800, 'smartwatch', '心拍や睡眠を記録して健康管理|スマホの通知を手首で確認|5気圧防水で運動にも'],
      ['モバイルバッテリー', '🔋', 1480, 7980, 'power bank with a charging cable, product only', 'スマホを約2回フル充電できる大容量|急速充電に対応|薄型で持ち歩きやすい'],
      ['USB充電器', '🔌', 1280, 5980, 'usb wall charger', '複数のポートで同時に充電|小型でコンセント周りがすっきり|過熱・過電流を防ぐ安全設計'],
      ['ワイヤレスマウス', '🖱️', 980, 8980, 'wireless computer mouse', '静音クリックで夜も使いやすい|DPI切り替えで細かい作業も|電池1本で長く使える'],
      ['メカニカルキーボード', '⌨️', 3980, 24800, 'computer keyboard with rows of keys, top-down view', '心地よい打鍵感とクリック音|バックライト付きで暗い部屋でも|キーの割り当てを自由に変更'],
      ['Webカメラ', '📷', 1980, 12800, 'webcam', 'フルHDで会議も授業も鮮明|ノイズを抑えるマイク内蔵|プライバシーカバー付き'],
      ['ノートPCスタンド', '💻', 1280, 6980, 'aluminum laptop riser stand, no laptop', '画面の高さを調整して姿勢をラクに|放熱を助けるアルミ素材|折りたたんで持ち運べる'],
      ['ポータブルSSD', '💾', 4980, 19800, 'portable ssd drive', '高速な読み書きで大きなファイルもすばやく|手のひらサイズで携帯しやすい|衝撃に強い堅牢設計'],
      ['スマホスタンド', '📱', 780, 3980, 'phone stand holder', '角度を自由に調整できる|滑りにくいシリコンパッド|動画視聴やビデオ通話に便利'],
      ['LEDデスクライト', '💡', 1980, 9800, 'led desk lamp', '目に優しいちらつき防止設計|明るさと色温度を調整できる|アームが自由に動き手元を照らしやすい'],
    ] },
  { id: 'kitchen', name: 'キッチン', emoji: '🍳', hue: 30,
    scene: ['忙しい朝の準備にも、休日のゆったりした料理にも活躍します。', 'お手入れがしやすく、毎日のキッチンが気持ちよく保てます。', '料理のレパートリーが広がる、頼れるキッチンの相棒です。'],
    aspects: [['使いやすく、毎日の料理がラクになりました', '慣れるまで少し使い方に戸惑いました'], ['お手入れが簡単で洗い物がラクです', '洗うときに少し手間がかかります'], ['火の通りが均一で仕上がりがきれいです', '仕上がりにムラが出ることがありました'], ['デザインがおしゃれでキッチンが映えます', 'サイズが大きめで置き場所に困りました'], ['作りがしっかりしていて長く使えそうです', '細かい部品が少し安っぽく感じます'], ['収納しやすくて場所を取りません', '収納時にかさばります']],
    items: [
      ['炊飯器', '🍚', 6980, 49800, 'rice cooker', '厚釜で甘みを引き出すふっくら炊き上がり|玄米・おかゆなど多彩なメニュー|予約・保温機能付き'],
      ['フライパン', '🍳', 1480, 8980, 'empty non-stick frying pan cookware, no food', 'こびりつきにくいフッ素加工|ガス火・IH対応|軽くて手首に負担が少ない'],
      ['包丁', '🔪', 1980, 19800, 'kitchen chef knife', '切れ味が長持ちする刃|握りやすいハンドル|お手入れしやすいステンレス'],
      ['ホットプレート', '🥘', 3980, 14800, 'electric hot plate grill, empty', '焼き肉もお好み焼きもこれ1台で|温度調整で焼きムラが出にくい|プレートは取り外して丸洗い'],
      ['コーヒーメーカー', '☕', 3980, 24800, 'coffee maker machine', '豆から挽いて淹れる本格派|濃さと量を選べる|保温プレートで淹れたてをキープ'],
      ['トースター', '🍞', 3480, 19800, 'toaster oven', '外はカリッと中はふんわり焼き上がる|温度とタイマーを細かく調整|パンくずトレイは取り外して簡単掃除'],
      ['保温ボトル', '🍶', 1480, 4980, 'insulated stainless steel water bottle', '長時間の保温・保冷を実現|軽量で持ち運びやすい|洗いやすい広口設計'],
      ['圧力鍋', '🍲', 3980, 19800, 'pressure cooker pot, empty', '煮込み時間を大幅に短縮|安全装置付きで安心して使える|IHにも対応'],
      ['ミキサー', '🥤', 2980, 12800, 'countertop blender, empty', 'スムージーも離乳食も滑らかに|氷も砕けるパワフルなモーター|洗いやすいシンプル構造'],
      ['食器セット', '🍽️', 1980, 9800, 'ceramic dinnerware set of empty plates and bowls', '毎日使いやすいシンプルなデザイン|電子レンジ・食洗機に対応|重ねて収納できる'],
    ] },
  { id: 'food', name: '食品・飲料', emoji: '🥩', hue: 120,
    scene: ['食卓がぱっと華やぐ、とっておきの一品です。', '自分へのごほうびにも、大切な人への贈り物にもぴったりです。', '素材の良さをそのまま味わえるよう、丁寧に仕上げました。'],
    aspects: [['味が濃厚でとてもおいしかったです', '期待していたほど味に特徴がありませんでした'], ['鮮度が良く、新鮮な状態で届きました', '届いたとき少し鮮度が落ちていました'], ['量がたっぷりあって満足です', '量が思ったより少なめでした'], ['パッケージがきれいで贈り物にぴったりです', 'パッケージが簡素でギフトには向きません'], ['家族みんなに好評でした', '好みが分かれる味だと思います'], ['また買いたいと思える味です', 'リピートするかは微妙なところです']],
    items: [
      ['高級和牛', '🥩', 2980, 19800, 'raw wagyu beef steak with fine marbling', 'きめ細かな霜降りのやわらかさ|冷凍で届き、使いたい分だけ解凍|ギフトにも喜ばれる'],
      ['完熟みかん', '🍊', 1280, 4980, 'fresh mandarin oranges', '甘みと酸味のバランスが良い|産地直送でみずみずしい|皮が薄くむきやすい'],
      ['有機コーヒー豆', '☕', 980, 3980, 'coffee beans in a paper bag', '有機栽培の豆を丁寧に焙煎|香り高くすっきりした後味|挽き方を選んで楽しめる'],
      ['抹茶スイーツ', '🍵', 1280, 4980, 'matcha green tea sweets', '濃厚な抹茶の風味を贅沢に|ほどよい甘さで大人向け|個包装で配りやすい'],
      ['生チョコ', '🍫', 980, 3980, 'chocolate truffles in a gift box', '口の中でなめらかに溶ける|カカオの香りをしっかり味わえる|ギフトボックス入り'],
      ['天然水24本', '💧', 1280, 3480, 'case of bottled mineral water', 'ミネラルバランスの良い軟水|備蓄にも便利な箱買い|軽くて持ち運びやすいボトル'],
      ['ミックスナッツ', '🥜', 880, 2980, 'mixed nuts in a bowl', '素焼きでナッツ本来の味|食塩・油不使用|チャック付きで保存しやすい'],
      ['特濃ミルク', '🥛', 680, 2480, 'glass bottle of fresh milk', '濃厚でコクのある味わい|低温殺菌でミルク本来の風味|そのままでもお菓子作りにも'],
      ['熟成チーズ', '🧀', 980, 4980, 'aged cheese wedge', 'じっくり熟成した深い旨み|ワインにもパンにも合う|少量ずつ使いやすいカット済み'],
      ['寿司セット', '🍣', 2980, 12800, 'sushi assortment on a platter', '新鮮な魚介をバランスよく|冷蔵でお届け、すぐ食べられる|パーティーや記念日に'],
    ] },
  { id: 'fashion', name: 'ファッション', emoji: '👟', hue: 330,
    scene: ['普段のコーディネートに、さりげなく取り入れやすい一点です。', '長く愛用できるよう、素材と縫製にこだわりました。', '季節を問わず、着こなしの幅が広がります。'],
    aspects: [['サイズ感がちょうどよく、着心地が良いです', 'サイズが少し小さめで、ワンサイズ上でもよかったです'], ['生地がしっかりしていて高見えします', '生地が薄めで少し頼りなく感じました'], ['どんな服にも合わせやすいです', '色味が写真と少し違いました'], ['縫製が丁寧で安心して使えます', '糸のほつれが少し気になりました'], ['軽くて疲れにくいです', '思ったより重さを感じました'], ['洗濯してもヘタりにくいです', '洗濯後に少し縮みました']],
    items: [
      ['スニーカー', '👟', 3980, 24800, 'sneakers pair', '歩きやすいクッション性|どんな服にも合うシンプルなデザイン|通気性の良い素材'],
      ['トートバッグ', '👜', 1980, 14800, 'tote bag', 'A4サイズが入る大きさ|内ポケットで小物も整理|丈夫な縫製'],
      ['ダウンジャケット', '🧥', 6980, 39800, 'puffer down jacket', '軽くて暖かいダウン使用|撥水加工で小雨も安心|コンパクトに収納できる'],
      ['サングラス', '🕶️', 1480, 12800, 'sunglasses', 'UVカットでまぶしさを軽減|軽量で掛け心地が良い|ケース付き'],
      ['腕時計', '⌚', 2980, 29800, 'analog wrist watch', 'シンプルで見やすい文字盤|日常生活防水|ベルトは調整しやすい'],
      ['デニムパンツ', '👖', 2980, 12800, 'folded blue jeans stack on a shelf', 'ほどよい伸縮で動きやすい|はき込むほど味が出る|ベーシックな形でコーデしやすい'],
      ['ワンピース', '👗', 2980, 14800, 'dress on a hanger', '一枚でサマになるシルエット|しわになりにくい素材|普段着にもお出かけにも'],
      ['ニット帽', '🧢', 780, 3980, 'knit beanie hat', '伸びがよく頭になじむ|やわらかく肌ざわりが良い|ユニセックスで使える'],
      ['レザー財布', '👛', 1980, 14800, 'leather wallet', '手になじむ上質な革|カードがたっぷり入る収納力|薄型でポケットに収まる'],
      ['マフラー', '🧣', 1280, 6980, 'folded wool scarf', '首元をやさしく包むふんわり素材|軽くて肩がこりにくい|巻き方でいろいろ楽しめる'],
    ] },
  { id: 'books', name: '本・文具', emoji: '📚', hue: 50,
    scene: ['机の上に置くだけで、毎日の勉強や仕事がはかどります。', '手に取るたびに、書く・読む時間が楽しくなります。', '贈り物としても喜ばれる、上質なステーショナリーです。'],
    aspects: [['書き心地がなめらかで気持ちいいです', '書き味がやや硬く感じました'], ['紙質が良く、裏写りしません', '紙が薄めで少し裏写りします'], ['デザインがシンプルでおしゃれです', 'デザインが好みと少し違いました'], ['作りがしっかりしていて長く使えそうです', '細部の作りが少し粗い気がします'], ['持ち運びしやすいサイズ感です', 'サイズが少し大きく感じました'], ['プレゼントにも喜ばれました', '贈答用としては少し簡素です']],
    items: [
      ['万年筆', '🖋️', 1480, 19800, 'fountain pen', 'なめらかな書き心地|インクは交換可能|プレゼントにも'],
      ['ノートセット', '📓', 480, 2980, 'stack of notebooks', '裏写りしにくい紙|開きやすい糸綴じ|仕事にも勉強にも'],
      ['小説全集', '📚', 1980, 12800, 'stack of hardcover books', '名作をまとめて読める|文字が大きく読みやすい|書棚に映える装丁'],
      ['画集', '🎨', 1980, 9800, 'open large hardcover art book showing colorful paintings', '細部まで美しい印刷|見応えのある大判サイズ|眺めるだけで楽しい'],
      ['色鉛筆48色', '🖍️', 880, 4980, 'set of colored pencils in a tin', '発色が良くなめらかな描き心地|豊富な48色セット|缶ケース入り'],
      ['電子辞書', '📖', 5980, 29800, 'electronic dictionary device', '多数の辞書コンテンツを収録|すばやく調べられるキー配列|軽くて持ち歩きやすい'],
      ['スケジュール帳', '📅', 780, 2980, 'planner diary notebook', '見開き1週間で予定が見やすい|書きやすい薄手の紙|しおり付き'],
      ['地球儀', '🌏', 1980, 14800, 'desk globe', '見やすい地図表示|なめらかに回る台座|インテリアにも'],
      ['ペンケース', '✏️', 580, 3480, 'pencil case', 'たっぷり入る大容量|ペンが取り出しやすい形|汚れが拭ける素材'],
      ['付箋セット', '🗒️', 280, 1480, 'pad of square colorful sticky note papers on a desk', '何度も貼って剥がせる|豊富な色とサイズ|机まわりが華やぐ'],
    ] },
  { id: 'toys', name: 'おもちゃ・ホビー', emoji: '🧸', hue: 280,
    scene: ['遊びながら、発想力や集中力が自然と育ちます。', '家族や友だちと一緒に、笑顔の時間を過ごせます。', '大人も思わず夢中になってしまう、遊び心のある一品です。'],
    aspects: [['子どもが夢中になって遊んでいます', '子どもの反応は思ったより薄めでした'], ['作りがしっかりしていて安心です', 'パーツが少し壊れやすい印象です'], ['家族みんなで盛り上がれます', 'ルールの理解に少し時間がかかりました'], ['色合いがきれいで見ていて楽しいです', '色が写真よりも落ち着いていました'], ['組み立てやすく、説明書も分かりやすいです', '説明書が少し分かりにくかったです'], ['プレゼントに喜ばれました', '対象年齢を少し確認した方がよいです']],
    items: [
      ['ブロックセット', '🧱', 1980, 19800, 'pile of colorful interlocking plastic toy building bricks', '自由に組み立てて想像力アップ|対象年齢は6歳以上|収納ケース付き'],
      ['ボードゲーム', '🎲', 1480, 7980, 'board game box with pieces and cards', '2〜4人で盛り上がる|ルールがシンプルで説明しやすい|プレイ時間は約30分'],
      ['ぬいぐるみ', '🧸', 980, 6980, 'teddy bear plush toy', 'ふわふわで抱き心地が良い|洗えるやさしい素材|ギフトに人気'],
      ['ラジコンカー', '🏎️', 2980, 14800, 'remote control toy car', '操作しやすいコントローラー付き|悪路にも強いタイヤ|USBで充電できる'],
      ['ジグソーパズル', '🧩', 780, 4980, 'jigsaw puzzle partially assembled with colorful pieces', 'ピースがぴったりはまる精密カット|完成後は飾れる|ご家族で楽しめる'],
      ['ロケット模型', '🚀', 1980, 12800, 'toy rocket model', '接着剤不要で組み立てやすい|細部までリアルな造形|飾って楽しめる'],
      ['ギターキット', '🎸', 3980, 24800, 'acoustic guitar', '初心者でも弾きやすいネック|チューナー付き|アクセサリーがそろう'],
      ['ドローン', '🛸', 4980, 39800, 'small quadcopter drone', 'カメラ付きで空撮ができる|初心者向けの自動ホバリング|バッテリーは取り替え可能'],
      ['トイカメラ', '📸', 2980, 12800, 'cute compact toy camera', 'レトロな写りを楽しめる|軽くて持ち歩きやすい|電池で動く手軽さ'],
      ['けん玉', '🪀', 580, 2480, 'kendama wooden cup-and-ball toy with a ball on a string', '木の温もりが手になじむ|技の練習で上達する|ひとりでも家族でも'],
    ] },
  { id: 'interior', name: '家具・インテリア', emoji: '🛋️', hue: 20,
    scene: ['お部屋の雰囲気を、ひとつでぐっと変えてくれます。', 'どんなインテリアにもなじむ、落ち着いたデザインです。', '毎日過ごす場所だからこそ、心地よさにこだわりました。'],
    aspects: [['お部屋の雰囲気が明るくなりました', 'お部屋の雰囲気とは少し合いませんでした'], ['作りがしっかりしていて安定感があります', '組み立て時に少しぐらつきました'], ['サイズがぴったりで置き場所に困りません', 'サイズが思ったより大きかったです'], ['色や質感が写真のとおりでした', '質感が写真より少し安っぽく見えました'], ['組み立てが簡単でした', '組み立てに時間がかかりました'], ['掃除やお手入れがしやすいです', 'お手入れに少し気を使います']],
    items: [
      ['ソファ', '🛋️', 14800, 99800, 'fabric sofa couch', 'ゆったり座れる広い座面|カバーを外して洗濯できる|組み立てが簡単'],
      ['ワークチェア', '🪑', 6980, 49800, 'ergonomic office chair', '腰をしっかり支えるサポート|高さと角度を調整できる|通気性の良いメッシュ'],
      ['観葉植物', '🪴', 980, 9800, 'potted green houseplant', 'お部屋がぱっと明るくなる|育てやすい丈夫な種類|鉢カバー付き'],
      ['アロマキャンドル', '🕯️', 980, 4980, 'scented candle in glass jar', 'やさしい香りが広がる|ゆらぐ炎でリラックス|ガラス容器入り'],
      ['姿見', '🪞', 1980, 14800, 'full length standing mirror', '全身をしっかり映せる大きさ|割れにくい安全設計|壁に立てかけるだけ'],
      ['掛け時計', '🕰️', 1480, 9800, 'wall clock', '見やすい大きな文字盤|静かなスイープ秒針|インテリアになじむデザイン'],
      ['ラグ', '🧶', 2980, 19800, 'living room area rug', '厚みがありふかふかの踏み心地|滑りにくい裏面加工|洗えるタイプも'],
      ['本棚', '📚', 3980, 29800, 'wooden bookshelf', '大量の本もすっきり収納|棚板の高さを変えられる|転倒防止の固定金具付き'],
      ['ベッド', '🛏️', 9800, 79800, 'bed frame with mattress', '寝心地の良いマットレス付き|床下に収納できるスペース|組み立ては工具1つで'],
      ['カーテン', '🪟', 1980, 12800, 'curtains hanging at window', '遮光・遮熱で一年中快適|洗濯機で洗える|豊富なカラーとサイズ'],
    ] },
  { id: 'outdoor', name: 'スポーツ・アウトドア', emoji: '⛺', hue: 150,
    scene: ['週末のアウトドアにも、毎日の運動にも頼れる相棒です。', '屋外でも扱いやすく、丈夫で長持ちするつくりです。', 'はじめての方でも安心して使い始められます。'],
    aspects: [['軽くて持ち運びやすく、使いやすいです', 'もう少し軽いと嬉しいです'], ['作りが丈夫で安心して使えます', '縫い目やつなぎ目が少し気になりました'], ['はじめてでも扱いやすかったです', '使いこなすまで少し時間がかかりました'], ['収納がコンパクトで場所を取りません', '収納時のサイズが思ったより大きいです'], ['雨や汚れにも強く、使い勝手が良いです', '水や汚れが少し染みこみやすいです'], ['デザインがかっこよくて気分が上がります', '色合いが写真と少し違いました']],
    items: [
      ['テント', '⛺', 4980, 39800, 'camping dome tent', '設営が簡単なワンタッチ構造|雨風に強い防水生地|通気性の良いメッシュ窓'],
      ['ヨガマット', '🧘', 1480, 6980, 'yoga mat unrolled flat on a floor', '適度な厚みで膝や腰にやさしい|滑りにくい表面加工|丸めて持ち運べる'],
      ['ランニングシューズ', '👟', 3980, 19800, 'running shoes, plain design with no logo', '軽量で足運びがスムーズ|衝撃をやわらげるクッション|通気性の良いメッシュ'],
      ['クロスバイク', '🚲', 19800, 99800, 'cross bike bicycle', '通勤にも街乗りにも使える軽快な走り|変速機でどんな道もラクに|サドル高さを調整できる'],
      ['寝袋', '🏕️', 2480, 14800, 'sleeping bag', '保温性が高く冬キャンプにも|コンパクトに収納できる|洗濯機で洗える'],
      ['ダンベルセット', '🏋️', 1980, 9800, 'pair of hex dumbbells', '重さを調整して幅広く鍛えられる|滑りにくいグリップ|収納しやすいコンパクトさ'],
      ['サッカーボール', '⚽', 1280, 5980, 'soccer ball with black pentagon panel pattern', '耐久性の高い表面素材|蹴りやすく安定した軌道|5号球（一般用）'],
      ['釣り竿', '🎣', 1980, 19800, 'fishing rod', '軽くて感度の良いカーボン素材|コンパクトに収納できる継ぎ竿|初心者にも扱いやすい'],
      ['ゴーグル', '🥽', 2480, 12800, 'snow ski goggles with a colorful mirrored lens and strap, product only', 'くもり止め加工|UVカットで目を守る|調整しやすいベルト'],
      ['バックパック', '🎒', 2980, 19800, 'hiking backpack', '大容量でも肩にやさしい背負い心地|雨を防ぐレインカバー付き|整理しやすい多ポケット'],
    ] },
  { id: 'beauty', name: 'ビューティー・日用品', emoji: '🧴', hue: 350,
    scene: ['毎日のセルフケアが、ちょっと楽しみな時間になります。', '肌や髪の調子に合わせて、無理なく続けられます。', 'バスルームや洗面台に置くだけで気分が上がります。'],
    aspects: [['香りが上品でリラックスできます', '香りが好みと少し違いました'], ['肌なじみがよくしっとりします', '肌に合わず少しヒリつきました'], ['使い心地がよく毎日続けられます', '効果を実感するまで時間がかかりそうです'], ['容器が使いやすく清潔に保てます', '容器の出口が少し使いにくいです'], ['コスパがよく、リピートしたいです', '量のわりに少し割高に感じました'], ['仕上がりがなめらかで気に入りました', '思ったほど仕上がりが変わりませんでした']],
    items: [
      ['化粧水', '🧴', 980, 6980, 'skincare lotion bottle', 'ぐんぐん染みこむ潤い|敏感肌にもやさしい処方|さっぱり使える'],
      ['美容液', '💧', 1480, 9800, 'serum dropper bottle', 'ハリとツヤを与える|少量でしっかり浸透|毎日のケアにプラス'],
      ['シャンプー', '🧼', 780, 3980, 'shampoo bottle', 'きめ細かな泡でやさしく洗う|さらさらの指通り|詰め替えにも対応'],
      ['電動歯ブラシ', '🪥', 1980, 12800, 'electric toothbrush', '音波振動で歯垢を効率よく除去|2分タイマー付き|充電は約2週間もつ'],
      ['フェイスパック', '🎭', 580, 2980, 'white foil sachet packets, flat lay product shot', 'うるおいをたっぷり与える|忙しい朝のスペシャルケアに|肌になじむ密着シート'],
      ['香水', '🌸', 1980, 14800, 'perfume bottle', '時間とともに変化する香り|普段使いしやすい上品さ|持ち運びしやすいボトル'],
      ['ヘアアイロン', '💇', 2980, 14800, 'ceramic flat iron appliance with two heated plates, device only', '温度調整で髪にやさしい|短時間で温まる|ストレートにもカールにも'],
      ['バスソルト', '🛁', 680, 2980, 'bath salt in a glass jar', '入浴で体の芯まで温まる|やさしい香りで癒やし|肌にやさしい成分'],
      ['タオルセット', '🧺', 1480, 7980, 'folded bath towels set', '吸水性が高くふわふわ|洗濯しても型崩れしにくい|来客用にも使える'],
      ['ティッシュ箱買い', '🧻', 780, 2480, 'tissue box with a tissue sticking out', 'やわらかく肌にやさしい|箱買いでストックできる|鼻をかんでも痛くない'],
    ] },
]

export const CATEGORIES: Category[] = RAW.map(({ id, name, emoji, hue }) => ({ id, name, emoji, hue }))

const ADJ_DESC = {
  P: (m: string, item: string) => `${m}が長年培った技術と素材選びから生まれた${item}。細部の仕上げまで妥協せず、使うたびに質の違いを感じられます。`,
  S: (m: string, item: string) => `${m}が「毎日ちょうどいい」を目指して作った${item}。使いやすさと価格のバランスを大切にしました。`,
  B: (m: string, item: string) => `${m}が「まずは試してみたい」にこたえる${item}。必要な機能をしっかり押さえつつ、手に取りやすい価格にしました。`,
} as const
const CLOSING = {
  P: '長く使える品質を求める方や、大切な人への贈り物にもおすすめです。',
  S: 'はじめての方にも、買い替えの方にも選びやすい一品です。',
  B: 'サブ用や、まず試したい方にもぴったりです。',
} as const

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
const between = (r: number, [a, b]: readonly [number, number]) => a + r * (b - a)

/** カテゴリごとに6社が売る（プレミアム・標準・お手頃が混ざるように、カテゴリに合うメーカーを選んである）。MAKERS の並び順の番号 */
const MAKERS_BY_CATEGORY: Record<string, number[]> = {
  appliance: [0, 1, 2, 3, 4, 5], // ノヴァリス ミライテック ハレノヒ 月見堂 ゼフィラ ぽんぽこ工房
  gadget: [1, 15, 13, 11, 2, 10], // ミライテック クラウドナイン テツノ製作所 オルテンシア ハレノヒ シロクマ堂
  kitchen: [13, 6, 3, 5, 16, 17], // テツノ製作所 アオバ商会 月見堂 ぽんぽこ工房 ハナマル ミナモ
  food: [8, 14, 7, 12, 16, 17], // コトノハ そよかぜ ルミエール・ノア ココロ雑貨店 ハナマル ミナモ
  fashion: [7, 4, 8, 14, 2, 12], // ルミエール・ノア ゼフィラ コトノハ そよかぜ ハレノヒ ココロ雑貨店
  books: [3, 8, 11, 17, 10, 16], // 月見堂 コトノハ オルテンシア ミナモ シロクマ堂 ハナマル
  toys: [12, 5, 15, 9, 1, 13], // ココロ雑貨店 ぽんぽこ工房 クラウドナイン ヤマビコ ミライテック テツノ製作所
  interior: [6, 0, 7, 8, 10, 5], // アオバ商会 ノヴァリス ルミエール・ノア コトノハ シロクマ堂 ぽんぽこ工房
  outdoor: [9, 15, 13, 4, 14, 16], // ヤマビコ クラウドナイン テツノ製作所 ゼフィラ そよかぜ ハナマル
  beauty: [17, 0, 14, 8, 2, 12], // ミナモ ノヴァリス そよかぜ コトノハ ハレノヒ ココロ雑貨店
}
const MAKERS_PER_CAT = 6
const makersOf = (catId: string) => MAKERS_BY_CATEGORY[catId]
const MAKERS_PER_ITEM = 4

function build(): Product[] {
  const out: Product[] = []
  RAW.forEach((cat) => {
    const pool = makersOf(cat.id)
    cat.items.forEach(([item, emoji, lo, hi, , feats], ii) => {
      const f = feats.split('|')
      // 6社のうち、品目ごとに2社を外して4社にする
      const skip = new Set([ii % MAKERS_PER_CAT, (ii + 3) % MAKERS_PER_CAT])
      pool.filter((_, j) => !skip.has(j)).slice(0, MAKERS_PER_ITEM).forEach((makerId) => {
        const id = out.length + 1
        const r = mulberry32(id * 7919 + 13)
        const m = MAKERS[makerId]
        const T = TIER[m.tier]
        const [color] = m.colors[Math.floor(r() * m.colors.length)]
        const word = T.words[Math.floor(r() * T.words.length)]
        const code = `${m.name.charCodeAt(0).toString(36).toUpperCase().slice(-2)}-${1000 + Math.floor(r() * 9000)}`
        const priceYen = priceLike(lo + between(r(), T.pos) * (hi - lo), r())
        const discounted = r() < (m.tier === 'B' ? 0.6 : m.tier === 'S' ? 0.45 : 0.25)
        const scene = cat.scene[Math.floor(r() * cat.scene.length)]
        const w = Math.round(between(r(), [80, 4500]))
        out.push({
          id, item, emoji, color, makerId, tier: m.tier, brand: m.name, category: cat.id, priceYen,
          name: `${m.name} ${word}${item} ${code}`,
          listPriceYen: discounted ? priceLike(priceYen * (1.15 + r() * 0.5), r()) : undefined,
          rating: Math.round(between(r(), T.rating) * 10) / 10,
          reviewCount: Math.floor(10 ** between(r(), T.logRev)),
          stock: r() < 0.15 ? 1 + Math.floor(r() * 5) : 20 + Math.floor(r() * 280),
          express: r() < (m.tier === 'P' ? 0.8 : 0.55),
          bullets: [...f, `メーカー保証${T.warranty}（※すべて架空の商品です）`],
          description: [ADJ_DESC[m.tier](m.name, item), `${f[0]}。${f[1]}。${scene}`, `カラーは${color}。${CLOSING[m.tier]}`],
          specs: [
            ['ブランド', m.name], ['型番', code], ['カラー', color],
            ['サイズ', `W${10 + Math.floor(r() * 50)}×D${10 + Math.floor(r() * 40)}×H${5 + Math.floor(r() * 40)} cm`],
            ['重量', w >= 1000 ? `約${(w / 1000).toFixed(1)}kg` : `約${w}g`],
            ['保証期間', T.warranty], ['原産国', 'ノヴァ共和国（架空）'],
            ['発売日', `${2024 + Math.floor(r() * 3)}年${1 + Math.floor(r() * 12)}月`], ['商品コード', `BG${String(id).padStart(5, '0')}`],
          ],
        })
      })
    })
  })
  return out
}

export const PRODUCTS: Product[] = build()
export const getProduct = (id: number) => PRODUCTS.find((p) => p.id === id)
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id)
export const MAKER_NAMES = MAKERS.map((m) => m.name)
export const SUGGESTIONS = [...new Set(PRODUCTS.map((p) => p.item))]
export const discountPct = (p: Product) => (p.listPriceYen ? Math.round((1 - p.priceYen / p.listPriceYen) * 100) : 0)
// おすすめ順: 評価 × 件数の対数
export const score = (p: Product) => p.rating * Math.log10(p.reviewCount + 10)
/** 同じ品目を売る、ほかのメーカーの商品（価格の安い順） */
export const siblingsOf = (p: Product) => PRODUCTS.filter((x) => x.item === p.item && x.id !== p.id).sort((a, b) => a.priceYen - b.priceYen)
/** そのカテゴリを扱うメーカー名 */
export const makersInCategory = (cat?: string) => [...new Set(PRODUCTS.filter((p) => !cat || p.category === cat).map((p) => p.brand))]
export const reviewAspects = (category: string) => RAW.find((c) => c.id === category)?.aspects ?? []

const PRODUCT_ONLY = new Set(['ゴーグル', 'ヘアアイロン', 'フェイスパック', 'モバイルバッテリー', 'デニムパンツ'])

/** 商品画像の生成用プロンプト（scripts/gen-images.ts から使う）。食品は料理写真、それ以外は商品写真 */
export function imagePrompt(p: Product): { prompt: string; negative: string } {
  const cat = RAW.find((c) => c.id === p.category)!
  const seed = cat.items.find((i) => i[0] === p.item)!
  const m = MAKERS[p.makerId]
  const colorEn = m.colors.find(([jp]) => jp === p.color)?.[1] ?? ''
  const baseNeg = 'text, watermark, logo, letters, brand name, trademark, apple logo, swoosh, emblem, people, woman, man, girl, model, person, portrait, skin, hands, face, blurry, lowres, deformed, cropped, multiple products, dark background'
  if (p.category === 'food') {
    return { prompt: `professional product photo of ${seed[4]}, appetizing, soft studio lighting, clean white background, centered, sharp focus`, negative: `${baseNeg}, plastic, cartoon` }
  }
  return {
    prompt: `product photo of a ${colorEn} ${seed[4]}, ${m.look}, studio lighting, clean white background, centered, sharp focus, commercial photography`,
    // 人物が写りやすい品目は、頭や体まで強く打ち消して「商品だけ」の写真にする
    negative: `${baseNeg}, food, meal, dish${PRODUCT_ONLY.has(p.item) ? ', head, mannequin, hair, wig, swimmer, shirtless, bare chest, torso, body, hand' : ''}`,
  }
}
