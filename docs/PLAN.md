# 爆買いシミュレーター 実装計画

架空の商品を、配送も支払いもなしで「本物そっくりの購入体験」で爆買いできるWebアプリ。
通販モード（Amazon型）とデリバリーモード（フードデリバリー型）の2本立て。

- 作成日: 2026-10-07
- リポジトリ: `hirarara74/bakugai`（private で作成済み）

---

## 0. 守ること（全フェーズ共通）

| ルール | 理由 |
|---|---|
| 支払いは架空通貨「爆買いマネー（残高∞）」のみ。カード番号・口座・パスワードの入力欄は作らない（ダミーでも作らない） | 本物の情報を打ち込ませない。フィッシングと誤判定される主な原因が「ブランド＋ログイン/決済フォーム」なので、それも避けられる |
| 全ページの上部に「これは架空のショップです。請求・配送は一切発生しません」帯を常に出す | 誤解の防止と、Safe Browsing の誤検知対策 |
| 実在ブランドの名前・ロゴ・配色・言い回しは真似しない。体験の「型」だけ借りる | 実在企業になりすましたと見られないため |
| 入力された値（お届け先など）は端末の `localStorage` に置くだけ。外部へは送らない | サーバーがないので、個人情報が外に出る経路を作らない |
| 価格は税込の総額で出す（例: `¥3,980（税込）`） | 日本のECの見た目に合わせる（総額表示義務の型） |
| 時刻と日付はすべて端末の現在時刻から計算する（「明日 10/8(木) お届け」など） | 毎回「いま買った」感覚を出すため |

---

## 1. 技術選定

### 1-1. フロントエンド

| 項目 | 採用 | 選んだ理由 / 比べた候補 |
|---|---|---|
| ビルド | **Vite** | 既存の momotalk-ai と同じ。設定がほぼ要らない |
| UI | **React 19 + TypeScript** | 画面が約20、カート・注文・配達の状態を共有するので、コンポーネントで分けたほうが保守しやすい。最初の案（素のJS）では画面が増えるほど破綻しやすい。Vue でも可（momotalk-ai は Vue 3）だが、ルーティングと地図ライブラリの事例が多い React を選ぶ |
| ルーティング | **React Router（HashRouter）** | GitHub Pages ではサーバー側のリライトができない。`#/` 方式なら 404 対策の小技が要らない |
| スタイル | **Tailwind CSS v4**（`@tailwindcss/vite`） | v4 は設定ファイルなしで `@import "tailwindcss"` だけで動く。配色トークンは `@theme` に集める |
| 状態 | **Zustand + `persist` ミドルウェア** | カート・注文・累計額を `localStorage` へ自動で保存。Redux は過剰 |
| 演出 | **canvas-confetti**（約6KB） | 注文確定の紙吹雪用。自作より短く済む |
| 地図 | **MapLibre GL JS + OpenFreeMap** | APIキー・登録・Cookieが不要で、表示回数の上限もない。配達追跡画面だけで遅延読み込みし、トップの表示速度に影響させない。OSM公式タイルは利用ポリシーが厳しく、試作向き |
| 商品画像 | **絵文字をそのまま表示（当面）。** Windows 11 では立体の Fluent 風で表示される。Mac/スマホでは各OSの絵文字になる。見た目を全端末で揃えるなら、Microsoft Fluent Emoji 3D（MIT）の PNG を `public/` に置き、`ProductImage` だけ差し替える（フェーズ6以降の任意項目） | 立体的で「商品写真っぽい」。MITなので公開しても問題ない。使う約150枚だけ `public/` に置く（CDNには頼らない）。OpenMoji は CC BY-SA で継承義務があるため外した |
| テスト | **Vitest**（金額計算・配達状態の進行だけ） | お金と時間の計算は壊れると全体が嘘になるので、そこだけ自動テストを置く。画面は内蔵ブラウザで手動確認 |

**入れないもの:** UIコンポーネントライブラリ（shadcn など）、バックエンド、DB、認証、画像生成。
→ 共有ランキングなどサーバーが欲しくなったら、Cloudflare Workers + KV を足す（§1-2）。

### 1-2. 公開先

| 候補 | 無料枠 | 評価 |
|---|---|---|
| **GitHub Pages（採用）** | 帯域 100GB/月、サイト容量 1GB、静的ファイルのみ | 追加のアカウントが要らない。GitHub Actions で push のたびに自動デプロイできる。**注意: 無料プランでは public リポジトリが必要** |
| Cloudflare Workers（静的アセット） | 静的ファイルの帯域は無制限 | 予備の公開先。private のまま公開できて、`*.workers.dev` なので github.io と分かれる。Pages は保守のみの扱いになっているので、使うなら Workers にする |
| Vercel Hobby | 100GB | 非商用に限られる。今回は利点が薄い |
| Netlify | 実質 約15GB | 無料枠が最も小さい |
| claude.ai Artifact | — | 自分だけで試すなら最速。複数ファイル・画像150枚の運用には向かない |

**リスクと対策:** Google Safe Browsing は、本物らしいショップを「偽サイト」と誤判定することがある（GitHub Pages 上の学習用ショップが判定された例がある）。
`hirarara74.github.io` が判定されると、同じドメインにある他のプロジェクトも巻き添えになるおそれがある。

- 対策: §0 の帯を出す／決済・ログインフォームを作らない／`<meta name="robots" content="noindex">` で検索エンジンに載せない
- 公開後に Safe Browsing の状態を確認する（§5 フェーズ7）
- 判定されたら、Cloudflare Workers へ移して github.io から切り離す

---

## 2. UI・デザインのリサーチ結果と、反映すること

### 2-1. 通販（Amazon型の体験）
- 商品詳細は **3カラム**（画像ギャラリー｜商品情報｜購入ボックス）。スマホでは縦に並べ、購入ボタンを画面下に固定する
- 購入ボックスに置くもの: 価格、ポイント還元、「**明日 10/8(木) にお届け**（あと 3時間12分 以内のご注文）」、在庫表示（「残り3点 ご注文はお早めに」）、数量、[カートに入れる] [今すぐ買う]
- 評価: 星の平均、★5〜★1 の割合を示す横棒、レビュー本文（テンプレートの組み合わせで生成）
- 「よく一緒に購入されている商品」（3点まとめて買うボタン付き）、「この商品を見た人はこんな商品も見ています」
- 検索: 入力中に候補を出す。結果は並べ替え（おすすめ・価格・評価・新着）と絞り込み（カテゴリ・価格帯・評価・お急ぎ便）

### 2-2. カートとレジ（Baymard の調査から）
- カゴ落ちの主な原因は「あとから出てくる費用」「届く日が分からない」「信用できない」。架空ショップでもリアルさの核になるので、ここを再現する:
  - カートの時点で **送料込みの合計と届く日** を見せる。「あと ¥1,020 で送料無料」のバーも出す
  - レジは **ステップ表示**（お届け先 → 配送方法 → 支払い → 確認）。確認画面では各項目を [変更] で直せる
  - お届け先はダミー住所を最初から入れておく。郵便番号から住所を埋める動きを、架空の表で再現する
  - 配送方法: 通常（無料）／お急ぎ便（¥500）／日時指定（午前中・14-16時・16-18時・18-20時・19-21時）／置き配の場所
- 注文確定 → 注文番号（`503-1234567-1234567` 形式の架空のもの）、確認メール風の画面、紙吹雪

### 2-3. 配送状況（通販）
- 段階: 注文確定 → 発送準備中 → 発送済み → 配達中（「あと3件」）→ 配達完了（置き配の写真風イラスト）
- 時間は **早送り**（設定で 実時間／60倍／一瞬 を選べる）。注文時刻からの経過時間で状態を決め、タイマーは持たない（再読み込みしても正しい状態になる）

### 2-4. デリバリー（フードデリバリー型の体験）
- 店一覧: ジャンルのチップ、各店に「配達 25-35分・配達料 ¥150・★4.6」。上部に住所と「今すぐ／日時指定」
- 店のページ: 人気メニュー、カテゴリへの固定タブ、商品をタップすると下からシートが出る（サイズ・トッピングなどの必須/任意オプション、数量、合計）
- カートは1店舗だけ。別の店の商品を入れようとしたら「カートを空にしますか？」と確認する
- レジ: 配達料・サービス料・少額注文手数料、**チップ**（¥0/¥100/¥200/¥300/その他）、置き配の指示
- 追跡は **5段階のバー**（注文受付 → 調理中 → 配達員が店へ移動 → 配達中 → 到着）。3・4段階目だけ地図に配達員の動きを出す
  - 到着予定の時刻を大きく表示し、配達員カード（架空の名前・車両・評価）を出す
  - 動く経路は、店と自宅の間の格子状の道（L字の折れ線）を補間する。実際の道に沿ったルート検索はしない

### 2-5. 爆買い演出（このサイトの独自要素）
- ヘッダーに **累計購入額** を常に出す。注文確定時に数字が回って増える
- 爆買いランク: ¥10万=常連 → ¥100万=VIP → ¥1,000万=富豪 → ¥1億=石油王 → ¥10億=伝説
- 「カートの中身を全部×10」ボタン、「この店のメニューを全部注文」ボタン
- 実績バッジ（初注文／1回で¥100万以上／24時間で10回注文／全カテゴリ制覇 など）
- 購入統計: カテゴリ別の割合、日別の購入額、これまで買ったものの一覧
- [データをリセット] は確認付き

### 2-6. ブランドと見た目
- 通販: **「BAKUGAI MALL」**、デリバリー: **「BAKUGAI EATS」**（名前は仮。ヘッダーのタブで切り替える）
- 配色は独自のもの: 通販は深い藍＋金のアクセント、デリバリーは若草色。どちらも実在サービスの色とは被らせない
- フォント: Noto Sans JP（Google Fonts）と、数字にはタブラー数字（桁が揃う）
- スマホ優先（幅375pxから）。PCでは最大幅 1280px
- アクセシビリティ: ボタンには日本語の名前を付ける。色だけで状態を伝えない（文字かアイコンを添える）。`prefers-reduced-motion` のときは紙吹雪と数字の回転を止める

---

## 3. データ設計（すべてフロント内）

```ts
// src/data/ … ビルド時に固定。実行時の通信はなし
Product   { id, name, brand(架空), category, priceYen, listPriceYen?, emoji, rating, reviewCount, stock, prime: boolean, specs: Record<string,string> }
Review    // 保存しない。productId をシードにして決まった内容を生成する
Restaurant{ id, name, genre, emoji, rating, etaMin:[min,max], feeYen, lngLat }
MenuItem  { id, restaurantId, name, priceYen, emoji, optionGroups: OptionGroup[] }

// src/store/ … Zustand + persist（localStorage キー: "bakugai:v1"）
Cart      { items: {productId, qty}[] }
FoodCart  { restaurantId, items: {menuItemId, options, qty}[] }
Order     { id, kind: "shop"|"food", lines, subtotal, fees, total, placedAt(ISO), shipping, speedFactor }
Profile   { address(ダミー), totalSpent, badges[] }
```

- 状態は `placedAt` と `speedFactor` から **その都度計算**する（`statusAt(order, now)` という純粋関数）。保存しないので、ずれない
- 商品データは「形容詞 × 素材 × 品名 × 型番」の組み合わせで作り、手で書いた200行のファイルとして固定する（実行時に乱数で作らない＝毎回同じ商品が並ぶ）
- persist の `version` を付けておく。保存形式を変えたら `migrate` で引き継ぐ

---

## 4. ディレクトリ構成

```
bakugai/
├─ index.html
├─ public/emoji/           … Fluent Emoji 3D の PNG（使う分だけ）＋ LICENSE
├─ src/
│  ├─ main.tsx, App.tsx    … ルーティング、架空サイトの帯、ヘッダー
│  ├─ data/                … products.ts, restaurants.ts, reviews.ts
│  ├─ store/               … useShop.ts, useFood.ts, useProfile.ts
│  ├─ lib/                 … money.ts（税込・送料・手数料）, delivery.ts（statusAt）, date.ts
│  ├─ pages/shop/          … Home, Search, Product, Cart, Checkout, OrderDone, Orders, Tracking
│  ├─ pages/food/          … Home, Restaurant, Cart, Checkout, Tracking
│  ├─ pages/                … Stats, Settings
│  └─ components/          … ProductCard, Stars, Stepper, BottomSheet, MapView(遅延読み込み), Confetti
├─ src/lib/*.test.ts       … Vitest（money, delivery）
├─ .github/workflows/deploy.yml
└─ docs/PLAN.md
```

---

## 5. フェーズと完了条件

各フェーズの完了条件は「確かめられる事実」で書く。確認は `npm run dev` ＋ 内蔵ブラウザ（幅375px と 1280px）で行う。

| # | 内容 | 完了条件 |
|---|---|---|
| 1 | 土台: Vite・React・TS・Tailwind・Router、帯とヘッダー、配色トークン | `npm run build` が終了コード0。`#/` と `#/food` が切り替わる。帯が全ページに出る |
| 2 | 通販の閲覧: データ200点、トップ、検索・絞り込み、商品詳細、レビュー | 検索「イヤホン」で結果が出る。並べ替えで順番が変わる。詳細ページに「明日 ◯/◯ お届け」が今日の日付から正しく出る |
| 3 | カート・レジ・注文: `money.ts` とそのテスト、4ステップのレジ、注文完了、注文履歴 | `npm test` が通る（送料無料の境目、お急ぎ便、数量99）。注文して再読み込みしても履歴に残る。カートの合計 = 確認画面の合計 = 履歴の合計 |
| 4 | 配送状況: `statusAt` とそのテスト、早送り設定 | 60倍で注文し、約2分で「配達完了」になる。途中で再読み込みしても段階が戻らない |
| 5 | デリバリー: 店一覧、メニュー、オプションのシート、1店舗ルール、チップ、5段階の追跡と地図 | オプション付きで注文すると、地図上の配達員が店から自宅へ動いて「到着」になる。別の店の商品を入れると確認が出る。地図はトップでは読み込まれない（Network タブで確認） |
| 6 | 爆買い演出: 累計額、ランク、実績、統計、全部×10、リセット | 3回注文すると累計額が合計と一致し、ランクが境目で上がる。`prefers-reduced-motion` で紙吹雪が出ない |
| 7 | 公開: GitHub Actions で Pages へデプロイ、noindex、OGP、Safe Browsing の確認 | Actions が成功し、公開URLがスマホで開ける。Safe Browsing の確認ページで「安全でないコンテンツは見つかりませんでした」と出る |

フェーズ1〜4で通販だけ先に一通り遊べるようにし、5以降を足していく。

---

## 6. 決めておきたいこと（既定で進められます）

| 項目 | 既定 | 別案 |
|---|---|---|
| 公開先 | GitHub Pages（公開時にリポジトリを public にする） | Cloudflare Workers（private のまま公開できる。Cloudflare アカウントが必要） |
| UIの土台 | React | Vue 3（momotalk-ai と揃える） |
| サイト名 | BAKUGAI MALL / BAKUGAI EATS | 自由に |

---

## 参考にした資料
- 公開先の比較: [Top 5 static site hosting 2026](https://guptadeepak.com/tools/top-5-static-site-hosting-jamstack-platforms-2026/) / [Cloudflare: Pages から Workers への移行](https://developers.cloudflare.com/workers/static-assets/migrate-from-pages/) / [Pages vs Workers 2026](https://www.morphllm.com/comparisons/cloudflare-pages-vs-workers)
- 誤検知: [Immich: Google flags as dangerous](https://immich.app/blog/google-flags-immich-as-dangerous) / [学習用ショップの誤判定例](https://forum.infinityfree.com/t/google-safe-browsing-falsely-flagged-my-php-portfolio-website/119560)
- レジのUX: [Baymard: Current state of checkout UX](https://baymard.com/blog/current-state-of-checkout-ux) / [Checkout optimization guide](https://www.techrepublic.com/article/checkout-optimization-guide/)
- 商品ページ: [Amazon の購入ボックスのA/Bテスト](https://goodui.org/leaks/amazon-a-b-tests-wider-buy-boxes-on-their-product-pages/) / [Baymard: Amazon の仕様表](https://baymard.com/ecommerce-design-examples/45-product-spec-sheet/4852-amazon)
- 配達の追跡: [Baymard: Uber Eats の追跡ページ](https://baymard.com/ecommerce-design-examples/63-order-tracking-page/11375-uber-eats) / [UberEats デザイン批評](https://ixd.prattsi.org/2021/02/design-critique-ubereats-ios-app/)
- 地図: [OpenFreeMap](https://openfreemap.org) / [OSM ベクタータイル利用ポリシー](https://operations.osmfoundation.org/policies/vector/)
- 絵文字のライセンス: [Fluent Emoji（MIT）](https://emojifyi.com/glossary/microsoft-fluent-emoji/) / [Emoji set licenses](https://shop.emojipedia.org/pages/licenses)
- 総額表示: [マネーフォワード: 総額表示義務](https://biz.moneyforward.com/invoice/basic/58901/)
- 技術: [React 19 + Vite + Tailwind v4 のセットアップ](https://flyonui.com/blog/install-tailwind-css-in-react-vite/)
