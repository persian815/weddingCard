'use client'
import { useState } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'
import { useScrollVisible } from '@/hooks/useScrollVisible'
import type { WeddingConfig } from '@/lib/wedding-config'

function AccountItem({ name, bank, number, kakaoPayUrl }: WeddingConfig['accounts'][0]) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!number) return
    navigator.clipboard.writeText(number).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center py-3 text-sm"
      >
        <span>{name}</span>
        <span className="text-xs text-neutral-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="pb-3 space-y-2">
          <p className="text-xs text-neutral-500">{bank} {number}</p>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className={`flex-1 border py-1 text-xs transition-colors ${
                copied
                  ? 'border-green-400 text-green-600 bg-green-50'
                  : 'border-neutral-200 text-neutral-600'
              }`}
            >
              {copied ? '✓ 복사됨' : '계좌 복사'}
            </button>
            {kakaoPayUrl && (
              <a
                href={kakaoPayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FEE500] text-center py-1 text-xs"
              >
                카카오페이
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function S13_Gift() {
  const { accounts } = useWeddingConfig()
  const { ref } = useScrollVisible<HTMLElement>()

  return (
    <section ref={ref} className="py-16 px-8 scroll-fade">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center mb-6">gift</p>
      <div className="max-w-sm mx-auto">
        {accounts.map((acc, i) => (
          <AccountItem key={i} {...acc} />
        ))}
      </div>
    </section>
  )
}
