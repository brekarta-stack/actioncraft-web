-- ============================================================
-- 종이모형 스튜디오 도면 검수(review) 상태 (2026-07-07)
--
-- /admin/studio-review 백오피스에서 관리자가 도면을 하루에
-- 한 개씩 검수한다. 카탈로그(공개 index.json)에 있는 각 도면(skey)의
-- 검수 상태를 여기 저장한다. 행이 없으면 미검수(pending)로 본다.
--
--   status = 'approved' | 'rejected' | 'pending'
--   note   = 검수 메모(반려 사유 등)
--   reviewed_at = 마지막 검수 시각(하루 한 개 페이스 판정에 사용)
--   reviewer    = 검수자 이메일
--
-- 이 SQL 을 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- ============================================================

CREATE TABLE IF NOT EXISTS studio_reviews (
  skey        TEXT PRIMARY KEY,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  note        TEXT,
  reviewer    TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 상태별 집계(검수완료/미검수 카운트) 인덱스
CREATE INDEX IF NOT EXISTS studio_reviews_status_idx
  ON studio_reviews (status);

-- 최근 검수 순 조회 인덱스
CREATE INDEX IF NOT EXISTS studio_reviews_reviewed_at_idx
  ON studio_reviews (reviewed_at DESC);

-- 쓰기·조회 모두 service_role(supabaseAdmin) 경유 → anon 전면 차단
ALTER TABLE studio_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE 'studio_reviews 테이블 준비 완료';
END $$;
