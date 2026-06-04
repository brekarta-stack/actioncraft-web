-- ============================================================
-- quotes 테이블 제작 옵션 확장 (2026-06-05)
--
-- 새 필드 3개:
--   - sampling  : 샘플링 희망 (B2B 기업 주문 시 필수)
--   - rushed    : 최대한 빠르게 제작 (납품 희망일 대체)
--   - packaging : 포장 방식 (paper-box / opp / bulk)
--
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요. 멱등.
-- ============================================================

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS sampling  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rushed    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS packaging TEXT;

DO $$
BEGIN
  RAISE NOTICE 'quotes 테이블에 sampling / rushed / packaging 컬럼 추가 완료';
END $$;
