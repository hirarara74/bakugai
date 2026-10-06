import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// localStorage キー "bakugai:v1"。保存形式を変えたら version を上げて migrate を書く
type Profile = { totalSpent: number }

export const useProfile = create<Profile>()(
  persist(() => ({ totalSpent: 0 }), { name: 'bakugai:v1', version: 1 }),
)
