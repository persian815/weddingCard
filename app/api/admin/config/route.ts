import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('wedding_config')
      .select('data')
      .eq('id', 1)
      .single()
    return NextResponse.json(data?.data ?? {})
  } catch {
    return NextResponse.json({})
  }
}

export async function PUT(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('wedding_config')
      .upsert({ id: 1, data: body, updated_at: new Date().toISOString() })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
