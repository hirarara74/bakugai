import { expect, test } from 'vitest'
import { along, courierAt, courierStart, routeOf, type LngLat } from './courier'
import { foodStatusAt } from './delivery'

const rest: LngLat = [0, 0]
const home: LngLat = [4, 3]

test('道は 店 → 角 → 家 のL字になる', () => {
  expect(routeOf(rest, home)).toEqual([[0, 0], [4, 0], [4, 3]])
})

test('折れ線の上を長さに比例して進む（全長7のうち 4/7 で角、1で家）', () => {
  const path = routeOf(rest, home)
  expect(along(path, 0)).toEqual([0, 0])
  expect(along(path, 4 / 7)[0]).toBeCloseTo(4)
  expect(along(path, 4 / 7)[1]).toBeCloseTo(0)
  expect(along(path, 1)).toEqual([4, 3])
  expect(along(path, 2)).toEqual([4, 3]) // はみ出しても家で止まる
})

test('配達員: 調理中は店の外、0.6で店、1で家に着く', () => {
  expect(courierAt(0.2, rest, home)).toEqual(courierStart(rest))
  expect(courierAt(0.6, rest, home)).toEqual([0, 0])
  expect(courierAt(1, rest, home)).toEqual([4, 3])
})

test('家に近づくほど、家までの距離が単調に縮む', () => {
  let prev = Infinity
  for (let p = 0.6; p <= 1.0001; p += 0.02) {
    const [x, y] = courierAt(p, rest, home)
    const d = Math.abs(4 - x) + Math.abs(3 - y)
    expect(d).toBeLessThanOrEqual(prev + 1e-9)
    prev = d
  }
})

test('デリバリーの段階: 受付→配達員探し→調理中→店へ移動→配達中→到着', () => {
  const placed = new Date(2026, 9, 7, 12, 0, 0)
  const order = { placedAt: placed.toISOString(), playMs: 100_000 }
  const at = (sec: number) => foodStatusAt(order, new Date(placed.getTime() + sec * 1000))
  const secs = [0, 4, 10, 14, 45, 60, 100]
  expect(secs.map((s) => at(s).label)).toEqual(['注文受付', '配達員を探しています', '配達員を探しています', '調理中', '配達員が店へ移動中', '配達中', '到着'])
})

test('配達員を探している間は担当が決まっておらず、地図には出ない。決まるのは調理の開始から。地図は店へ移動と配達中だけ', () => {
  const placed = new Date(2026, 9, 7, 12, 0, 0)
  const order = { placedAt: placed.toISOString(), playMs: 100_000 }
  const at = (sec: number) => foodStatusAt(order, new Date(placed.getTime() + sec * 1000))
  const secs = [0, 8, 14, 45, 60, 100]
  expect(secs.map((s) => at(s).searching)).toEqual([false, true, false, false, false, false])
  expect(secs.map((s) => at(s).courierAssigned)).toEqual([false, false, true, true, true, true])
  expect(secs.map((s) => at(s).onMap)).toEqual([false, false, false, true, true, false])
  expect(at(100).done).toBe(true)
})
