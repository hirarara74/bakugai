// 商品・メニュー・店の画像を、ローカルの ComfyUI（Stable Diffusion）で作って public/img/ に webp で保存する。
//   npx tsx scripts/gen-images.ts                 … まだ無い画像だけ作る（途中で止めても続きから）
//   npx tsx scripts/gen-images.ts --only p:12,f:101   … 指定した画像だけ作り直す（p=商品 f=メニュー r=店）
//   npx tsx scripts/gen-images.ts --item 電気毛布,ヨガマット --force --bump 3   … 品目を指定して作り直す（商品のみ）
//   npx tsx scripts/gen-images.ts --kind f        … メニューだけ
//   npx tsx scripts/gen-images.ts --force --bump 1    … 全部作り直す（--bump で別の乱数に）
// 事前に ComfyUI を起動しておく（既定 http://127.0.0.1:8188、COMFY_URL で変更）。
import { existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { MENU, RESTAURANTS } from '../src/data/food'
import { PRODUCTS, imagePrompt } from '../src/data/products'
import { generate, waitForServer } from './comfy.mjs'
import { GENRE_EN, MENU_EN } from './food-prompts'

const CKPT = 'epicrealism_naturalSinRC1VAE.safetensors'
const LORA_PRODUCT = { name: 'eddiemauroLora2_Realistic.safetensors', strength: 0.7 } // 商品写真（トリガー: emauromin style）
const LORA_FOOD = { name: 'Yummy2.safetensors', strength: 0.6 } // 料理写真（トリガー: Yummy）
const NEG_FOOD = 'text, watermark, logo, letters, brand name, people, hands, face, blurry, lowres, deformed, cropped, plastic, cartoon, dark background, multiple dishes'

type Job = { kind: 'p' | 'f' | 'r'; id: number; item?: string; prompt: string; negative: string; loras: { name: string; strength: number }[] }

const jobs: Job[] = [
  ...PRODUCTS.map((p): Job => {
    const { prompt, negative } = imagePrompt(p)
    return p.category === 'food'
      ? { kind: 'p', id: p.id, item: p.item, prompt: `Yummy, ${prompt}`, negative, loras: [LORA_FOOD] }
      : { kind: 'p', id: p.id, item: p.item, prompt: `emauromin style, ${prompt}`, negative, loras: [LORA_PRODUCT] }
  }),
  ...MENU.map((m): Job => ({
    kind: 'f', id: m.id, loras: [LORA_FOOD], negative: NEG_FOOD,
    prompt: `Yummy, professional food photo of ${MENU_EN[m.name]}, served on tableware, appetizing, soft studio light, clean white background, centered, sharp focus`,
  })),
  ...RESTAURANTS.map((r): Job => ({
    kind: 'r', id: r.id, loras: [LORA_FOOD], negative: NEG_FOOD,
    prompt: `Yummy, top view of a table with assorted ${GENRE_EN[r.genre]}, food photography, natural light, sharp focus`,
  })),
]

const arg = (name: string) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined }
const force = process.argv.includes('--force')
const bump = Number(arg('--bump') ?? 0)
const only = arg('--only')?.split(',')
const kind = arg('--kind')
const items = arg('--item')?.split(',')

const path = (j: Job) => `public/img/${j.kind}/${j.id}.webp`
const todo = jobs.filter((j) => (only ? only.includes(`${j.kind}:${j.id}`) : true) && (!kind || j.kind === kind) && (!items || (j.item !== undefined && items.includes(j.item))) && (force || only || !existsSync(path(j))))

console.log(`生成する画像: ${todo.length} 枚（全 ${jobs.length} 枚中）`)
await waitForServer()
for (const k of ['p', 'f', 'r']) mkdirSync(`public/img/${k}`, { recursive: true })

const t0 = Date.now()
let ok = 0
const failed: string[] = []
for (const [n, j] of todo.entries()) {
  try {
    const png = await generate({
      ckpt: CKPT, loras: j.loras, prompt: j.prompt, negative: j.negative, steps: 24, cfg: 7,
      seed: (j.id * 7919 + 13 + bump * 100003) % 2147483647,
    })
    await sharp(png).resize(400, 400, { fit: 'cover' }).webp({ quality: 80 }).toFile(path(j))
    ok++
  } catch (e) {
    failed.push(`${j.kind}:${j.id}`)
    console.error(`失敗 ${j.kind}:${j.id}`, String(e).slice(0, 200))
  }
  if ((n + 1) % 25 === 0 || n === todo.length - 1) {
    const per = (Date.now() - t0) / (n + 1) / 1000
    console.log(`${n + 1}/${todo.length}  ${per.toFixed(1)}秒/枚  残り約${Math.round((per * (todo.length - n - 1)) / 60)}分`)
  }
}
console.log(`完了: 成功 ${ok} / 失敗 ${failed.length}${failed.length ? '  → ' + failed.join(',') : ''}`)
