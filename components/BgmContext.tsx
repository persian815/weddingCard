'use client'
import { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react'

type BgmCtx = {
  play: () => void
  pause: () => void
  playing: boolean
  hasMusic: boolean
}

const BgmContext = createContext<BgmCtx>({ play: () => {}, pause: () => {}, playing: false, hasMusic: false })

export function useBgm() { return useContext(BgmContext) }

function extractVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/)
  return match?.[1] ?? null
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
    _ytApiCallbacks: (() => void)[]
  }
}

export function BgmProvider({ bgmUrl, children }: { bgmUrl: string; children: React.ReactNode }) {
  const playerRef = useRef<any>(null)
  const [playing, setPlaying] = useState(false)
  const videoId = bgmUrl ? extractVideoId(bgmUrl) : null

  useEffect(() => {
    if (!videoId) return

    const initPlayer = () => {
      const el = document.getElementById('yt-bgm-player')
      if (!el || playerRef.current) return
      playerRef.current = new window.YT.Player('yt-bgm-player', {
        videoId,
        playerVars: { loop: 1, playlist: videoId, controls: 0, disablekb: 1, fs: 0, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            setPlaying(e.data === window.YT?.PlayerState?.PLAYING)
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      window._ytApiCallbacks = window._ytApiCallbacks ?? []
      window._ytApiCallbacks.push(initPlayer)

      if (!document.getElementById('yt-iframe-api')) {
        const prev = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
          prev?.()
          window._ytApiCallbacks?.forEach(cb => cb())
          window._ytApiCallbacks = []
        }
        const script = document.createElement('script')
        script.id = 'yt-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
    }

    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId])

  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  return (
    <BgmContext.Provider value={{ play, pause, playing, hasMusic: !!videoId }}>
      {videoId && (
        <div style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, overflow: 'hidden' }}
          aria-hidden="true"
        >
          <div id="yt-bgm-player" />
        </div>
      )}
      {children}
    </BgmContext.Provider>
  )
}
