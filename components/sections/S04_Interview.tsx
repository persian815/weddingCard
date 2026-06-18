'use client'
import { useState } from 'react'
import { GROOM, BRIDE } from '@/lib/constants'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S04_Interview() {
  const [open, setOpen] = useState(false)
  const { interview } = useWeddingConfig()

  return (
    <section className="py-16 px-8 text-center">
      <button
        onClick={() => setOpen(true)}
        className="border border-[var(--gold)] text-[var(--gold)] px-6 py-2 text-sm tracking-wider"
      >
        웨딩 인터뷰 보기
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-neutral-300 rounded mx-auto mb-6" />
            <div className="space-y-8 text-left">
              {interview.qa.map(({ q, groomAnswer, brideAnswer }, i) => (
                <div key={i} className="space-y-3">
                  <p className="text-sm font-medium text-neutral-800">Q. {q}</p>
                  <p className="text-xs text-neutral-500">{GROOM}: {groomAnswer || '...'}</p>
                  <p className="text-xs text-neutral-500">{BRIDE}: {brideAnswer || '...'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
