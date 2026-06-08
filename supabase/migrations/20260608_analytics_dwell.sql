-- ============================================================
-- 유입·클릭 분석: 페이지 체류 시간(dwell) 컬럼 추가 (2026-06-08)
--
-- type='dwell' 이벤트가 페이지 이탈(라우트 변경/탭 닫기) 시 해당 페이지의
-- 체류 시간(ms)을 기록한다. /admin/analytics 의 "평균 체류시간"·"방문자 여정"
-- 계산에 사용된다.
--
-- 멱등 — 여러 번 실행해도 안전. Supabase 대시보드 > SQL Editor 에서 한 번 실행.
-- ============================================================

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS duration_ms BIGINT;

DO $$
BEGIN
  RAISE NOTICE 'analytics_events.duration_ms 컬럼 추가 완료';
END $$;
