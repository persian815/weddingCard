'use client'
import { useWeddingConfig } from '@/components/WeddingConfigContext'
import { WEDDING_DATE } from '@/lib/constants'
import { useScrollVisible } from '@/hooks/useScrollVisible'

function CalendarGrid({ year, month, highlightDay }: { year: number; month: number; highlightDay: number }) {
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const nulls: (number | null)[] = Array.from({ length: firstDay }, () => null)
  const dates: (number | null)[] = Array.from({ length: lastDate }, (_, i) => i + 1)
  const days: (number | null)[] = [...nulls, ...dates]
  const weeks: (number | null)[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="text-center">
      <p className="text-sm text-neutral-500 mb-3">
        {year}년 {month + 1}월
      </p>
      <div className="grid grid-cols-7 gap-1 text-xs text-neutral-400 mb-1">
        {['일','월','화','수','목','금','토'].map(d => <span key={d}>{d}</span>)}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 text-sm">
          {week.map((day, di) => (
            <span
              key={di}
              className={day === highlightDay
                ? 'w-7 h-7 mx-auto flex items-center justify-center rounded-full bg-[var(--gold)] text-white gold-pulse-ring'
                : 'py-1 text-neutral-700'}
            >
              {day ?? ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function S05_Ceremony() {
  const d = new Date(WEDDING_DATE)
  const { venue, ceremonyImage } = useWeddingConfig()
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const dateLabel = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayOfWeek}요일`
  const { ref } = useScrollVisible<HTMLElement>()

  return (
    <section ref={ref} className="py-16 px-8 text-center space-y-6 scroll-fade">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">ceremony</p>
      {ceremonyImage && (
        <div className="w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
          <img src={ceremonyImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <CalendarGrid year={d.getFullYear()} month={d.getMonth()} highlightDay={d.getDate()} />
      <div className="space-y-1 text-sm text-neutral-600">
        <p>{venue.name || '예식장명'}</p>
        <p className="text-xs text-neutral-400">{venue.address || '주소'}</p>
        <p>{dateLabel}{venue.time ? ` ${venue.time}` : ''}</p>
      </div>
    </section>
  )
}
