import { afterEach, expect, test, vi } from 'vitest'

const confetti = vi.fn()
vi.mock('canvas-confetti', () => ({ default: confetti }))

const setReduced = (reduced: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduced && q.includes('prefers-reduced-motion') }))

afterEach(() => {
  confetti.mockClear()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

test('動きを減らす設定では、紙吹雪を一切出さない', async () => {
  setReduced(true)
  const { celebrate } = await import('./celebrate')
  await celebrate(1_000_000)
  expect(confetti).not.toHaveBeenCalled()
})

test('通常は紙吹雪を出す。10万円未満は1回、10万円以上は3回に増える', async () => {
  vi.useFakeTimers()
  setReduced(false)
  const { celebrate } = await import('./celebrate')

  await celebrate(5_000)
  vi.runAllTimers()
  expect(confetti).toHaveBeenCalledTimes(1)

  confetti.mockClear()
  await celebrate(100_000)
  vi.runAllTimers()
  expect(confetti).toHaveBeenCalledTimes(3)
})
