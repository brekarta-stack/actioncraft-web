-- ============================================================
-- PE Studio — Supabase 전체 스키마
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- ============================================================

-- 1. 포트폴리오 (제작 사례)
CREATE TABLE IF NOT EXISTS portfolio_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_id  TEXT,
  title        TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT '기타',
  description  TEXT NOT NULL DEFAULT '',
  client       TEXT NOT NULL DEFAULT '',
  images       JSONB NOT NULL DEFAULT '[]',
  published    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 블로그 포스트
CREATE TABLE IF NOT EXISTS posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL DEFAULT '',
  excerpt      TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  tag          TEXT NOT NULL DEFAULT '',
  emoji        TEXT NOT NULL DEFAULT '',
  cover_image  TEXT,
  published    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 견적 문의
CREATE TABLE IF NOT EXISTS quotes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product       TEXT,
  quantity      TEXT,
  delivery_date TEXT,
  purpose       TEXT,
  custom_design TEXT,
  color_request TEXT,
  notes         TEXT,
  name          TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  file_name     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 비활성화 (서버에서 service_role 키로만 접근)
ALTER TABLE portfolio_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts            DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes           DISABLE ROW LEVEL SECURITY;
