import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiOverlay({ trigger = true, intensity = 'medium' }) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!trigger || firedRef.current) return
    firedRef.current = true

    const configs = {
      light: { particleCount: 60, spread: 60 },
      medium: { particleCount: 120, spread: 80 },
      heavy: { particleCount: 200, spread: 100 },
    }
    const cfg = configs[intensity] ?? configs.medium

    confetti({
      particleCount: cfg.particleCount,
      spread: cfg.spread,
      origin: { y: 0.5 },
      colors: ['#7C3AED', '#0D9488', '#F59E0B', '#EC4899', '#38BDF8'],
    })

    setTimeout(() => {
      confetti({
        particleCount: cfg.particleCount / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
      })
      confetti({
        particleCount: cfg.particleCount / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
      })
    }, 400)
  }, [trigger, intensity])

  return null
}
