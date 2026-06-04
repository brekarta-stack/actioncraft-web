-- ============================================================
-- portfolio_items 홈 메인 노출 플래그 (2026-06-06)
--
-- 어드민에서 '메인' 체크박스로 토글 → 홈 "이런 걸 만듭니다"
-- 섹션에 노출. featured=TRUE 인 항목이 1개 이상이면 그것만
-- 보여주고, 0개면 기존 published 최신 9개 fallback.
--
-- 이 SQL 을 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- ============================================================

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

-- featured=TRUE 필터 인덱스 (부분 인덱스, 디스크 절약)
CREATE INDEX IF NOT EXISTS portfolio_items_featured_idx
  ON portfolio_items (featured)
  WHERE featured = TRUE;

DO $$
BEGIN
  RAISE NOTICE 'portfolio_items.featured 컬럼 추가 완료 (기본 FALSE)';
END $$;
