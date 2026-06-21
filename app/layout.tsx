import type { Metadata } from 'next'
import './globals.css'
import { getWeddingConfig } from '@/lib/wedding-config-server'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getWeddingConfig()
  return {
    title: '성룡 & 주영 결혼합니다',
    description: '2026년 9월 19일 토요일',
    openGraph: {
      title: '성룡 & 주영 결혼합니다',
      description: '2026년 9월 19일 토요일',
      images: config.coverImage ? [{ url: config.coverImage }] : [],
      type: 'website',
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
