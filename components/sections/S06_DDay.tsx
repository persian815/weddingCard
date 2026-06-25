'use client'
import { useEffect, useRef, useState } from 'react'
import { WEDDING_DATE } from '@/lib/constants'

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export default function S06_DDay() {
  const [dday, setDday] = useState<number | null>(null)
  const [displayed, setDisplayed] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const target = new Date(WEDDING_DATE)
    target.setHours(0, 0, 0, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    setDday(Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }, [])

  useEffect(() => {
    if (dday === null) return
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true
          el.classList.add('visible')
          const finalVal = Math.abs(dday)
          const duration = 900
          const start = performance.now()
          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            setDisplayed(Math.round(easeOut(progress) * finalVal))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [dday])

  const label = dday === null
    ? '...'
    : dday > 0
      ? `D-${displayed}`
      : dday === 0
        ? 'D-Day'
        : `D+${displayed}`

  return (
    <section ref={sectionRef} className="py-16 px-8 text-center space-y-4 bg-neutral-50 scroll-fade">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">d-day</p>
      <p className="text-5xl font-serif text-neutral-800">{label}</p>
    </section>
  )
}
