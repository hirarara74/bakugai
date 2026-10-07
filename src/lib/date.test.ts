import { expect, test } from 'vitest'
import { deliveryInfo } from './date'

test('15時前のお急ぎ便は明日、残り時間は15時まで', () => {
  const d = deliveryInfo(new Date(2026, 9, 7, 10, 0), true) // 2026-10-07(水) 10:00
  expect(d).toEqual({ label: '明日 10/8(木)', hours: 5, minutes: 0 })
})

test('15時を過ぎると締切が翌日に回り、お急ぎ便は明後日になる', () => {
  const d = deliveryInfo(new Date(2026, 9, 7, 16, 0), true)
  expect(d).toEqual({ label: '明後日 10/9(金)', hours: 23, minutes: 0 })
})

test('通常便は3日後（相対表現なしで日付だけ）。月またぎも正しい', () => {
  expect(deliveryInfo(new Date(2026, 9, 7, 10, 0), false).label).toBe('10/10(土)')
  expect(deliveryInfo(new Date(2026, 9, 30, 10, 0), false).label).toBe('11/2(月)')
})
