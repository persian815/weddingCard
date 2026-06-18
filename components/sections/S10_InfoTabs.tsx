'use client'
import { useState } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

const TABS = [
  { key: 'photobooth', label: '포토부스' },
  { key: 'parking', label: '주차' },
  { key: 'gift', label: '답례품' },
] as const

export default function S10_InfoTabs() {
  const [active, setActive] = useState<typeof TABS[number]['key']>('photobooth')
  const { infoTabs } = useWeddingConfig()
  return (
    <section className="py-16 px-8">
      <div className="flex border-b mb-4">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 py-2 text-sm ${active === key ? 'border-b-2 border-[var(--gold)] text-[var(--gold)]' : 'text-neutral-400'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">
        {infoTabs[active] || `설정 페이지에서 ${TABS.find(t => t.key === active)?.label} 정보를 입력해주세요`}
      </p>
    </section>
  )
}
