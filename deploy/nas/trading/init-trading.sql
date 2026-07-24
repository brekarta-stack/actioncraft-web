-- 매매 도메인 테이블 (D7 스켈레톤, 전부 IF NOT EXISTS — 재적용 안전)
-- 설계: C-5 — LLM 분석가는 trade_proposals에 INSERT만(읽기전용 권한 별도 롤은 실전 전 적용),
--       결정적 엔진만 orders/fills 기록. 멱등성은 공용 idempotency_keys(GD-2) 사용.

CREATE TABLE IF NOT EXISTS trade_proposals (
  id          BIGSERIAL PRIMARY KEY,
  source      TEXT NOT NULL,              -- analyst-morning | analyst-evening | manual | selftest
  market      TEXT NOT NULL,              -- KR | US
  symbol      TEXT NOT NULL,              -- 005930 | AAPL
  side        TEXT NOT NULL CHECK (side IN ('buy','sell')),
  qty         NUMERIC NOT NULL CHECK (qty > 0),
  limit_price NUMERIC NOT NULL CHECK (limit_price > 0),   -- 미국은 지정가만(§3-5) — 전 시장 지정가 통일
  rationale   TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',            -- pending|picked|rejected|done
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trade_proposals_status ON trade_proposals(status, created_at);

CREATE TABLE IF NOT EXISTS trade_orders (
  id            BIGSERIAL PRIMARY KEY,
  proposal_id   BIGINT REFERENCES trade_proposals(id),
  idem_key      TEXT NOT NULL UNIQUE,     -- idempotency_keys.key 와 동일 값
  state         TEXT NOT NULL,            -- VALIDATED|SUBMITTED|FILLED|REJECTED|CANCELLED|FAILED
  broker        TEXT NOT NULL,            -- mock | kis-paper | kis-live
  broker_order_id TEXT,
  filled_qty    NUMERIC NOT NULL DEFAULT 0,
  avg_price     NUMERIC,
  reject_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 일손실한도 계산용 (엔진이 체결 시 기록; 실현손익은 실전 단계에서 정교화)
CREATE TABLE IF NOT EXISTS trade_daily_pnl (
  trade_date  DATE PRIMARY KEY,
  realized_krw NUMERIC NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
