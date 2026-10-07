export type LngLat = [number, number]

/** 店 → 角 → 家 の「道路っぽい」折れ線。実際の道には沿わない（ルート検索はしない） */
export function routeOf(rest: LngLat, home: LngLat): LngLat[] {
  return [rest, [home[0], rest[1]], home]
}

const dist = (a: LngLat, b: LngLat) => Math.hypot(a[0] - b[0], a[1] - b[1])
const lerp = (a: LngLat, b: LngLat, t: number): LngLat => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** 折れ線の上を、全長の t (0〜1) だけ進んだ位置 */
export function along(path: LngLat[], t: number): LngLat {
  const lens = path.slice(1).map((p, i) => dist(path[i], p))
  let left = Math.min(1, Math.max(0, t)) * lens.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lens.length; i++) {
    if (left <= lens[i] || i === lens.length - 1) return lens[i] === 0 ? path[i + 1] : lerp(path[i], path[i + 1], Math.min(1, left / lens[i]))
    left -= lens[i]
  }
  return path[path.length - 1]
}

/** 配達員のスタート地点（店から少し離れた所） */
export const courierStart = (rest: LngLat): LngLat => [rest[0] - 0.006, rest[1] - 0.004]

/** 進み具合 p(0〜1) の配達員の位置。0.45〜0.6 は店へ、0.6〜1 は家へ（フードの段階の境目に合わせる） */
export function courierAt(p: number, rest: LngLat, home: LngLat): LngLat {
  if (p < 0.45) return courierStart(rest)
  if (p < 0.6) return lerp(courierStart(rest), rest, (p - 0.45) / 0.15)
  return along(routeOf(rest, home), (p - 0.6) / 0.4)
}
