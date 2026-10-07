export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** 注文確定の紙吹雪。金額が大きいほど派手になる。動きを減らす設定の端末では何も出さない */
export async function celebrate(totalYen: number) {
  if (reducedMotion()) return
  const { default: confetti } = await import('canvas-confetti') // 注文時だけ読み込む
  const big = totalYen >= 100_000
  const burst = (x: number) => confetti({ particleCount: big ? 120 : 70, spread: 80, startVelocity: 45, origin: { x, y: 0.7 }, zIndex: 9999 })
  burst(0.5)
  if (big) { setTimeout(() => burst(0.2), 250); setTimeout(() => burst(0.8), 450) }
}
