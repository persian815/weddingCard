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
  // 예식장 & 교통
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
  // 계좌
  {
    source_type: 'account',
    content: '신랑 이성룡의 계좌번호: 기업은행 01099148185',
  },
  // 커플 소개
  {
    source_type: 'couple',
    content: '신랑 이성룡과 신부 이주영은 위키캐스트에서 동료로 처음 만났습니다. 두 사람이 다시 연락을 이어가게 된 것은 2025년 6월 8일이었습니다.',
  },
  {
    source_type: 'couple',
    content: '신랑 이성룡은 삼성생명 IT 개발자로 일하고 있습니다. 미술관과 전시회 관람, 코인노래방, 영화, 뮤지컬, 서점, 공원 산책, 트레일러닝, 수영, 테니스 등을 즐깁니다.',
  },
  {
    source_type: 'couple',
    content: '신부 이주영은 제약회사에서 8년 이상 근무한 영업·마케팅 전문가입니다. 전시회 관람, 드라이브, 헬스, 네일케어 등을 즐기며 열정적으로 일하는 사람입니다.',
  },
  {
    source_type: 'couple',
    content: '두 사람은 사주 분석에서 90점 이상의 높은 궁합을 기록했습니다. 성룡은 계수(癸水) 일주에 돼지띠, 주영은 무토(戊土) 일주에 호랑이띠로, 인해합(寅亥合)의 인연으로 풀이됩니다.',
  },
  {
    source_type: 'couple',
    content: '두 사람 모두 전시회와 미술관을 즐기는 공통 취미를 가지고 있으며, 여행을 좋아하고 서로에게 솔직하게 마음을 표현하는 건강한 대화 방식을 이어가고 있습니다.',
  },
  {
    source_type: 'couple',
    content: '성룡은 틈날 때마다 아침 러닝과 축구, 수영으로 체력을 관리하고, 주영은 헬스와 실내 자전거로 건강을 챙기는 활동적인 두 사람입니다.',
  },
  // 커플 스토리
  {
    source_type: 'story',
    content: '두 사람은 2025년 6월 8일 다시 연락을 시작했고, 6월 28일 신논현의 이자카야에서 첫 만남을 가졌습니다. 성룡이 주영에게 먼저 만남을 제안했고, 주영은 설레는 마음으로 응했습니다.',
  },
  {
    source_type: 'story',
    content: '2025년 7월 2일, 주영이 먼저 성룡에게 마음을 고백했습니다. 그 용기 있는 한 마디가 두 사람의 진짜 시작이 되었습니다.',
  },
  {
    source_type: 'story',
    content: '7월 5일, 두 사람은 남산 케이블카를 타며 함께 서울 야경을 바라보았습니다. 이 날이 두 사람의 공식적인 첫 데이트로 기억됩니다.',
  },
  {
    source_type: 'story',
    content: '두 사람은 함께 한강 자전거 데이트, 전시회 관람, 미술관 나들이, 영화 감상 등 서로의 취향이 겹치는 활동들을 함께 즐기며 더욱 가까워졌습니다.',
  },
  {
    source_type: 'story',
    content: '2025년 9월경부터 두 사람은 예식장 탐방을 다니며 결혼을 진지하게 준비하기 시작했습니다.',
  },
  {
    source_type: 'story',
    content: '2025년 11월, 두 사람은 강동구 둔촌동에 신혼집을 계약했습니다. 아크레도와 반조애 브랜드에서 예물 반지를 고르는 소중한 시간도 가졌습니다.',
  },
  {
    source_type: 'story',
    content: '2025년 12월, 크리스마스 마켓과 반지 쇼핑을 함께 즐겼고, 두 사람의 부모님들과 상견례 자리도 가졌습니다.',
  },
  {
    source_type: 'story',
    content: '2026년 1월 30일, 두 사람은 강동구 둔촌동 신혼집으로 함께 입주했습니다. 양가 부모님의 도움을 받아 새 보금자리를 꾸리며 결혼을 눈앞에 두게 되었습니다.',
  },
  {
    source_type: 'story',
    content: '성룡은 주영이 야근으로 힘든 날에도 늦게까지 기다렸다가 함께 집으로 가거나 데려다 주는 등 세심한 배려를 아끼지 않았습니다.',
  },
  // 웨딩 플랜
  {
    source_type: 'wedding_plan',
    content: '결혼식은 2026년 9월 19일 토요일에 열립니다. 두 사람은 2025년 여름부터 예식장을 함께 돌아보며 이 날을 준비해 왔습니다.',
  },
  {
    source_type: 'wedding_plan',
    content: '신부는 결혼식을 앞두고 헤어스타일, 2부 드레스, 스드메(스튜디오·드레스·메이크업) 준비를 꼼꼼히 진행했으며, 웨딩 박람회도 함께 다녀왔습니다.',
  },
  {
    source_type: 'wedding_plan',
    content: '신혼여행지는 일본 오사카와 교토로 결정했습니다. 오사카 요도가와하천공원, 교토 게아게 인클라인, 철학의 길, 시라카와 골목, 아라시야마 강변 등 감성 넘치는 장소들을 탐방할 계획입니다.',
  },
  // 기타
  {
    source_type: 'misc',
    content: '성룡은 밤새 작업하여 두 사람의 소중한 날들을 기록하는 커플 다이어리 앱(Day One)을 직접 만들어 주영에게 깜짝 선물하기도 했습니다.',
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
