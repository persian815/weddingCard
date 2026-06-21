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

  // 첫 사용자 인터랙션 시 재생 (팝업 없이 진입한 경우 대비)
  const registerPlayOnInteraction = useCallback(() => {
    const events = ['touchstart', 'scroll', 'click'] as const
    const handler = () => {
      playerRef.current?.playVideo()
      events.forEach(ev => window.removeEventListener(ev, handler))
    }
    events.forEach(ev => window.addEventListener(ev, handler, { once: true, passive: true }))
    return () => events.forEach(ev => window.removeEventListener(ev, handler))
  }, [])

  useEffect(() => {
    if (!videoId) return

    let cleanupInteraction: (() => void) | undefined

    const initPlayer = () => {
      const el = document.getElementById('yt-bgm-player')
      if (!el || playerRef.current) return
      playerRef.current = new window.YT.Player('yt-bgm-player', {
        videoId,
        playerVars: { loop: 1, playlist: videoId, controls: 0, disablekb: 1, fs: 0, rel: 0 },
        events: {
          onReady: () => {
            // 팝업이 이미 닫혀있는 경우(오늘 하루 안보기) 자동 재생 시도
            const today = new Date().toISOString().slice(0, 10)
            const popupHidden = localStorage.getItem('popup-hidden-date') === today
            if (popupHidden) {
              // 자동 재생 시도 → 브라우저 정책으로 막히면 첫 인터랙션 시 재생
              playerRef.current?.playVideo()
              // 500ms 후에도 재생 안 되면 인터랙션 대기
              setTimeout(() => {
                const state = playerRef.current?.getPlayerState?.()
                if (state !== window.YT?.PlayerState?.PLAYING) {
                  cleanupInteraction = registerPlayOnInteraction()
                }
              }, 500)
            }
          },
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
      cleanupInteraction?.()
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, registerPlayOnInteraction])

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
