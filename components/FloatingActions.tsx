'use client'

export default function FloatingActions() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: '청첩장', url: window.location.href }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다')
    }
  }

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-2">
      <a
        href="/admin"
        className="w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-sm text-neutral-500"
        aria-label="설정"
      >
        ⚙
      </a>
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
  )
}
