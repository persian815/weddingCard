'use client'
import { useState } from 'react'

export default function FloatingActions() {
  const [copied, setCopied] = useState(false)

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: '청첩장', url: window.location.href }).catch(() => {})
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  return (
    <>
      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-white text-xs px-4 py-2 rounded">
          링크가 복사되었습니다
        </div>
      )}
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={share}
          className="w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-sm"
          aria-label="공유"
        >
          ↗
        </button>
        <button
          onClick={scrollTop}
          className="w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-sm"
          aria-label="위로"
        >
          ↑
        </button>
      </div>
    </>
  )
}
