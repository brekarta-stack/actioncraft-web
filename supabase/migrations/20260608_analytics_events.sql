-- ============================================================
-- 유입·클릭 분석 이벤트 (2026-06-08)
--
-- 사이트 방문 경로(유입 출처)와 방문자가 클릭한 요소를 기록한다.
-- 외부 분석 도구(GA 등) 없이 자체 수집 → 어드민 /admin/analytics 에서 확인.
--
-- 수집 경로: 브라우저(src/instrumentation-client.ts)
--            → POST /api/track → supabaseAdmin(service_role) insert.
--
-- 개인정보 보호:
--   · IP·원본 User-Agent 는 저장하지 않는다 (device 는 mobile/desktop 만).
--   · 쿠키를 사용하지 않는다 (session_id 는 sessionStorage 의 익명 난수).
--   · session_id 는 개인 식별 불가능한 임시 토큰이다.
--
-- 이 SQL 을 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type          TEXT NOT NULL,                       -- 'pageview' | 'click'
  path          TEXT NOT NULL DEFAULT '',            -- 이벤트 발생 페이지 경로
  -- 유입 분석
  referrer      TEXT,                                -- 원본 document.referrer
  source        TEXT,                                -- 파싱된 유입 출처 (google/naver/instagram/direct…)
  medium        TEXT,                                -- organic | social | referral | direct | <utm_medium>
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  -- 클릭 분석
  label         TEXT,                                -- 클릭된 요소 라벨
  href          TEXT,                                -- 링크 목적지 (있으면)
  -- 공통
  session_id    TEXT,                                -- 익명 세션 식별자 (PII 아님)
  device        TEXT,                                -- 'mobile' | 'desktop'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 최근 데이터 조회용 인덱스
CREATE INDEX IF NOT EXISTS analytics_events_created_idx
  ON analytics_events (created_at DESC);

-- 타입별(pageview/click) + 기간 조회용 인덱스
CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
  ON analytics_events (type, created_at DESC);

-- ============================================================
-- RLS: 외부(anon) 접근 전면 차단.
-- 수집(insert)·조회(select) 모두 service_role 키를 통해서만 수행한다.
-- (수집: /api/track, 조회: /admin/analytics — 둘 다 supabaseAdmin 경유)
-- quotes 테이블과 동일한 정책: anon 정책을 만들지 않으면 RLS 가 모두 거부.
-- ============================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE 'analytics_events 테이블 준비 완료';
END $$;
