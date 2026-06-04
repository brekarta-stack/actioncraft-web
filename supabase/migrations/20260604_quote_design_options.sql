-- ============================================================
-- quotes 테이블 견적 폼 디자인 옵션 확장 (2026-06-04)
--
-- 새 필드 3개:
--   - style_type      : 디자인 스타일 (realism / characterize / expert)
--   - product_text    : 제품에 삽입할 문구
--   - logo_file_name  : 회사 로고 파일명 (선택)
--
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요. 멱등 (여러 번 실행 OK).
-- ============================================================

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS style_type     TEXT,
  ADD COLUMN IF NOT EXISTS product_text   TEXT,
  ADD COLUMN IF NOT EXISTS logo_file_name TEXT;

DO $$
BEGIN
  RAISE NOTICE 'quotes 테이블에 style_type / product_text / logo_file_name 컬럼 추가 완료';
END $$;
