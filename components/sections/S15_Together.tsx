'use client'
import { useEffect, useState } from 'react'
import { FIRST_MET_DATE } from '@/lib/constants'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function S15_Together() {
  const [elapsed, setElapsed] = useState(0)

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

  return (
    <section className="py-16 px-8 text-center space-y-4">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">together</p>
      <p className="text-4xl font-serif text-neutral-800">{days.toLocaleString()}<span className="text-lg">일</span></p>
      <p className="text-sm text-neutral-400">{pad(h)}:{pad(m)}:{pad(s)}</p>
    </section>
  )
}
