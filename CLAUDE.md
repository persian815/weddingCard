# weddingCard — CLAUDE.md

> 항상 이 파일을 먼저 읽고 시작한다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | weddingCard |
| 목적 | 성룡 & 주영의 감성 모바일 청첩장 |
| 타겟 | 결혼식 하객 (모바일 웹) |
| 버전 | v1.0 |
| 상태 | 1차 개발 완료 |
| 본식 | 2026년 9월 19일 (토) |
| 배포 URL | https://wedding-card-six-ivory.vercel.app |

---

## 2. 기술 스택

```
Frontend  : Next.js 15 (App Router) + TypeScript
Styling   : Tailwind CSS v4 + 커스텀 CSS 변수 (--gold: #C4A882)
DB        : Supabase PostgreSQL (방명록, 참석여부, 설정)
Storage   : Supabase Storage (갤러리, 게스트스냅, 기타 이미지)
BGM       : YouTube IFrame API (BgmContext)
배포      : Vercel (GitHub 연동 자동 배포)
패키지    : Yarn
```

---

## 3. 프로젝트 구조

```
weddingCard/
├── CLAUDE.md
├── app/
│   ├── page.tsx                    ← 메인 청첩장 (S01~S16, 서버 컴포넌트)
│   ├── guest-snap/page.tsx         ← 게스트스냅 서브페이지
│   ├── admin/page.tsx              ← 관리자 페이지 (/admin)
│   ├── layout.tsx                  ← OG 태그 동적 생성 포함
│   ├── globals.css
│   └── api/
│       ├── admin/
│       │   ├── auth/route.ts       ← 관리자 비밀번호 인증
│       │   ├── config/route.ts     ← WeddingConfig GET·PUT
│       │   └── images/route.ts     ← 이미지 업로드·삭제 (Storage)
│       ├── guestbook/route.ts      ← GET·POST (공개), DELETE (admin)
│       ├── guest-snap/route.ts     ← GET·POST (공개), DELETE (admin)
│       └── attendance/route.ts     ← POST (공개), GET (admin)
│
├── components/
│   ├── BgmContext.tsx              ← YouTube IFrame API 컨텍스트
│   ├── WeddingConfigContext.tsx    ← 전역 설정 컨텍스트
│   ├── EntryPopup.tsx              ← 진입 팝업 (오늘하루 안보기 + 음악 시작)
│   ├── MusicButton.tsx             ← 우측 상단 음악 재생/정지
│   ├── FloatingActions.tsx         ← 우측 하단 위로가기 + 공유
│   └── sections/
│       ├── S01_HeroCover.tsx       ← 커버 배경 이미지 + 이름
│       ├── S02_Invitation.tsx      ← 청첩 문구
│       ├── S03_People.tsx          ← 양가 인물 소개
│       ├── S04_Interview.tsx       ← 웨딩 인터뷰 Q&A (바텀시트 모달)
│       ├── S05_Ceremony.tsx        ← 예식 정보 + 9월 달력 (19일 골드 원)
│       ├── S06_DDay.tsx            ← D-Day 카운터
│       ├── S07_OurStory.tsx        ← 지그재그 타임라인 + 라이트박스 스와이프
│       ├── S08_Gallery.tsx         ← 사진 갤러리 + 라이트박스 스와이프
│       ├── S09_GuestSnap.tsx       ← 게스트스냅 링크
│       ├── S10_InfoTabs.tsx        ← 포토부스·주차·답례품 3탭
│       ├── S11_Location.tsx        ← Google Maps + T맵·네이버지도 버튼
│       ├── S12_Attendance.tsx      ← 참석 여부 RSVP 인라인 폼
│       ├── S13_Gift.tsx            ← 계좌 아코디언 + 복사 + 카카오페이
│       ├── S14_Guestbook.tsx       ← 방명록 (비밀번호 삭제)
│       ├── S15_Together.tsx        ← 함께한 시간 초 단위 카운터
│       └── S16_Ending.tsx          ← 마무리 문구
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← 브라우저용 클라이언트
│   │   ├── server.ts               ← 서버 컴포넌트·SSR용
│   │   └── service.ts              ← service_role (API 라우트 전용)
│   ├── wedding-config.ts           ← WeddingConfig 타입 + DEFAULT_CONFIG + mergeConfig
│   └── constants.ts                ← GROOM, BRIDE, WEDDING_DATE 등
│
└── supabase/
    └── migrations/
        ├── 001_guestbook.sql
        ├── 002_config.sql
        ├── 003_attendance.sql
        └── 004_guestbook_password.sql
```

---

## 4. DB 스키마

### wedding_guestbook
```sql
CREATE TABLE wedding_guestbook (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  message    text NOT NULL,
  password   text,                   -- 작성자 삭제용 (nullable)
  created_at timestamptz DEFAULT now()
);
-- 읽기·쓰기: 공개 / 삭제: service_role (API 라우트)
-- 관리자는 x-admin-password 헤더로 password 검증 없이 삭제 가능
```

### wedding_attendance
```sql
CREATE TABLE wedding_attendance (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  side       text CHECK (side IN ('groom','bride')),
  attending  text CHECK (attending IN ('yes','no','unknown')),
  meal       text CHECK (meal IN ('yes','no','unknown')),
  headcount  integer DEFAULT 1,
  message    text,
  created_at timestamptz DEFAULT now()
);
```

### wedding_config
```sql
CREATE TABLE wedding_config (
  id      integer PRIMARY KEY DEFAULT 1,
  data    jsonb NOT NULL DEFAULT '{}'
);
-- WeddingConfig 전체를 jsonb 단일 row로 저장
```

### Supabase Storage 버킷
| 버킷명 | 공개 | 용도 |
|---|---|---|
| `guest-snap` | ✓ | 게스트 업로드 사진 |
| `gallery` | ✓ | 갤러리·커버·예식·타임라인·안내탭 이미지 (관리자 업로드) |

---

## 5. 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=20260919
NEXT_PUBLIC_WEDDING_DATE=2026-09-19
NEXT_PUBLIC_FIRST_MET_DATE=2022-12-24
NEXT_PUBLIC_APP_NAME=weddingCard
```

---

## 6. WeddingConfig 타입

```typescript
// lib/wedding-config.ts
export interface WeddingConfig {
  invitation: string
  coverImage: string
  ceremonyImage: string
  bgmUrl: string                     // YouTube URL
  attendanceFormUrl: string
  venue: {
    name: string
    address: string
    naverPlaceId: string
    time: string
  }
  people: {
    groomFather: string; groomMother: string; groomOrder: string
    brideFather: string; brideMother: string; brideOrder: string
  }
  interview: { qa: { q: string; groomAnswer: string; brideAnswer: string }[] }
  ourStory: { date: string; title: string; description: string; image?: string }[]
  infoTabs: {
    photobooth: string; photoboothImage: string
    parking: string;    parkingImage: string
    gift: string;       giftImage: string
  }
  accounts: { name: string; bank: string; number: string; kakaoPayUrl?: string }[]
  gallery: string[]
}
```

모든 설정은 Supabase `wedding_config` 테이블에 jsonb로 저장되며, `mergeConfig()`로 DEFAULT_CONFIG와 병합해 사용한다.

---

## 7. v1 구현 기능

### 청첩장 섹션 (S01 ~ S16)

| 섹션 | 기능 |
|---|---|
| S01 히어로 커버 | 전체 배경 이미지 + 이름 + 날짜, 스크롤 fade-in |
| S02 청첩 문구 | 관리자 설정 텍스트 |
| S03 인물 소개 | 양가 부모·자녀 순서 표시 |
| S04 웨딩 인터뷰 | Q&A 바텀시트 모달 (신랑·신부 답변) |
| S05 예식 정보 | 날짜·시간·장소, 9월 달력 (19일 골드 원 표시), 커플 사진 |
| S06 D-Day | 결혼식까지 남은 일수 카운터 |
| S07 우리 이야기 | 지그재그 타임라인, 항목 클릭 시 라이트박스, 좌우 스와이프·키보드 이동 |
| S08 갤러리 | 사진 그리드, 클릭 시 라이트박스, 좌우 스와이프·키보드 이동 |
| S09 게스트스냅 | /guest-snap 서브페이지 링크 |
| S10 안내 탭 | 포토부스·주차·답례품 3탭 (텍스트 + 이미지) |
| S11 위치 안내 | Google Maps iframe, T맵 딥링크 버튼, 네이버지도 버튼 |
| S12 참석 여부 | 인라인 RSVP 폼 (신랑측/신부측, 참석/불참, 식사 여부, 인원수) → Supabase 저장 |
| S13 마음 전하기 | 신랑·신부·양가 계좌 아코디언, 계좌번호 복사 토스트, 카카오페이 링크 |
| S14 방명록 | 작성 (이름·메시지·비밀번호), 비밀번호 입력 후 본인 삭제 |
| S15 함께한 시간 | 처음 만난 날부터 현재까지 초 단위 실시간 카운터 |
| S16 엔딩 | 마무리 문구 |

### 공통 UI

| 기능 | 설명 |
|---|---|
| 진입 팝업 | 오늘하루 안보기 (localStorage), 팝업 닫기 시 배경음악 자동 재생 |
| 배경음악 | YouTube IFrame API, 팝업 없이 진입 시 첫 인터랙션(터치·스크롤·클릭)에 재생 |
| 음악 버튼 | 우측 상단 고정, bgmUrl 없으면 숨김 |
| 플로팅 액션 | 우측 하단 고정, 위로가기 + Web Share API 공유 |
| 스크롤 애니메이션 | IntersectionObserver (opacity-0 → opacity-100, translate-y) |
| OG 태그 | coverImage를 og:image로 동적 생성 |

### 관리자 (/admin)

| 탭 | 관리 항목 |
|---|---|
| 콘텐츠 관리 | 커버 이미지, 갤러리 이미지 (순서 변경·삭제), 타임라인 이미지, 안내탭 이미지 |
| 예식 정보 | 예식 커플 사진, 청첩 문구, 예식장·주소·지도ID·시간 |
| 인물·인터뷰 | 양가 인물, 인터뷰 Q&A 추가·삭제, 타임라인 항목 추가·삭제·순서변경·날짜순정렬 |
| 안내·계좌 | 포토부스·주차·답례품 텍스트, 계좌번호·카카오페이 링크 |
| 기타 | 배경음악 YouTube URL, 참석여부 구글폼 URL |
| 방명록 | 전체 조회, 개별 삭제 (비밀번호 검증 없이 관리자 권한으로 삭제) |
| 게스트스냅 | 전체 조회, 개별 삭제, 전체 초기화 |

### 게스트스냅 (/guest-snap)

- 날짜 제한 없이 언제든 업로드 가능
- Supabase Storage `guest-snap` 버킷에 저장
- 업로드 후 그리드로 즉시 표시

---

## 8. 핵심 패턴

### 배경음악 (YouTube IFrame API)
- `BgmContext` → `useBgm()` 훅으로 전역 공유
- 팝업 닫기: `play()` 호출
- 팝업 숨겨진 채 진입: `onReady` 시 자동재생 시도, 500ms 후 실패하면 첫 인터랙션 대기

### 설정 로드 패턴
```typescript
// 서버 컴포넌트 (app/page.tsx)
const config = await getWeddingConfig()   // Supabase에서 fetch
// <WeddingConfigProvider config={config}>로 전달
// 클라이언트에서: const { gallery, ourStory, ... } = useWeddingConfig()
```

### 라이트박스 스와이프 (S07, S08 공통)
```tsx
const touchStartX = useRef<number | null>(null)
const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
const handleTouchEnd = (e) => {
  const diff = touchStartX.current! - e.changedTouches[0].clientX
  if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
}
```

### 관리자 인증
- 로그인: `POST /api/admin/auth` → `sessionStorage`에 비밀번호 저장
- 이후 요청: `x-admin-password` 헤더로 전달
- API 라우트에서 `process.env.ADMIN_PASSWORD`와 비교

### Supabase 클라이언트 선택
```typescript
// 브라우저 클라이언트 컴포넌트
import { createClient } from '@/lib/supabase/client'

// 서버 컴포넌트 (cookies 필요)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// API 라우트 (service_role, 인증 불필요)
import { createServiceClient } from '@/lib/supabase/service'
const supabase = createServiceClient()
```

---

## 9. 코딩 컨벤션

- 컴포넌트: PascalCase, `components/` 폴더
- 섹션 컴포넌트: `S[번호]_[이름].tsx`
- 설정·상수: `lib/wedding-config.ts` (타입·기본값), `lib/constants.ts` (환경변수 래핑)
- API 라우트: 공개 읽기는 anon, 쓰기·삭제는 service_role
- 포인트 컬러: CSS 변수 `--gold: #C4A882`

---

## 10. 자주 쓰는 명령어

```bash
yarn dev      # 개발 서버 (localhost:3000)
yarn build    # 프로덕션 빌드
yarn lint     # ESLint
```

배포: `main` 브랜치에 push 하면 Vercel이 자동 빌드·배포.
