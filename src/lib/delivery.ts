import { deliveryDate } from './date'

export type Speed = 'real' | 'fast' | 'instant'
export const SPEEDS: [Speed, string][] = [
  ['real', '実時間（お届け予定どおり）'],
  ['fast', '早送り（約2分で到着）'],
  ['instant', '一瞬（約10秒で到着）'],
]

export const STAGES = ['注文確定', '発送準備中', '発送済み', '配達中', '配達完了']
export const FOOD_STAGES = ['注文受付', '配達員を探しています', '調理中', '配達員が店へ移動中', '配達中', '到着']
export const FOOD_STAGES_SHORT = ['受付', '配達員探し', '調理中', '店へ移動', '配達中', '到着']
// 注文から完了までを1としたとき、各段階が終わる位置（最後の1は「完了」）
const EDGES = [0.05, 0.3, 0.75, 1]
// 受付 → 配達員探し(約10%) → 調理中 → 店へ移動 → 配達中。配達員が決まるのは 0.14
const FOOD_EDGES = [0.04, 0.14, 0.45, 0.6, 1]

/** 注文時に1度だけ決める「注文から配達完了までの実際にかかる時間(ms)」。以後の状態はこれと注文時刻だけで決まる */
export function playMsFor(speed: Speed, placed: Date, express: boolean): number {
  if (speed === 'fast') return 120_000
  if (speed === 'instant') return 10_000
  const end = deliveryDate(placed, express)
  end.setHours(18, 0, 0, 0) // お届け日の18時に完了
  return Math.max(3_600_000, end.getTime() - placed.getTime())
}

/** デリバリー版: 実時間は店の配達目安（分）の中間 */
export function foodPlayMs(speed: Speed, etaMin: [number, number]): number {
  if (speed === 'fast') return 120_000
  if (speed === 'instant') return 10_000
  return ((etaMin[0] + etaMin[1]) / 2) * 60_000
}

type Timed = { placedAt: string; playMs: number }

function progressOf(order: Timed, now: Date) {
  const elapsed = now.getTime() - new Date(order.placedAt).getTime()
  const progress = Math.min(1, Math.max(0, elapsed / order.playMs))
  return { elapsed, progress, remainingMs: Math.max(0, order.playMs - elapsed) }
}

const stageOf = (progress: number, edges: number[]) => {
  const found = edges.findIndex((e) => progress < e)
  return found === -1 ? edges.length : found
}

/** 配送状況。タイマーも保存もなし。再読み込みしても、時刻が進む方向にしか変わらない */
export function statusAt(order: Timed, now: Date) {
  const { progress, remainingMs } = progressOf(order, now)
  const stage = stageOf(progress, EDGES)
  // 配達中は8軒ぶん回る想定で「あと◯件」を出す
  const leg = stage === 3 ? (progress - 0.75) / 0.25 : 0
  return {
    stage,
    label: STAGES[stage],
    progress,
    done: stage === 4,
    stopsLeft: stage === 3 ? Math.max(1, 8 - Math.floor(leg * 8)) : 0,
    remainingMs,
  }
}

/** デリバリーの状況。地図に配達員を出すのは stage 3（店へ移動）と 4（配達中）。配達員が決まるのは stage 2 から */
export function foodStatusAt(order: Timed, now: Date) {
  const { progress, remainingMs } = progressOf(order, now)
  const stage = stageOf(progress, FOOD_EDGES)
  return { stage, label: FOOD_STAGES[stage], progress, done: stage === 5, searching: stage === 1, courierAssigned: stage >= 2, onMap: stage === 3 || stage === 4, remainingMs }
}
