import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'gallery'

function checkAuth(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  return pw && pw === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: '파일 없음' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url 없음' }, { status: 400 })

  const filename = url.split('/').pop()
  const supabase = createServiceClient()
  const { error } = await supabase.storage.from(BUCKET).remove([filename])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
