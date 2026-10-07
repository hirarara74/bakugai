import { deliveryDate } from './date'

export type Speed = 'real' | 'fast' | 'instant'
export const SPEEDS: [Speed, string][] = [
  ['real', '実時間（お届け予定日どおり）'],
  ['fast', '早送り（約2分で到着）'],
  ['instant', '一瞬（約10秒で到着）'],
]

export const STAGES = ['注文確定', '発送準備中', '発送済み', '配達中', '配達完了']
// 注文から配達完了までを1としたとき、各段階が終わる位置（最後の1は「完了」）
const EDGES = [0.05, 0.3, 0.75, 1]

/** 注文時に1度だけ決める「注文から配達完了までの実際にかかる時間(ms)」。以後の状態はこれと注文時刻だけで決まる */
export function playMsFor(speed: Speed, placed: Date, express: boolean): number {
  if (speed === 'fast') return 120_000
  if (speed === 'instant') return 10_000
  const end = deliveryDate(placed, express)
  end.setHours(18, 0, 0, 0) // お届け日の18時に完了
  return Math.max(3_600_000, end.getTime() - placed.getTime())
}

/** 配送状況。タイマーも保存もなし。再読み込みしても、時刻が進む方向にしか変わらない */
export function statusAt(order: { placedAt: string; playMs: number }, now: Date) {
  const elapsed = now.getTime() - new Date(order.placedAt).getTime()
  const progress = Math.min(1, Math.max(0, elapsed / order.playMs))
  const found = EDGES.findIndex((e) => progress < e)
  const stage = found === -1 ? 4 : found
  // 配達中は8軒ぶん回る想定で「あと◯件」を出す
  const leg = stage === 3 ? (progress - 0.75) / 0.25 : 0
  return {
    stage,
    label: STAGES[stage],
    progress,
    done: stage === 4,
    stopsLeft: stage === 3 ? Math.max(1, 8 - Math.floor(leg * 8)) : 0,
    remainingMs: Math.max(0, order.playMs - elapsed),
  }
}
