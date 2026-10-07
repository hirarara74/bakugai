import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/celebrate'

/** 値が増えた時、前の値から新しい値まで数字を回す。最初の表示と、動きを減らす設定では回さない。
 *  requestAnimationFrame ではなく経過時間で決める: 裏のタブでも必ず最後は新しい値で止まる */
export function useCountUp(target: number, ms = 900) {
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    if (reducedMotion() || from.current === target) {
      from.current = target
      setValue(target)
      return
    }
    const start = Date.now()
    const a = from.current
    const timer = setInterval(() => {
      const k = Math.min(1, (Date.now() - start) / ms)
      const cur = k >= 1 ? target : Math.round(a + (target - a) * (1 - (1 - k) ** 3))
      from.current = cur
      setValue(cur)
      if (k >= 1) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [target, ms])

  return value
}
