// ローカルの ComfyUI（既定 http://127.0.0.1:8188）に text2img を投げて PNG を受け取る小さなクライアント。
// 商品画像の生成用（開発時だけ使う。アプリ本体には含まれない）。
const BASE = process.env.COMFY_URL ?? 'http://127.0.0.1:8188'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function waitForServer(timeoutMs = 120_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    try {
      if ((await fetch(`${BASE}/system_stats`)).ok) return
    } catch { /* まだ起動中 */ }
    await sleep(1500)
  }
  throw new Error('ComfyUI に接続できません: ' + BASE)
}

function workflow({ ckpt, vae, loras = [], prompt, negative, seed, width, height, steps, cfg, sampler, scheduler, prefix }) {
  const nodes = {
    1: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: ckpt } },
    4: { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
  }
  // VAE が内蔵されていないチェックポイント用に、別ファイルの VAE を指定できる
  if (vae) nodes[8] = { class_type: 'VAELoader', inputs: { vae_name: vae } }
  // LoRA は本体のあとに順番につなぐ: [{ name, strength }]
  let model = ['1', 0]
  let clip = ['1', 1]
  loras.forEach((l, i) => {
    const id = String(20 + i)
    nodes[id] = { class_type: 'LoraLoader', inputs: { model, clip, lora_name: l.name, strength_model: l.strength ?? 0.8, strength_clip: l.strength ?? 0.8 } }
    model = [id, 0]
    clip = [id, 1]
  })
  nodes[2] = { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip } }
  nodes[3] = { class_type: 'CLIPTextEncode', inputs: { text: negative, clip } }
  nodes[5] = { class_type: 'KSampler', inputs: { model, positive: ['2', 0], negative: ['3', 0], latent_image: ['4', 0], seed, steps, cfg, sampler_name: sampler, scheduler, denoise: 1 } }
  nodes[6] = { class_type: 'VAEDecode', inputs: { samples: ['5', 0], vae: vae ? ['8', 0] : ['1', 2] } }
  nodes[7] = { class_type: 'SaveImage', inputs: { images: ['6', 0], filename_prefix: prefix } }
  return nodes
}

/** PNG の Buffer を返す */
export async function generate(opts) {
  const o = { width: 512, height: 512, steps: 22, cfg: 7, sampler: 'dpmpp_2m', scheduler: 'karras', negative: '', prefix: 'bakugai', ...opts }
  const res = await fetch(`${BASE}/prompt`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: workflow(o) }) })
  if (!res.ok) throw new Error(`prompt 失敗 ${res.status}: ${await res.text()}`)
  const { prompt_id } = await res.json()
  for (;;) {
    await sleep(400)
    const h = await (await fetch(`${BASE}/history/${prompt_id}`)).json()
    const e = h[prompt_id]
    if (!e) continue
    if (e.status?.status_str === 'error') throw new Error('生成エラー: ' + JSON.stringify(e.status.messages?.at(-1)))
    const img = e.outputs?.['7']?.images?.[0]
    if (img) {
      const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type })
      return Buffer.from(await (await fetch(`${BASE}/view?${q}`)).arrayBuffer())
    }
  }
}
