import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '성룡 & 주영 결혼합니다',
  description: '2026년 9월 19일 토요일',
  openGraph: {
    title: '성룡 & 주영 결혼합니다',
    description: '2026년 9월 19일 토요일',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
