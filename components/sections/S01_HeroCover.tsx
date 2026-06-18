'use client'
import { GROOM, BRIDE, WEDDING_DATE } from '@/lib/constants'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S01_HeroCover() {
  const { coverImage } = useWeddingConfig()
  const date = new Date(WEDDING_DATE)
  const formatted = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900">
        {coverImage && (
          <img src={coverImage} alt="" className="w-full h-full object-cover opacity-70" />
        )}
      </div>
      <div className="relative z-10 text-center text-white space-y-4">
        <p className="text-sm tracking-widest uppercase opacity-70">our wedding day</p>
        <h1 className="text-4xl font-serif">{GROOM} & {BRIDE}</h1>
        <p className="text-lg tracking-wider">{formatted}</p>
      </div>
    </section>
  )
}
