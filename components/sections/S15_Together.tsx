'use client'
import { useEffect, useRef, useState } from 'react'
import { FIRST_MET_DATE } from '@/lib/constants'
import { useScrollVisible } from '@/hooks/useScrollVisible'

function pad(n: number) { return String(n).padStart(2, '0') }

function FlipDigit({ value }: { value: string }) {
  const [key, setKey] = useState(0)
  const prev = useRef(value)

  useEffect(() => {
    if (value !== prev.current) {
      setKey(k => k + 1)
      prev.current = value
    }
  }, [value])

  return (
    <span key={key} className="flip-digit">{value}</span>
  )
}

export default function S15_Together() {
  const [elapsed, setElapsed] = useState(0)
  const { ref } = useScrollVisible<HTMLElement>()

  useEffect(() => {
    const start = new Date(FIRST_MET_DATE).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const days = Math.floor(elapsed / 86400)
  const h = Math.floor((elapsed % 86400) / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  const hh = pad(h)
  const mm = pad(m)
  const ss = pad(s)

  return (
    <section ref={ref} className="py-16 px-8 text-center space-y-4 scroll-fade">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">together</p>
      <p className="text-4xl font-serif text-neutral-800">
        {days.toLocaleString()}<span className="text-lg">일</span>
      </p>
      <p className="text-sm text-neutral-400 tabular-nums">
        <FlipDigit value={hh[0]} />
        <FlipDigit value={hh[1]} />
        {':'}
        <FlipDigit value={mm[0]} />
        <FlipDigit value={mm[1]} />
        {':'}
        <FlipDigit value={ss[0]} />
        <FlipDigit value={ss[1]} />
      </p>
    </section>
  )
}
