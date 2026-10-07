import { useState } from 'react'

/** 料理・店の写真（AIで生成）。無い・読めない時は、色のグラデーション + 絵文字を出す。kind: f=メニュー r=店 */
export default function FoodPhoto({ kind, id, emoji, hue = 30, className = '' }: { kind: 'f' | 'r'; id: number; emoji: string; hue?: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 80% 92%), hsl(${hue} 70% 80%))` }}
    >
      {failed ? <span className="text-[2.2em]">{emoji}</span> : (
        <img src={`${import.meta.env.BASE_URL}img/${kind}/${id}.webp`} alt="" loading="lazy" className="size-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  )
}
