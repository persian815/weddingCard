import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WEDDING_DATE } from '@/lib/constants'

export async function POST(req: Request) {
  const isActive = new Date() >= new Date(WEDDING_DATE)
  if (!isActive) {
    return NextResponse.json({ error: '혼례일 당일부터 업로드 가능합니다' }, { status: 403 })
  }
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const supabase = await createClient()
  const fileName = `${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('guest-snap')
    .upload(fileName, file, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, fileName })
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('guest-snap').list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ files: data })
}
