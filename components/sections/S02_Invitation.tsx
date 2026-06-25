'use client'
import { useEffect, useRef, useState } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S02_Invitation() {
  const { invitation } = useWeddingConfig()
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const lines = invitation ? invitation.split('\n') : []

  return (
    <section ref={ref} className="py-20 px-8 text-center space-y-6">
      <p
        className={`text-sm tracking-widest text-[var(--gold)] uppercase scroll-fade ${visible ? 'visible' : ''}`}
      >
        invitation
      </p>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`text-neutral-700 leading-relaxed text-sm scroll-fade ${visible ? 'visible' : ''}`}
            style={{ transitionDelay: `${80 + i * 70}ms` }}
          >
            {line || ' '}
          </p>
        ))}
      </div>
    </section>
  )
}
