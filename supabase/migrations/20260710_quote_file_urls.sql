-- ============================================================
-- quotes 테이블 첨부파일 URL 컬럼 추가 (2026-07-10)
--
-- 배경: 그동안 견적 폼은 첨부파일의 "파일명"만 저장하고 실제 파일은
--       업로드하지 않았다(브라우저에서 바이트를 버림). 그래서 어드민에서
--       고객이 올린 파일을 열 수 없었다.
--
-- 이 마이그레이션 이후: 폼이 파일을 Supabase Storage(uploads 버킷)에
--       실제 업로드하고, 그 공개 URL을 아래 두 컬럼에 저장한다.
--   - file_url      : 참고 자료 파일의 공개 URL
--   - logo_file_url : 회사 로고 파일의 공개 URL (선택)
--
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요. 멱등 (여러 번 실행 OK).
-- ============================================================

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS file_url      TEXT,
  ADD COLUMN IF NOT EXISTS logo_file_url TEXT;

DO $$
BEGIN
  RAISE NOTICE 'quotes 테이블에 file_url / logo_file_url 컬럼 추가 완료';
END $$;
