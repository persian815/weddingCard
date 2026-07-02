import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const FALLBACK = '죄송합니다, 해당 질문에 대한 정보가 없습니다. 신랑 또는 신부에게 직접 문의해 주세요.'

export async function POST(req: Request) {
  try {
  const { message, slug = 'weddingcard' } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. invitation slug 확인
  const { data: invitation, error: invErr } = await supabase
    .from('invitations')
    .select('id')
    .eq('slug', slug)
    .single()
  if (invErr || !invitation) {
    return NextResponse.json({ answer: FALLBACK })
  }

  // 2. Google text-embedding-004 임베딩
  const embedRes = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: message.trim() }] },
      }),
    }
  )
  if (!embedRes.ok) {
    return NextResponse.json({ answer: FALLBACK })
  }
  const embedData = await embedRes.json()
  const vector: number[] = embedData.embedding?.values
  if (!vector?.length) {
    return NextResponse.json({ answer: FALLBACK })
  }

  // 3. pgvector 유사도 검색 (결과 없으면 LiteLLM 미호출 — ADR-C002)
  const { data: docs, error: docErr } = await supabase.rpc('match_documents', {
    query_embedding: vector,
    invitation_slug: slug,
    match_threshold: 0.3,
    match_count: 5,
  })
  if (docErr || !docs?.length) {
    return NextResponse.json({ answer: FALLBACK })
  }

  // 4. LiteLLM (gemini-2.5-flash) 호출
  const context = (docs as { chunk_text: string }[]).map(d => d.chunk_text).join('\n\n')
  const systemPrompt = `당신은 성룡 & 주영의 결혼식 청첩장 안내 도우미입니다.
아래 정보를 참고해서 하객의 질문에 친절하고 간결하게 답해주세요.
정보에 없는 내용은 "신랑 또는 신부에게 직접 문의해 주세요"라고 답하세요.

[참고 정보]
${context}`

  const llmRes = await fetch(`${process.env.LITELLM_BASE_URL?.trim()}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LITELLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 500,
    }),
  })
  if (!llmRes.ok) {
    return NextResponse.json({ answer: FALLBACK })
  }

  const llmData = await llmRes.json()
  const answer: string = llmData.choices?.[0]?.message?.content ?? FALLBACK

  // 5. chat_logs 저장 (실패해도 응답에 영향 없음)
  supabase.from('chat_logs').insert({
    invitation_id: invitation.id,
    question: message.trim(),
    answer,
    matched_doc_ids: (docs as { id: string }[]).map(d => d.id),
    tokens_used: llmData.usage?.total_tokens ?? null,
    cost: null,
  }).then(() => {})

  return NextResponse.json({ answer })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[chat] unhandled error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
