'use client'
import { useState } from 'react'
import { useWeddingConfig } from '@/components/WeddingConfigContext'
import { useScrollVisible } from '@/hooks/useScrollVisible'

type Side = '신랑' | '신부'
type Attending = '참석' | '불참석'
type Meal = '○' | '×' | '미정'

export default function S12_Attendance() {
  const { attendanceFormUrl } = useWeddingConfig()
  const { ref } = useScrollVisible<HTMLElement>()

  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<Side>('신랑')
  const [attending, setAttending] = useState<Attending>('참석')
  const [meal, setMeal] = useState<Meal>('○')
  const [name, setName] = useState('')
  const [companion, setCompanion] = useState('')
  const [messageText, setMessageText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleOpen = () => {
    setDone(false)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSide('신랑')
    setAttending('참석')
    setMeal('○')
    setName('')
    setCompanion('')
    setMessageText('')
    setDone(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side,
          attending,
          meal,
          name: name.trim(),
          companion: companion.trim() || undefined,
          message: messageText.trim() || undefined,
        }),
      })
      if (res.ok) {
        setDone(true)
        setTimeout(() => handleClose(), 2000)
      } else {
        const data = await res.json()
        setSubmitError(data.error ?? '전달에 실패했습니다. 다시 시도해주세요.')
      }
    } catch {
      setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleBtnClass = (active: boolean) =>
    `flex-1 py-1.5 text-xs border transition-colors ${
      active
        ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10'
        : 'border-neutral-200 text-neutral-500'
    }`

  return (
    <section ref={ref} className="py-16 px-8 text-center space-y-4 bg-neutral-50 scroll-fade">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">attendance</p>
      <p className="text-xs text-neutral-500">참석 여부를 알려주시면 감사하겠습니다</p>

      <button
        onClick={handleOpen}
        className="inline-block bg-[var(--gold)] text-white px-8 py-2 text-sm tracking-wider"
      >
        참석 여부 전달하기
      </button>

      {attendanceFormUrl && (
        <p className="text-xs text-neutral-400">
          또는{' '}
          <a
            href={attendanceFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            구글폼으로 응답하기
          </a>
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mt-3 mb-4" />
        <div className="px-6 pb-10 max-h-[85vh] overflow-y-auto">
          {done ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-lg text-[var(--gold)]">감사합니다</p>
              <p className="text-xs text-neutral-500">소중한 마음 잘 전달받았습니다</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <p className="text-xs text-neutral-500">어느 측 하객이신가요?</p>
                <div className="flex gap-2">
                  {(['신랑', '신부'] as Side[]).map(v => (
                    <button key={v} type="button" onClick={() => setSide(v)} className={toggleBtnClass(side === v)}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-neutral-500">참석 여부</p>
                <div className="flex gap-2">
                  {(['참석', '불참석'] as Attending[]).map(v => (
                    <button key={v} type="button" onClick={() => setAttending(v)} className={toggleBtnClass(attending === v)}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-neutral-500">식사 여부</p>
                <div className="flex gap-2">
                  {(['○', '×', '미정'] as Meal[]).map(v => (
                    <button key={v} type="button" onClick={() => setMeal(v)} className={toggleBtnClass(meal === v)}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-neutral-500">성함 <span className="text-red-400">*</span></p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none"
                  maxLength={20}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-neutral-500">동행인 성함 <span className="text-neutral-400">(선택)</span></p>
                <input
                  value={companion}
                  onChange={e => setCompanion(e.target.value)}
                  placeholder="동행인이 있으시면 입력해주세요"
                  className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none"
                  maxLength={50}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-neutral-500">전달사항 <span className="text-neutral-400">(선택)</span></p>
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="전달하실 말씀이 있으시면 입력해주세요"
                  className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="w-full bg-[var(--gold)] text-white py-2.5 text-sm tracking-wider disabled:opacity-50"
              >
                {submitting ? '전달 중...' : '전달하기'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
