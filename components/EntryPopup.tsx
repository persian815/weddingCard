'use client'
import { useEffect, useState } from 'react'
import { GROOM, BRIDE, WEDDING_DATE } from '@/lib/constants'
import { useBgm } from '@/components/BgmContext'

export default function EntryPopup() {
  const [visible, setVisible] = useState(false)
  const { play, hasMusic } = useBgm()

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem('popup-hidden-date') !== today) setVisible(true)
  }, [])

  const handleClose = (hide: boolean) => {
    if (hide) {
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem('popup-hidden-date', today)
    }
    setVisible(false)
    if (hasMusic) play()
  }

  const d = new Date(WEDDING_DATE)
  const formatted = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white w-72 p-8 text-center space-y-6">
        <p className="text-xs text-[var(--gold)] tracking-widest uppercase">wedding invitation</p>
        <div className="space-y-1">
          <p className="font-serif text-xl">{GROOM} & {BRIDE}</p>
          <p className="text-xs text-neutral-500">{formatted}</p>
        </div>
        <button
          onClick={() => handleClose(false)}
          className="w-full bg-[var(--gold)] text-white py-2 text-sm tracking-wider"
        >
          청첩장 보기
        </button>
        <button
          onClick={() => handleClose(true)}
          className="text-xs text-neutral-400 underline"
        >
          오늘 하루 안 보기
        </button>
      </div>
    </div>
  )
}
