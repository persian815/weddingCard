import { GROOM, BRIDE, WEDDING_DATE } from '@/lib/constants'

export default function S16_Ending() {
  const d = new Date(WEDDING_DATE)
  return (
    <section className="py-20 px-8 text-center space-y-6 bg-neutral-900 text-white">
      <p className="font-serif text-2xl">{GROOM} & {BRIDE}</p>
      <p className="text-sm text-neutral-400 tracking-widest">
        {d.getFullYear()}.{String(d.getMonth() + 1).padStart(2, '0')}.{String(d.getDate()).padStart(2, '0')}
      </p>
      <p className="text-xs text-neutral-500">감사합니다</p>
    </section>
  )
}
