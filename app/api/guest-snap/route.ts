import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'guest-snap'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const supabase = createServiceClient()
  const fileName = `${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, fileName })
}

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ files: data })
}

export async function DELETE(req: Request) {
  const adminPassword = req.headers.get('x-admin-password')
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || adminPassword !== expectedPassword) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const { fileName, all } = await req.json()
  const supabase = createServiceClient()

  if (all) {
    const { data, error: listError } = await supabase.storage.from(BUCKET).list('', { limit: 1000 })
    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })
    if (data && data.length > 0) {
      const names = data.map(f => f.name)
      const { error } = await supabase.storage.from(BUCKET).remove(names)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  if (!fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 })
  const { error } = await supabase.storage.from(BUCKET).remove([fileName])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
