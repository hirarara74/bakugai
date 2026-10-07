import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Speed } from '../lib/delivery'

// お届け先はダミー。端末の localStorage にだけ保存し、外へは送らない
export type Address = { name: string; zip: string; address: string }
type Profile = { address: Address; setAddress: (a: Partial<Address>) => void; speed: Speed; setSpeed: (s: Speed) => void }

export const useProfile = create<Profile>()(
  persist(
    (set) => ({
      address: { name: '爆買い 太郎', zip: '999-0001', address: 'ノヴァ県 月見市 星ヶ丘 1-2-3' },
      setAddress: (a) => set((s) => ({ address: { ...s.address, ...a } })),
      speed: 'fast',
      setSpeed: (speed) => set({ speed }),
    }),
    { name: 'bakugai:profile:v1', version: 1 },
  ),
)

// 郵便番号 → 住所の架空の対応表（郵便番号から住所を埋める動きの再現用）
export const ZIP_TABLE: Record<string, string> = {
  '999-0001': 'ノヴァ県 月見市 星ヶ丘',
  '999-0002': 'ノヴァ県 月見市 さくら台',
  '888-0010': 'ミライ県 未来市 中央町',
  '777-0123': 'ぽんぽこ県 たぬき市 森の里',
}
