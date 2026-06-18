'use client'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S11_Location() {
  const { venue } = useWeddingConfig()
  return (
    <section className="py-16 px-8 space-y-4">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center">location</p>
      {venue.naverPlaceId ? (
        <iframe
          src={`https://map.naver.com/p/entry/place/${venue.naverPlaceId}`}
          width="100%"
          height="280"
          className="border-0"
          title="venue map"
        />
      ) : (
        <div className="h-[280px] bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
          설정 페이지에서 네이버 지도 장소 ID를 입력해주세요
        </div>
      )}
      <div className="text-center text-sm space-y-1">
        <p className="font-medium">{venue.name || '예식장명'}</p>
        <p className="text-xs text-neutral-400">{venue.address || '주소'}</p>
      </div>
    </section>
  )
}
