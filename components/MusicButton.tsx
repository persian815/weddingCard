'use client'
import { useBgm } from '@/components/BgmContext'

export default function MusicButton() {
  const { play, pause, playing, hasMusic } = useBgm()

  if (!hasMusic) return null

  return (
    <button
      onClick={() => playing ? pause() : play()}
      className="fixed top-4 right-4 z-40 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-sm"
      aria-label={playing ? '음악 정지' : '음악 재생'}
    >
      {playing ? '♪' : '♩'}
    </button>
  )
}
