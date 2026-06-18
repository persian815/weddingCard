'use client'
import { useState, useEffect } from 'react'

export default function S08_Gallery() {
  const [images, setImages] = useState<string[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data?.gallery)) setImages(data.gallery) })
      .catch(() => {})
  }, [])

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
          <button key={i} onClick={() => setSelected(i)} className="aspect-square overflow-hidden">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <img src={images[selected]} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </section>
  )
}
