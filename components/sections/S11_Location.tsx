'use client'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S11_Location() {
  const { venue } = useWeddingConfig()
  const encodedAddress = encodeURIComponent(venue.address || venue.name || '')

  const handleTmap = () => {
    const deeplink = `tmap://search?searchKeyword=${encodedAddress}`
    const fallback = `https://tmap.life/search?q=${encodedAddress}`
    // 딥링크 시도 후 일정 시간 내 앱 전환 안 되면 fallback
    window.location.href = deeplink
    setTimeout(() => {
      window.open(fallback, '_blank')
    }, 1500)
  }

  return (
    <section className="py-16 px-8 space-y-4">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center">location</p>

      {encodedAddress ? (
        <iframe
          src={`https://maps.google.com/maps?q=${encodedAddress}&z=16&output=embed&hl=ko`}
          width="100%"
          height="280"
          className="border-0"
          loading="lazy"
          title="venue map"
        />
      ) : (
        <div className="h-[280px] bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
          설정 페이지에서 예식장 주소를 입력해주세요
        </div>
      )}

      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{venue.name || '예식장명'}</p>
        <p className="text-xs text-neutral-400">{venue.address}</p>
        {venue.time && <p className="text-xs text-neutral-500">{venue.time}</p>}
      </div>

      {encodedAddress && (
        <div className="flex gap-2 justify-center pt-1">
          <button
            onClick={handleTmap}
            className="text-xs border border-neutral-200 px-4 py-2 text-neutral-600 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            T맵
          </button>
          <a
            href={`https://map.kakao.com/link/search/${encodedAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs border border-neutral-200 px-4 py-2 text-neutral-600 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            카카오 지도
          </a>
          {venue.naverPlaceId && (
            <a
              href={`https://map.naver.com/p/entry/place/${venue.naverPlaceId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs border border-neutral-200 px-4 py-2 text-neutral-600 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              네이버 지도
            </a>
          )}
        </div>
      )}
    </section>
  )
}
