'use client'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S02_Invitation() {
  const { invitation } = useWeddingConfig()
  return (
    <section className="py-20 px-8 text-center space-y-6">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">invitation</p>
      <p className="text-neutral-700 leading-relaxed text-sm whitespace-pre-line">{invitation}</p>
    </section>
  )
}
