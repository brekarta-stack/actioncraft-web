-- ============================================================
-- portfolio_items 제작 시기 컬럼 (2026-06-10)
--
-- 노출 순서 제어용. 사이트(제작 사례·홈 메인)는
-- "제작 시기(없으면 등록일) 최신순"으로 정렬된다.
-- 어드민 목록의 '제작 시기' 입력 또는 편집 화면에서 지정.
-- 값이 없는 항목은 기존처럼 created_at 기준으로 정렬된다.
--
-- 이 SQL 을 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- ============================================================

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS produced_at DATE;

-- 정렬용 인덱스 (produced_at 없는 행은 created_at fallback이므로 부분 인덱스면 충분)
CREATE INDEX IF NOT EXISTS portfolio_items_produced_at_idx
  ON portfolio_items (produced_at DESC)
  WHERE produced_at IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE 'portfolio_items.produced_at 컬럼 추가 완료 (NULL 허용, 정렬 fallback=created_at)';
END $$;
