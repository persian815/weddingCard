'use client'
import { useEffect, useState } from 'react'
import { WEDDING_DATE } from '@/lib/constants'

export default function S06_DDay() {
  const [dday, setDday] = useState<number | null>(null)

  useEffect(() => {
    const target = new Date(WEDDING_DATE)
    target.setHours(0, 0, 0, 0)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    setDday(Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }, [])

  return (
    <section className="py-16 px-8 text-center space-y-4 bg-neutral-50">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">d-day</p>
      <p className="text-5xl font-serif text-neutral-800">
        {dday === null ? '...' : dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day' : `D+${Math.abs(dday)}`}
      </p>
    </section>
  )
}
