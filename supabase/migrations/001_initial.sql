CREATE TABLE wedding_guestbook (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS 비활성: 누구나 읽기·쓰기 가능 (공개 청첩장)
-- 삭제는 서버 사이드에서 service_role key로만 처리
