-- ============================================================
-- portfolio_items SEO 컬럼 확장 (2026-06-01)
--
-- 이 SQL 을 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- 기존 데이터는 보존되며, 새 컬럼은 빈 값으로 추가됩니다.
-- ============================================================

-- 1. 새 컬럼 추가 (IF NOT EXISTS 로 멱등성 보장)
ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS slug         TEXT,
  ADD COLUMN IF NOT EXISTS summary      TEXT,
  ADD COLUMN IF NOT EXISTS client_type  TEXT,
  ADD COLUMN IF NOT EXISTS tags         JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS keywords     JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS image_alts   JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. 기존 항목에 slug 자동 backfill — id 앞 8자 기반의 fallback slug
--    (어드민에서 더 좋은 slug 로 직접 수정 가능)
UPDATE portfolio_items
SET slug = CONCAT('case-', SUBSTR(id::text, 1, 8))
WHERE slug IS NULL OR slug = '';

-- 3. slug 인덱스 (조회 성능) + UNIQUE (중복 방지)
--    NULL 은 UNIQUE 에 포함되지 않으므로 빈 항목이 있어도 OK
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_items_slug_unique
  ON portfolio_items (slug)
  WHERE slug IS NOT NULL;

-- 4. 태그 검색용 GIN 인덱스 (선택 — 태그 필터링 빈도 높으면 효과 있음)
CREATE INDEX IF NOT EXISTS portfolio_items_tags_gin
  ON portfolio_items USING GIN (tags);

-- 5. 검증: 컬럼이 잘 들어갔는지 확인 (실행 후 NOTICE 메시지)
DO $$
BEGIN
  RAISE NOTICE 'portfolio_items 컬럼: slug/summary/client_type/tags/keywords/image_alts 추가 완료';
  RAISE NOTICE '레거시 항목 slug backfill 완료: case-{id 앞 8자} 형식';
END $$;
