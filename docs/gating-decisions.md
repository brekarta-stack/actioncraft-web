# 게이팅 결정 (착수 전 반드시 닫을 3개) — 확정 2026-07-22

> design-maturity-checklist §착수전 3개를 이 세션 맥락(미니 제거·Studio 24/7·2기기)으로 확정.
> 형식: 결정 / 근거 / 구현 요지. 뒤집으려면 근거와 함께 ADR 추가.

## GD-1. 매매 엔진 위치 → **NAS 컨테이너** (확정)
- **결정**: python-kis 매매 엔진은 NAS의 격리 컨테이너에서 24/7 구동. (미니 제거로 대안 소멸 + NAS가 어플라이언스급 24/7)
- **근거**: ① 매매 엔진은 결정적 코드(LLM 추론 아님) → NAS CPU로 충분(추론 금지 규칙과 무관). ② 웹소켓 지연은 비HFT에 무의미(HFT는 시장교란·금지). ③ macOS 업데이트 재부팅이 미국 장중(KST 새벽)에 걸릴 위험을 NAS는 "자동업데이트 OFF + 장외 수동"으로 원천 차단. ④ 매매 상태·백업·관제가 n8n과 같은 Postgres·같은 백업에 일관.
- **구현**: 별도 컨테이너(매매 격리 원칙 유지), `restart:unless-stopped`, NAS 랜선 단절 시 **페일세이프 정지**(Kuma가 "NAS 연결끊김" 감지→매매 자동 halt), 주문 멱등성(GD-2)으로 컨테이너 재시작 생존.

## GD-2. 멱등성 (매매·발행·이메일 중복 방지) → **단일 키 테이블 + check-then-act** (확정)
- **결정**: Postgres 단일 테이블로 모든 부작용을 멱등 가드. 재시도해도 부작용 1회.
```sql
CREATE TABLE idempotency_keys (
  key        TEXT PRIMARY KEY,
  kind       TEXT NOT NULL,        -- trade | publish | email
  status     TEXT NOT NULL,        -- pending | done | failed
  result     JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- 실행 전: INSERT ... ON CONFLICT (key) DO NOTHING → 0행이면 "이미 처리됨" → 스킵
```
- **도메인별 키**:
  - **매매**: `trade:{strategy}:{signal_ts}:{symbol}:{side}` — 제출 전 pending 기록. **타임아웃 시 재제출 금지** → KIS 주문조회 + 체결통보(WS)로 대사. **SSOT=브로커(KIS)**, 우리 DB는 캐시.
  - **발행(블로그·SNS)**: `publish:{channel}:{sha256(정규화본문)}:{date}` — 발행 전 조회→있으면 스킵(이중게시 차단).
  - **이메일(견적)**: `email:{quote_id}:{recipient}:{version}` — 발송 전 기록. n8n 재시도가 재발송 안 함.
- **구현**: at-least-once 전달(n8n 재시도) + 멱등 소비자(키 테이블) = exactly-once **효과**. 매매엔진·n8n 둘 다 이 테이블을 참조.

## GD-3. RTO/RPO + LiteLLM 장애 시 매매 폴백 → **데이터 등급별 목표 + 엔진 LLM-옵셔널** (확정)
- **RTO/RPO (데이터 등급별)**:
  | 데이터 | SSOT | RPO(손실허용) | RTO(복구목표) |
  |---|---|---|---|
  | 매매 상태(포지션·주문) | **브로커 KIS** | ≈0 (재시작 시 KIS 잔고·주문조회로 대사) | 분 단위(컨테이너 재기동+대사) |
  | n8n 워크플로·크리덴셜 | pg_dump + export | 24h(야간 덤프) | ≈1h(git compose 재배포+덤프복원+N8N_ENCRYPTION_KEY) |
  | 아카이브·벡터(학습) | Postgres/pgvector | 24h | 낮음(수시간~일, 비핵심) |
  | 설정·IaC(compose·config·n8n export) | **git** | ≈0 | 분 단위 |
- **LiteLLM 장애 시 매매**: 엔진은 **LLM-옵셔널**(결정적 전략은 LLM 없이도 동작). 분석가 스텝만 LLM 사용 → **LiteLLM 1순위 → 다운/타임아웃 시 직접 API 우회 클라이언트**(하드코딩 Claude/GPT 키, 분석가 호출 전용). 둘 다 실패 시 엔진은 **최근 분석/순수 룰로 진행 + #ops 경고**, 불확실 크면 **halt(킬스위치)**. → 매매는 절대 LiteLLM에 블로킹되지 않음.
- **검증**: 2주차 말 복원 리허설 1회(compose 재배포→덤프복원→매매 대사→heartbeat 그린).
