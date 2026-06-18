'use client'
import { useRef, useEffect } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'
import type { WeddingConfig } from '@/lib/wedding-config'

function StoryItem({ item, index }: { item: WeddingConfig['ourStory'][0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('opacity-100', 'translate-y-0') },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isLeft = index % 2 === 0
  return (
    <div
      ref={ref}
      className={`flex items-center gap-4 opacity-0 translate-y-4 transition-all duration-700 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className="w-24 h-24 bg-neutral-200 flex-shrink-0 rounded">
        {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />}
      </div>
      <div className={`flex-1 ${isLeft ? 'text-left' : 'text-right'}`}>
        <p className="text-xs text-[var(--gold)]">{item.date}</p>
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
      </div>
    </div>
  )
}

export default function S07_OurStory() {
  const { ourStory } = useWeddingConfig()
  return (
    <section className="py-16 px-8 space-y-6">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center">our story</p>
      {ourStory.length === 0
        ? <p className="text-center text-xs text-neutral-400">설정 페이지에서 우리 이야기를 입력해주세요</p>
        : ourStory.map((item, i) => <StoryItem key={i} item={item} index={i} />)
      }
    </section>
  )
}
