'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S08_Gallery() {
  const { gallery: images } = useWeddingConfig()
  const [selected, setSelected] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const prev = useCallback(() => {
    setSelected(s => (s !== null && s > 0 ? s - 1 : s))
  }, [])

  const next = useCallback(() => {
    setSelected(s => (s !== null && s < images.length - 1 ? s + 1 : s))
  }, [images.length])

  useEffect(() => {
    if (selected === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, prev, next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) next()
    else if (diff < -50) prev()
    touchStartX.current = null
  }

  if (images.length === 0) {
    return (
      <section className="py-16 px-8 text-center">
        <p className="text-sm tracking-widest text-[var(--gold)] uppercase mb-6">gallery</p>
        <p className="text-xs text-neutral-400">관리자 설정에서 갤러리 이미지를 등록하세요</p>
      </section>
    )
  }

  return (
    <section className="py-16 px-8">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center mb-6">gallery</p>
      <div className="grid grid-cols-3 gap-1">
        {images.map((src, i) => (
          <button key={src} onClick={() => setSelected(i)} className="aspect-square overflow-hidden">
            <img src={src} alt={`갤러리 ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setSelected(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[selected]}
            alt={`갤러리 ${selected + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          {selected > 0 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl leading-none px-3 py-2 bg-black/40 rounded-full select-none"
              aria-label="이전"
            >
              ‹
            </button>
          )}
          {selected < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl leading-none px-3 py-2 bg-black/40 rounded-full select-none"
              aria-label="다음"
            >
              ›
            </button>
          )}
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white text-xl bg-black/40 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="닫기"
          >
            ✕
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs opacity-60">
            {selected + 1} / {images.length}
          </p>
        </div>
      )}
    </section>
  )
}
