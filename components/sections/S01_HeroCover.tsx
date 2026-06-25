'use client'
import { useEffect, useRef, useState } from 'react'
import { GROOM, BRIDE, WEDDING_DATE } from '@/lib/constants'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S01_HeroCover() {
  const { coverImage } = useWeddingConfig()
  const date = new Date(WEDDING_DATE)
  const formatted = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  const [offset, setOffset] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const scrollY = window.scrollY
      setOffset(scrollY * 0.35)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900">
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover opacity-70"
            style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}
          />
        )}
      </div>
      <div className="relative z-10 text-center text-white space-y-4">
        <p
          className="text-sm tracking-widest uppercase opacity-70 hero-enter"
          style={{ animationDelay: '200ms' }}
        >
          our wedding day
        </p>
        <h1
          className="text-4xl font-serif hero-enter"
          style={{ animationDelay: '550ms' }}
        >
          {GROOM} & {BRIDE}
        </h1>
        <p
          className="text-lg tracking-wider hero-enter"
          style={{ animationDelay: '900ms' }}
        >
          {formatted}
        </p>
      </div>
    </section>
  )
}
