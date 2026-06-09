-- 견적(quotes)에 광고 유입정보(gclid·UTM) 저장
--   목적: 검색광고 전환 측정 + 구글 오프라인 전환 임포트(gclid 기반) + 캠페인별 수주 분석
--   배경: instrumentation-client.ts 가 세션 첫 진입의 gclid/UTM 을 sessionStorage 에 잡아두고,
--         견적 제출 시 /api/quote 본문에 함께 보낸다.
--   안전: /api/quote 는 이 컬럼이 없어도 제출이 실패하지 않도록 best-effort 로만 기록한다.
--         (이 마이그레이션을 적용한 이후부터 실제로 값이 저장된다)
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS acquisition JSONB;

COMMENT ON COLUMN quotes.acquisition IS
  '광고 유입정보 {referrer,utmSource,utmMedium,utmCampaign,gclid,adHint}. 구글 오프라인 전환 임포트(gclid)·캠페인별 수주 분석용.';
