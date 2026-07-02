-- Phase 2: 챗봇 RAG 스키마

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 청첩장(테넌트) 정보 + LiteLLM virtual key 매핑
CREATE TABLE IF NOT EXISTS invitations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  couple_name      text NOT NULL,
  litellm_key_id   text,
  budget_limit     numeric(10, 4) DEFAULT 5.0,
  created_at       timestamptz DEFAULT now()
);

-- 청첩장별 원문 지식 조각
CREATE TABLE IF NOT EXISTS documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  source_type    text NOT NULL, -- 예: 'venue', 'parking', 'account', 'meal', 'contact'
  content        text NOT NULL,
  updated_at     timestamptz DEFAULT now()
);

-- pgvector 임베딩 (Google text-embedding-004, 768차원)
CREATE TABLE IF NOT EXISTS embeddings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text     text NOT NULL,
  embedding      vector(768) NOT NULL
);

-- 대화 이력 및 비용 추적
CREATE TABLE IF NOT EXISTS chat_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id     uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  question          text NOT NULL,
  answer            text NOT NULL,
  matched_doc_ids   uuid[],
  tokens_used       integer,
  cost              numeric(10, 6),
  created_at        timestamptz DEFAULT now()
);

-- 유사도 검색 RPC 함수 (Vercel API에서 호출)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding  vector(768),
  invitation_slug  text,
  match_threshold  float DEFAULT 0.5,
  match_count      int   DEFAULT 5
)
RETURNS TABLE (
  id         uuid,
  chunk_text text,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    e.id,
    e.chunk_text,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM embeddings e
  JOIN documents d  ON d.id = e.document_id
  JOIN invitations i ON i.id = d.invitation_id
  WHERE i.slug = invitation_slug
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 벡터 검색 성능용 인덱스 (ivfflat, 데이터 100건 이상부터 유효)
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx
  ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- invitations slug 검색 인덱스
CREATE INDEX IF NOT EXISTS invitations_slug_idx ON invitations (slug);
