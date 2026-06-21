'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'
import type { WeddingConfig } from '@/lib/wedding-config'

type StoryItem = WeddingConfig['ourStory'][0]

function StoryItemCard({
  item,
  index,
  onClick,
}: {
  item: StoryItem
  index: number
  onClick: () => void
}) {
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
      onClick={onClick}
      className={`flex items-center gap-4 opacity-0 translate-y-4 transition-all duration-700 cursor-pointer ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className="w-24 h-24 bg-neutral-200 flex-shrink-0 rounded overflow-hidden">
        {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
      </div>
      <div className={`flex-1 ${isLeft ? 'text-left' : 'text-right'}`}>
        <p className="text-xs text-[var(--gold)]">{item.date}</p>
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
      </div>
    </div>
  )
}

function StoryLightbox({
  items,
  selected,
  onClose,
  onSelect,
}: {
  items: StoryItem[]
  selected: number
  onClose: () => void
  onSelect: (i: number) => void
}) {
  const item = items[selected]
  const touchStartX = useRef<number | null>(null)

  const prev = useCallback(() => {
    onSelect((selected - 1 + items.length) % items.length)
  }, [selected, items.length, onSelect])

  const next = useCallback(() => {
    onSelect((selected + 1) % items.length)
  }, [selected, items.length, onSelect])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl leading-none p-2"
      >
        ✕
      </button>
      <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
        {selected + 1} / {items.length}
      </p>

      <div className="w-full max-w-sm px-6 flex flex-col items-center gap-4">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full max-h-64 object-contain rounded"
          />
        ) : (
          <div className="w-full h-48 bg-neutral-800 rounded flex items-center justify-center">
            <span className="text-neutral-500 text-sm">사진 없음</span>
          </div>
        )}

        <div className="text-center space-y-1">
          <p className="text-xs text-[var(--gold)]">{item.date}</p>
          <p className="text-base font-medium text-white">{item.title}</p>
          {item.description && (
            <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
          )}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl p-2"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl p-2"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

export default function S07_OurStory() {
  const { ourStory } = useWeddingConfig()
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <section className="py-16 px-8 space-y-6">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center">our story</p>
      {ourStory.length === 0
        ? <p className="text-center text-xs text-neutral-400">설정 페이지에서 우리 이야기를 입력해주세요</p>
        : ourStory.map((item, i) => (
            <StoryItemCard key={i} item={item} index={i} onClick={() => setSelected(i)} />
          ))
      }
      {selected !== null && (
        <StoryLightbox
          items={ourStory}
          selected={selected}
          onClose={() => setSelected(null)}
          onSelect={setSelected}
        />
      )}
    </section>
  )
}
