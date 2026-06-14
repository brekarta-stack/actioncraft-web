-- ============================================================
-- 유입 분석: 검색 키워드 컬럼 추가 (2026-06-11)
--
-- keyword = 방문 시 검색어. 우선순위:
--   1) 광고 클릭의 utm_term (정확)       — 검색광고 키워드
--   2) referrer URL 의 검색 쿼리 파라미터 — 자연검색(대부분의 구글·네이버는
--      개인정보 보호로 제거되어 비어 있음)
-- /admin/analytics 의 "검색 키워드" 섹션에서 세션 단위로 집계된다.
--
-- 멱등 — 여러 번 실행해도 안전. Supabase 대시보드 > SQL Editor 에서 한 번 실행.
-- ============================================================

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS keyword TEXT;

DO $$
BEGIN
  RAISE NOTICE 'analytics_events.keyword 컬럼 추가 완료';
END $$;
