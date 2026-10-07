import { useNow } from '../hooks/useNow'
import { STAGES, statusAt } from '../lib/delivery'
import type { Order } from '../store/useOrders'

const MESSAGES = [
  'ご注文を受け付けました。',
  '商品を梱包しています。',
  '商品を発送しました。配達拠点へ向かっています。',
  '配達員がお届け先へ向かっています。',
  '配達が完了しました。',
]

const fmtRemain = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  if (s < 90) return `あと約${s}秒`
  if (s < 5400) return `あと約${Math.ceil(s / 60)}分`
  if (s < 172800) return `あと約${Math.ceil(s / 3600)}時間`
  return `あと約${Math.ceil(s / 86400)}日`
}

/** 配送状況。保存はせず、注文時刻と playMs から毎秒計算し直すだけ */
export default function Tracking({ order }: { order: Order }) {
  const now = useNow(1000)
  const st = statusAt(order, now)

  return (
    <section aria-labelledby="track-h" className="rounded-lg bg-white p-5">
      <h2 id="track-h" className="text-lg font-black">配送状況</h2>
      <p role="status" className="mt-1 text-sm">
        <b className={st.done ? 'text-green-700' : 'text-mall'} data-testid="status-label">{st.label}</b>
        <span className="ml-2 text-gray-600">{MESSAGES[st.stage]}</span>
      </p>
      {st.stage === 3 && <p className="text-sm font-bold text-mall">お届けまであと {st.stopsLeft} 件です</p>}
      {!st.done && <p className="text-xs text-gray-500">{fmtRemain(st.remainingMs)}で配達完了</p>}

      <div className="mt-4 h-2 overflow-hidden rounded bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(st.progress * 100)} aria-label="配送の進み具合">
        <div className="h-full bg-mall transition-[width] duration-1000 ease-linear" style={{ width: `${st.progress * 100}%` }} />
      </div>

      <ol className="mt-4 grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs">
        {STAGES.map((s, i) => (
          <li key={s} aria-current={i === st.stage ? 'step' : undefined} className="space-y-1">
            <span className={`mx-auto flex size-7 items-center justify-center rounded-full text-sm font-bold ${i < st.stage || st.done ? 'bg-mall text-white' : i === st.stage ? 'bg-gold text-mall-dark ring-2 ring-mall' : 'bg-gray-200 text-gray-500'}`}>
              {i < st.stage || st.done ? '✓' : i + 1}
            </span>
            <span className={i === st.stage ? 'font-bold' : 'text-gray-600'}>{s}</span>
          </li>
        ))}
      </ol>

      {st.done && (
        <p className="mt-4 rounded-md bg-green-50 p-3 text-sm">
          📦 {order.dropoff}にお届けしました。ご利用ありがとうございました（※架空の配達です）。
        </p>
      )}
    </section>
  )
}
