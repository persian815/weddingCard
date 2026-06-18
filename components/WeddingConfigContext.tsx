'use client'
import { createContext, useContext } from 'react'
import { DEFAULT_CONFIG, type WeddingConfig } from '@/lib/wedding-config'

const Ctx = createContext<WeddingConfig>(DEFAULT_CONFIG)

export function WeddingConfigProvider({
  config,
  children,
}: {
  config: WeddingConfig
  children: React.ReactNode
}) {
  return <Ctx.Provider value={config}>{children}</Ctx.Provider>
}

export function useWeddingConfig() {
  return useContext(Ctx)
}
