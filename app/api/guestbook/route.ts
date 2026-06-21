import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wedding_guestbook')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data })
}

export async function POST(req: Request) {
  const { name, message, password } = await req.json()
  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'name and message required' }, { status: 400 })
  }
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('wedding_guestbook')
    .insert({ name: name.trim(), message: message.trim(), password: password?.trim() || null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { id, password } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const adminPassword = req.headers.get('x-admin-password')
  const supabase = createServiceClient()

  // 관리자 헤더가 없으면 password 검증
  if (!adminPassword) {
    // password가 없으면 삭제 불가
    if (!password?.trim()) {
      return NextResponse.json({ error: 'password required' }, { status: 401 })
    }

    // 항목 조회
    const { data, error: fetchError } = await supabase
      .from('wedding_guestbook')
      .select('id, password')
      .eq('id', id)
      .single()

    if (fetchError || !data) {
      return NextResponse.json({ error: '항목을 찾을 수 없습니다' }, { status: 404 })
    }

    // 저장된 password가 null이면 삭제 불가
    if (!data.password) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 401 })
    }

    // password 불일치
    if (data.password !== password.trim()) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 401 })
    }
  }

  const { error } = await supabase.from('wedding_guestbook').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
