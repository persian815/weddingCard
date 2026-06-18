'use client'
import { useWeddingConfig } from '@/components/WeddingConfigContext'

export default function S12_Attendance() {
  const { attendanceFormUrl } = useWeddingConfig()
  return (
    <section className="py-16 px-8 text-center space-y-4 bg-neutral-50">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase">attendance</p>
      <p className="text-xs text-neutral-500">참석 여부를 알려주시면 감사하겠습니다</p>
      {attendanceFormUrl ? (
        <a
          href={attendanceFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[var(--gold)] text-white px-8 py-2 text-sm tracking-wider"
        >
          참석 여부 전달하기
        </a>
      ) : (
        <p className="text-xs text-neutral-400">설정 페이지에서 구글폼 URL을 입력해주세요</p>
      )}
    </section>
  )
}
