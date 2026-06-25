'use client'
import { useScrollVisible } from '@/hooks/useScrollVisible'

export default function S09_GuestSnap() {
  const { ref } = useScrollVisible<HTMLElement>()
  return (
    <section ref={ref} className="py-16 px-8 text-center space-y-4 bg-neutral-50 scroll-fade">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">guest snap</p>
      <p className="text-xs text-neutral-500">결혼식 당일, 소중한 순간을 함께 담아주세요</p>
      <a
        href="/guest-snap"
        className="inline-block border border-[var(--gold)] text-[var(--gold)] px-6 py-2 text-sm tracking-wider"
      >
        사진 올리기
      </a>
    </section>
  )
}
