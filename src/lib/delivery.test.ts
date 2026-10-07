import { expect, test } from 'vitest'
import { playMsFor, statusAt } from './delivery'

const placed = new Date(2026, 9, 7, 10, 0, 0)
const order = { placedAt: placed.toISOString(), playMs: 120_000 }
const at = (sec: number) => statusAt(order, new Date(placed.getTime() + sec * 1000))

test('2分かけて 注文確定→発送準備中→発送済み→配達中→配達完了 と進む', () => {
  expect(at(0).label).toBe('注文確定')
  expect(at(5).label).toBe('注文確定') // 5%未満
  expect(at(6).label).toBe('発送準備中') // 5%（6秒）
  expect(at(36).label).toBe('発送済み') // 30%（36秒）
  expect(at(90).label).toBe('配達中') // 75%（90秒）
  expect(at(119).label).toBe('配達中')
  expect(at(120).label).toBe('配達完了')
  expect(at(9999).label).toBe('配達完了') // 完了後は戻らない
})

test('時刻が進むと段階は戻らない（再読み込みしても同じ）', () => {
  let prev = -1
  for (let s = 0; s <= 130; s++) {
    const { stage } = at(s)
    expect(stage).toBeGreaterThanOrEqual(prev)
    prev = stage
  }
})

test('配達中の「あと◯件」は8から1へ減り、0にはならない', () => {
  expect(at(90).stopsLeft).toBe(8)
  expect(at(119).stopsLeft).toBe(1)
  expect(at(10).stopsLeft).toBe(0) // 配達中以外は0
})

test('注文時刻より前（時計のずれ）でも注文確定のまま', () => {
  expect(statusAt(order, new Date(placed.getTime() - 5000)).stage).toBe(0)
})

test('完了までの時間: 早送り2分・一瞬10秒・実時間はお届け日の18時まで', () => {
  expect(playMsFor('fast', placed, true)).toBe(120_000)
  expect(playMsFor('instant', placed, true)).toBe(10_000)
  // 10:00注文のお急ぎ便は 10/8(木) 18:00 に完了 = 32時間
  expect(playMsFor('real', placed, true)).toBe(32 * 3600_000)
})
