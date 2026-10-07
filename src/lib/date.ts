const WEEK = '日月火水木金土'
const CUTOFF_HOUR = 15

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000)

/** 「明日 10/8(木)」のように、今日からの近さ + 日付で表す */
export function dateLabel(target: Date, now: Date): string {
  const md = `${target.getMonth() + 1}/${target.getDate()}(${WEEK[target.getDay()]})`
  const rel = ['今日', '明日', '明後日'][dayDiff(target, now)]
  return rel ? `${rel} ${md}` : md
}

/** 15時までの注文を受け付け、お急ぎ便は翌日、通常は3日後に届く（架空ルール）。ページを開いた時刻から毎回計算する */
export function deliveryInfo(now: Date, express: boolean) {
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), CUTOFF_HOUR)
  if (now >= cutoff) cutoff.setDate(cutoff.getDate() + 1)
  const delivery = new Date(cutoff)
  delivery.setDate(delivery.getDate() + (express ? 1 : 3))
  const mins = Math.floor((cutoff.getTime() - now.getTime()) / 60000)
  return { label: dateLabel(delivery, now), hours: Math.floor(mins / 60), minutes: mins % 60 }
}
