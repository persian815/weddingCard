'use client'
import { useEffect, useRef, useState } from 'react'

export default function MusicButton({ audioRef }: { audioRef?: React.RefObject<HTMLAudioElement | null> }) {
  const localRef = useRef<HTMLAudioElement>(null)
  const ref = audioRef ?? localRef
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [ref])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    playing ? el.pause() : el.play().catch(() => {})
  }

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-40 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center text-sm"
      aria-label={playing ? '음악 정지' : '음악 재생'}
    >
      {playing ? '♪' : '♩'}
    </button>
  )
}
