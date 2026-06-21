import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: Request) {
  const { name, side, attending, meal, companion, message } = await req.json()

  if (!name?.trim() || !side || !attending || !meal) {
    return NextResponse.json(
      { error: 'name, side, attending, meal are required' },
      { status: 400 },
    )
  }

  const validSides = ['신랑', '신부']
  const validAttending = ['참석', '불참석']
  const validMeal = ['○', '×', '미정']

  if (!validSides.includes(side)) {
    return NextResponse.json({ error: 'invalid side value' }, { status: 400 })
  }
  if (!validAttending.includes(attending)) {
    return NextResponse.json({ error: 'invalid attending value' }, { status: 400 })
  }
  if (!validMeal.includes(meal)) {
    return NextResponse.json({ error: 'invalid meal value' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('wedding_attendance').insert({
    name: name.trim(),
    side,
    attending,
    meal,
    companion: companion?.trim() || null,
    message: message?.trim() || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(req: Request) {
  const adminPassword = req.headers.get('x-admin-password')
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wedding_attendance')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entries: data })
}
