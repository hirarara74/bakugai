# bakugai（爆買いシミュレーター）

架空の商品を、本物そっくりの購入体験で爆買いできるWebアプリです。**請求・配送は一切発生しません。**
支払いは架空の電子マネー「爆買いマネー」だけで、カード番号などの入力欄はありません。

**公開ページ: https://hirarara74.github.io/bakugai/**

- 通販モード（BAKUGAI MALL）: 商品200点、検索、カート、4ステップのレジ、注文履歴、配送状況
- デリバリーモード（BAKUGAI EATS）: 12店舗96品、オプション選択、チップ、地図つきの配達追跡
- 爆買い演出: 紙吹雪、累計額のカウントアップ、爆買いランク、実績バッジ、購入統計

データはすべてブラウザの `localStorage` に保存され、外部へは送信されません（地図タイルの取得を除く）。

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm test         # テスト
npm run build    # 本番ビルド（dist/）
```

`main` へのプッシュで、GitHub Actions がテストとビルドを行い GitHub Pages へ自動デプロイします。

## 技術

Vite / React 19 / TypeScript / Tailwind CSS v4 / Zustand / React Router（HashRouter） / MapLibre GL（OpenFreeMap） / canvas-confetti / Vitest

実装計画: [docs/PLAN.md](docs/PLAN.md)

## 注意

- すべて架空のサービスです。実在の企業・ブランド・店舗とは関係ありません。
- 地図は実在の街のものですが、店と家は架空の位置に置いています。出典: OpenFreeMap / OpenStreetMap contributors
