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

-- ============================================================
-- RLS (Row Level Security) 활성화
-- 서버는 service_role 키 사용 → RLS 자동 우회
-- 외부에서 anon 키로 직접 접근 시 아래 정책만 허용
-- ============================================================

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes           ENABLE ROW LEVEL SECURITY;

-- portfolio_items: 공개된 항목만 anon 읽기 허용 (쓰기는 service_role만)
DROP POLICY IF EXISTS "Public read published portfolio" ON portfolio_items;
CREATE POLICY "Public read published portfolio"
  ON portfolio_items FOR SELECT TO anon
  USING (published = true);

-- posts: 공개된 포스트만 anon 읽기 허용 (쓰기는 service_role만)
DROP POLICY IF EXISTS "Public read published posts" ON posts;
CREATE POLICY "Public read published posts"
  ON posts FOR SELECT TO anon
  USING (published = true);

-- quotes: anon 접근 전면 차단 (삽입 포함) — 모든 접근은 service_role을 통해서만
-- (견적 폼 → /api/quote → supabaseAdmin 경유)
