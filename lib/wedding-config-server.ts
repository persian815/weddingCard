import { createClient } from '@/lib/supabase/server'
import { DEFAULT_CONFIG, mergeConfig, type WeddingConfig } from '@/lib/wedding-config'

export async function getWeddingConfig(): Promise<WeddingConfig> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('wedding_config')
      .select('data')
      .eq('id', 1)
      .single()
    if (data?.data && typeof data.data === 'object') {
      return mergeConfig(data.data as Partial<WeddingConfig>)
    }
  } catch {}
  return DEFAULT_CONFIG
}
