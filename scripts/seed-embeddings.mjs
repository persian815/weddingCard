/**
 * 청첩장 챗봇 문서 + 임베딩 시드 스크립트
 * 실행: node scripts/seed-embeddings.mjs
 *
 * 환경변수 (.env.local에서 읽음):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// .env.local 파싱
const envPath = resolve(__dir, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_API_KEY = env.GOOGLE_API_KEY
const INVITATION_SLUG = 'weddingcard'

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_API_KEY) {
  console.error('필요한 환경변수가 없습니다: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── 여기에 청첩장 내용을 추가하세요 ───────────────────────────────────
const DOCUMENTS = [
  {
    source_type: 'venue',
    content: '결혼식 장소는 LA VIE DOUCE(라비두스)입니다. 주소: 서울특별시 중구 필동로 5길 7 (필동3가 62-11번지). 결혼식 날짜는 2026년 9월 19일 토요일입니다. 문의: 02-2265-7000.',
  },
  {
    source_type: 'transport',
    content: '라비두스(LA VIE DOUCE) 지하철 오시는 길: 3·4호선 충무로역 1번 출구 BHC 치킨집 앞에서 셔틀버스 탑승. 셔틀버스는 3분 간격 운행, 예식 1시간 전부터 예식 시작 시간까지 운행합니다. 도보로는 충무로역 1번 출구에서 약 5분(615m) 거리입니다.',
  },
  {
    source_type: 'transport',
    content: '라비두스(LA VIE DOUCE) 버스 오시는 길: 104번, 421번, 463번, 507번, 남산순환버스 01A·01B, 6001번(공항버스) 이용 가능합니다.',
  },
  {
    source_type: 'parking',
    content: '라비두스(LA VIE DOUCE) 주차 안내: 라비두스 별관 주차장을 이용하실 수 있습니다. 네비게이션 주소: 필동로 5길 7 또는 필동3가 62-11번지.',
  },
  {
    source_type: 'account',
    content: '신랑 이성룡의 계좌번호: 기업은행 01099148185',
  },
]
// ────────────────────────────────────────────────────────────────────────

async function getEmbedding(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      }),
    }
  )
  if (!res.ok) throw new Error(`Embedding API error: ${await res.text()}`)
  const data = await res.json()
  return data.embedding.values
}

async function main() {
  // invitation 확인
  const { data: inv, error: invErr } = await supabase
    .from('invitations')
    .select('id')
    .eq('slug', INVITATION_SLUG)
    .single()
  if (invErr || !inv) {
    console.error('invitation을 찾을 수 없습니다. slug:', INVITATION_SLUG)
    process.exit(1)
  }
  const invitationId = inv.id
  console.log(`invitation id: ${invitationId}`)

  // 기존 documents 삭제 후 재삽입 (멱등성)
  await supabase.from('documents').delete().eq('invitation_id', invitationId)
  console.log('기존 documents 삭제 완료')

  for (const doc of DOCUMENTS) {
    console.log(`\n처리 중: [${doc.source_type}] ${doc.content.slice(0, 40)}...`)

    // 1. document 삽입
    const { data: docRow, error: docErr } = await supabase
      .from('documents')
      .insert({ invitation_id: invitationId, source_type: doc.source_type, content: doc.content })
      .select('id')
      .single()
    if (docErr) { console.error('document 삽입 오류:', docErr.message); continue }

    // 2. 임베딩 생성
    const vector = await getEmbedding(doc.content)
    console.log(`  임베딩 생성 완료 (${vector.length}차원)`)

    // 3. embedding 삽입
    const { error: embErr } = await supabase
      .from('embeddings')
      .insert({ document_id: docRow.id, chunk_text: doc.content, embedding: vector })
    if (embErr) { console.error('embedding 삽입 오류:', embErr.message); continue }

    console.log(`  ✓ 완료`)
  }

  console.log('\n모든 문서 처리 완료!')
}

main().catch(console.error)
