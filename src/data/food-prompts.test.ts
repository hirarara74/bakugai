import { expect, test } from 'vitest'
import { GENRES, MENU } from './food'
import { GENRE_EN, MENU_EN } from '../../scripts/food-prompts'

test('全メニュー96品とジャンル12種に、画像生成用の英語がある（余計なキーも無い）', () => {
  expect(MENU.filter((m) => !MENU_EN[m.name]).map((m) => m.name)).toEqual([])
  expect(GENRES.filter((g) => !GENRE_EN[g])).toEqual([])
  const names = new Set(MENU.map((m) => m.name))
  expect(Object.keys(MENU_EN).filter((k) => !names.has(k))).toEqual([])
  expect(Object.keys(GENRE_EN).filter((k) => !GENRES.includes(k))).toEqual([])
})
