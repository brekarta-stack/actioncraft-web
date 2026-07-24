-- 매매 도메인 테이블 (D7 스켈레톤 v2 — 적대 리뷰 반영판)
-- ⚠️ 스켈레톤 단계 한정: DROP 후 재생성(현재 데이터=selftest뿐). 실데이터가 생기는 KIS 단계부터는
--    추가형(additive) 마이그레이션으로 전환할 것 — 그때부터 이 파일에 DROP 금지.
-- 리뷰 반영: NaN/Infinity CHECK(A1) · client_key 의도-단위 멱등(A7) · state CHECK(A9) · analyst 롤(B12)

DROP TABLE IF EXISTS trade_orders CASCADE;
DROP TABLE IF EXISTS trade_proposals CASCADE;
DROP TABLE IF EXISTS trade_daily_pnl CASCADE;
-- 테이블 리셋 시 공유 멱등키의 trade 항목도 함께 리셋(안 하면 재시작된 proposal id가 과거 키와 충돌).
-- ⚠️ 이 DELETE도 스켈레톤 한정 — 추가형 마이그레이션 전환 시 함께 제거.
DELETE FROM idempotency_keys WHERE kind = 'trade';

CREATE TABLE trade_proposals (
  id          BIGSERIAL PRIMARY KEY,
  client_key  TEXT UNIQUE,                -- 제안자(n8n 등)가 채우는 결정적 키 — 재시도 INSERT의 중복 행 차단(A7)
  source      TEXT NOT NULL,              -- analyst-morning | analyst-evening | manual | selftest
  market      TEXT NOT NULL,
  symbol      TEXT NOT NULL,
  side        TEXT NOT NULL CHECK (side IN ('buy','sell')),
  qty         NUMERIC NOT NULL CHECK (qty > 0 AND qty <> 'NaN'::numeric AND qty < 'Infinity'::numeric),
  limit_price NUMERIC NOT NULL CHECK (limit_price > 0 AND limit_price <> 'NaN'::numeric AND limit_price < 'Infinity'::numeric),
  rationale   TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','picked','rejected','done')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_trade_proposals_status ON trade_proposals(status, created_at);

CREATE TABLE trade_orders (
  id            BIGSERIAL PRIMARY KEY,
  proposal_id   BIGINT REFERENCES trade_proposals(id),
  idem_key      TEXT NOT NULL UNIQUE,
  state         TEXT NOT NULL CHECK (state IN ('VALIDATED','SUBMITTED','FILLED','REJECTED','CANCELLED','FAILED')),
  broker        TEXT NOT NULL,
  broker_order_id TEXT,
  filled_qty    NUMERIC NOT NULL DEFAULT 0 CHECK (filled_qty <> 'NaN'::numeric),
  avg_price     NUMERIC,
  reject_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 일손실한도 데이터원(A2: 엔진 FILLED 트랜잭션이 UPSERT — core.record_fill_pnl).
-- "하루" = KST 기준((now() AT TIME ZONE 'Asia/Seoul')::date) — B16.
CREATE TABLE trade_daily_pnl (
  trade_date  DATE PRIMARY KEY,
  realized_krw NUMERIC NOT NULL DEFAULT 0 CHECK (realized_krw <> 'NaN'::numeric),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B12: LLM 분석가 경로용 최소권한 롤(제안 INSERT만). LOGIN/비밀번호는 KIS 단계에서 사용자가 부여.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'trade_analyst') THEN
    CREATE ROLE trade_analyst NOLOGIN;
  END IF;
END $$;
GRANT SELECT, INSERT ON trade_proposals TO trade_analyst;
GRANT USAGE ON SEQUENCE trade_proposals_id_seq TO trade_analyst;
-- (trade_orders/idempotency_keys에는 권한 없음 — 계약 1의 DB 레벨 최소권한)
