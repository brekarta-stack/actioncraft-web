-- Postgres 초기화 (최초 1회, docker-entrypoint-initdb.d). D2.
-- n8n 자체 테이블은 n8n이 생성. 여기선 우리 도메인 테이블만.

CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector (RAG 임베딩용)

-- GD-2 멱등성: 매매·발행·이메일 부작용 1회 보장
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key        TEXT PRIMARY KEY,           -- trade:{...} | publish:{...} | email:{...}
  kind       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',   -- pending|done|failed
  result     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 실행 전: INSERT ... ON CONFLICT (key) DO NOTHING → 0행이면 "이미 처리됨" → 스킵

-- 어학 표현 (voicebridge → 간격반복 퀴즈로 소비)
CREATE TABLE IF NOT EXISTS expressions (
  id          BIGSERIAL PRIMARY KEY,
  lang        TEXT NOT NULL,             -- en|ja
  original    TEXT NOT NULL,             -- 내 표현
  correction  TEXT,                      -- 교정/대안
  tags        TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review TIMESTAMPTZ                -- 간격반복 스케줄
);

-- 리드 (파트 정의 테이블 기반 공용 파이프라인)
CREATE TABLE IF NOT EXISTS leads (
  id         BIGSERIAL PRIMARY KEY,
  business   TEXT NOT NULL,              -- biz-a|biz-b|biz-c
  company    TEXT,
  contact    TEXT,
  source     TEXT,
  score      NUMERIC,
  status     TEXT NOT NULL DEFAULT 'new',
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_business_status ON leads(business, status);

-- 학습 아카이브 (수집→요약→임베딩)
CREATE TABLE IF NOT EXISTS archive (
  id         BIGSERIAL PRIMARY KEY,
  source     TEXT,
  title      TEXT,
  body       TEXT,
  summary    TEXT,
  embedding  vector(1024),              -- BGE-M3 dense 차원(1024, 확인됨)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ANN 인덱스(L1): 아카이브 커지면 풀스캔 방지. 코사인 기준.
CREATE INDEX IF NOT EXISTS idx_archive_embedding
  ON archive USING hnsw (embedding vector_cosine_ops);
