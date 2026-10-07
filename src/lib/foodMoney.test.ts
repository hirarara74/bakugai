import { expect, test } from 'vitest'
import { MENU, RESTAURANTS, menuOf } from '../data/food'
import { defaultOptionIds, foodTotals, optionNames, optionsExtra, selectionValid, unitPrice } from './foodMoney'

const ramen = MENU.find((m) => m.name === '星空しょうゆラーメン')!

test('メニューは12店・96品、IDは店番号×100+連番で重複しない', () => {
  expect(RESTAURANTS).toHaveLength(12)
  expect(MENU).toHaveLength(96)
  expect(new Set(MENU.map((m) => m.id)).size).toBe(96)
  expect(menuOf(1).map((m) => m.id)).toEqual([101, 102, 103, 104, 105, 106, 107, 108])
})

test('オプション料金: 大盛(+150) + 味玉(+100) + チャーシュー(+250)', () => {
  const ids = ['size1', 'top0', 'top1']
  expect(optionsExtra(ramen, ids)).toBe(500)
  expect(unitPrice(ramen, ids)).toBe(880 + 500)
  expect(optionNames(ramen, ids)).toEqual(['大盛', '味玉', 'チャーシュー'])
})

test('必須（サイズ）を選ばないと注文できない。トッピングは3つまで', () => {
  expect(selectionValid(ramen, [])).toBe(false)
  expect(selectionValid(ramen, ['size0'])).toBe(true)
  expect(selectionValid(ramen, ['size0', 'top0', 'top1', 'top2'])).toBe(true)
  expect(selectionValid(ramen, ['size0', 'top0', 'top1', 'top2', 'top3'])).toBe(false)
  expect(selectionValid(ramen, ['size0', 'size1'])).toBe(false) // サイズは1つだけ
})

test('合計 = 小計 + 配達料 + サービス料(10%) + 少額手数料 + チップ', () => {
  expect(foodTotals(2000, 150, 100)).toMatchObject({ delivery: 150, service: 200, small: 0, tip: 100, fees: 350, total: 2450 })
})

test('1,000円未満は不足分が少額注文手数料になる。空のカートは0円', () => {
  expect(foodTotals(700, 0, 0)).toMatchObject({ service: 70, small: 300, total: 1070 })
  expect(foodTotals(1000, 0, 0).small).toBe(0)
  expect(foodTotals(0, 250, 300).total).toBe(0)
})

test('defaultOptionIds: 必須グループの先頭だけが選ばれ、任意は選ばれない', () => {
  expect(defaultOptionIds(ramen)).toEqual(['size0'])
  expect(selectionValid(ramen, defaultOptionIds(ramen))).toBe(true)
  expect(MENU.every((m) => selectionValid(m, defaultOptionIds(m)))).toBe(true) // 全メニューがそのまま注文できる
})
