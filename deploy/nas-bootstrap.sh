#!/bin/bash
# NAS 백본 자기완결 부트스트랩 — SSH로 붙여넣기. 설정파일 생성 + 다음 단계 안내.
# 자동 생성됨(레포 deploy/nas/* 기준). 데이터는 명명 볼륨이라 작업폴더는 아무데나 OK.
set -u
DIR="$HOME/agent-backbone"
mkdir -p "$DIR" && cd "$DIR" || exit 1
echo "작업 폴더: $DIR"

cat > docker-compose.yml <<'BOOTSTRAP_EOF'
# NAS 백본 (D2) — n8n + Postgres(pgvector) + LiteLLM + Uptime Kuma
# 버전 핀: 2026-07-23 리서치로 확정. 설치 시 n8n 패치·LiteLLM 주간마이너만 재확인 권장.
# 원칙: restart:unless-stopped(UGOS 월례 재시작 대비) · TZ=Asia/Seoul · 포트포워딩 금지(Tailscale 전용)
# 쓰기 데이터는 전부 명명 볼륨(UGOS 바인드마운트 권한오류 회피). 설정파일만 read-only 바인드.
name: agent-backbone

services:
  postgres:
    image: pgvector/pgvector:0.8.5-pg17-bookworm   # pgvector 0.8.5 + PG17 (Qdrant 대신 pgvector — C3)
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${PG_USER}
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: ${PG_DB}
      TZ: Asia/Seoul
    volumes:
      - pgdata:/var/lib/postgresql/data                         # 명명 볼륨(UGOS 바인드마운트 권한오류 회피 — M2)
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro   # ⚠️ 볼륨이 비었을 때만 1회 실행(M1)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PG_USER} -d ${PG_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    # 포트 미노출 — 컨테이너 이름 'postgres'로만 접근 (C6 IP 안정화)

  n8n:
    image: n8nio/n8n:2.32.2                  # 2.x 안정선(신규 설치라 1.x→2.x 마이그레이션 이슈 없음)
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: ${PG_DB}
      DB_POSTGRESDB_USER: ${PG_USER}
      DB_POSTGRESDB_PASSWORD: ${PG_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}   # ★ 별도 백업 필수(없으면 크리덴셜 복구 불가)
      GENERIC_TIMEZONE: Asia/Seoul
      TZ: Asia/Seoul
      N8N_HOST: ${N8N_HOST}                 # Tailscale MagicDNS 호스트네임 (IP 하드코딩 금지)
      N8N_PROTOCOL: http
      N8N_PORT: "5678"
      N8N_SECURE_COOKIE: "false"            # ★ HTTP+비localhost 호스트에서 로그인 튕김 방지(C1). Tailscale이 이미 암호화
      N8N_DIAGNOSTICS_ENABLED: "false"      # 텔레메트리 off
      N8N_RUNNERS_ENABLED: "true"           # 태스크 러너(권장)
    volumes:
      - n8ndata:/home/node/.n8n            # 명명 볼륨(UGOS 권한오류 회피)
    ports:
      - "${NAS_TS_IP}:5678:5678"            # ★ Tailscale IP에만 바인딩(H1) — 0.0.0.0=LAN 전체 노출 방지

  litellm:
    image: ghcr.io/berriai/litellm:v1.93.0   # 평문 SemVer 핀(main-stable은 폐기됨 — 쓰지 말 것)
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    command: ["--config", "/app/config.yaml", "--num_workers", "1"]
    environment:
      LITELLM_MASTER_KEY: ${LITELLM_MASTER_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      MOONSHOT_API_KEY: ${MOONSHOT_API_KEY}
      STUDIO_OLLAMA_BASE: ${STUDIO_OLLAMA_BASE}   # litellm config가 os.environ/로 참조(L3)
      DATABASE_URL: postgresql://${PG_USER}:${PG_PASSWORD}@postgres:5432/${PG_DB}   # 예산·키관리 UI 활성
      TZ: Asia/Seoul
    volumes:
      - ./litellm-config.yaml:/app/config.yaml:ro
    mem_limit: 1g                           # 메모리릭 방어(주기 재시작은 restart 정책이 커버)
    ports:
      - "${NAS_TS_IP}:4000:4000"            # Tailscale IP 전용(H1)

  uptime-kuma:
    image: louislam/uptime-kuma:2           # v2 GA(루트리스 기본). NAS 안 컨테이너·플로우 감시(NAS 자체는 외부 클라우드 모니터가 감시)
    restart: unless-stopped
    environment:
      TZ: Asia/Seoul
    volumes:
      - kumadata:/app/data                  # 명명 볼륨(루트리스+UGOS 권한 안전)
    ports:
      - "${NAS_TS_IP}:3001:3001"            # Tailscale IP 전용(H1)

volumes:
  pgdata:                                   # 명명 볼륨(M2)
  n8ndata:
  kumadata:

# 매매 엔진(python-kis)은 커스텀 코드라 D7에 별도 서비스로 추가(격리 컨테이너, GD-1).
# 백업 데몬(pg_dump→restic→B2)은 D5에 추가.
# 포트 노출 주의(H1): NAS_TS_IP에만 바인딩 → LAN·공인망 모두 차단, Tailscale 내부만 접근.
BOOTSTRAP_EOF
echo "  생성: docker-compose.yml"

cat > litellm-config.yaml <<'BOOTSTRAP_EOF'
# LiteLLM 라우팅 (D3) — 역할 별칭 = model_name, 폴백 체인은 router_settings.fallbacks
# 모델 ID: 2026-07-23 리서치 확정. gpt-5.6-*·kimi-k2.6은 빠르게 변하니 설치 시 재확인 권장.
# STUDIO_OLLAMA_BASE는 컨테이너 env로 주입(compose). Anthropic ID는 날짜접미사 붙이지 말 것.

model_list:
  # ── 로컬 티어 (Studio ollama, 상시) ──
  - model_name: classify-fast          # 태깅·분류·리드 1차 스코어링 (고volume 저비용)
    litellm_params:
      model: ollama_chat/qwen2.5:7b
      api_base: os.environ/STUDIO_OLLAMA_BASE
  - model_name: summarize
    litellm_params:
      model: ollama_chat/qwen3.6:35b-a3b     # T1 실측 83 tok/s
      api_base: os.environ/STUDIO_OLLAMA_BASE
  - model_name: write-ko-draft         # 블로그·SNS 초안(한국어)
    litellm_params:
      model: ollama_chat/qwen3.6:35b-a3b
      api_base: os.environ/STUDIO_OLLAMA_BASE
  - model_name: code-fast              # n8n 노드·스크립트·표준 리팩터링
    litellm_params:
      model: ollama_chat/qwen3-coder:30b
      api_base: os.environ/STUDIO_OLLAMA_BASE
  - model_name: embed                  # ⚠️ 임베딩은 폴백 금지 — 모델마다 벡터공간이 달라 교차폴백=검색 파괴.
    litellm_params:                    #    (BGE-M3=1024차원 vs OpenAI=1536차원, 컬럼도 vector(1024).)
      model: ollama/bge-m3             #    Studio 다운 시엔 임베딩 잡을 큐잉/대기(비실시간이라 허용). 클라우드 폴백 제거.
      api_base: os.environ/STUDIO_OLLAMA_BASE

  # ── 프런티어(대외·돈·최난도) — 프리미엄 1순위 고정 ──
  - model_name: write-ko-final         # 대외 발행물 최종 퇴고 (T1: 로컬 대외문서 금지 근거)
    litellm_params:
      model: anthropic/claude-sonnet-5           # ← 현재 ID 확인
  - model_name: code-max               # 매매 로직 등 최난도·고신뢰 코딩
    litellm_params:
      model: anthropic/claude-opus-4-8           # ← 현재 ID 확인
  - model_name: analyst-trading        # 주식 분석(읽기전용)
    litellm_params:
      model: anthropic/claude-sonnet-5
  - model_name: quote-legal            # 견적·계약 문안
    litellm_params:
      model: anthropic/claude-sonnet-5

  # ── 폴백용 concrete 엔드포인트 ──
  - model_name: kimi-cheap             # 대량 저가 + 로컬 백스톱(재부팅 창). LiteLLM moonshot 프로바이더가 MOONSHOT_API_KEY 자동 사용
    litellm_params:
      model: moonshot/kimi-k2.6                   # ~$0.6/$2.5 per M, 256K context
  - model_name: gpt-frontier           # 프리미엄 교차검증/폴백 (플래그십)
    litellm_params:
      model: openai/gpt-5.6-sol

router_settings:
  # 폴백 체인: 로컬 1순위 → 클라우드 저가 → (필요시) 프런티어
  fallbacks:
    - {"classify-fast":   ["kimi-cheap"]}
    - {"summarize":       ["kimi-cheap"]}
    - {"write-ko-draft":  ["kimi-cheap"]}
    - {"code-fast":       ["kimi-cheap", "code-max"]}
    - {"write-ko-final":  ["gpt-frontier"]}
    - {"code-max":        ["gpt-frontier"]}
    - {"analyst-trading": ["gpt-frontier"]}
    - {"quote-legal":     ["gpt-frontier"]}
  # embed는 폴백 없음(벡터공간 불일치 방지 — 위 주석). Studio 다운 시 임베딩 잡은 대기.
  timeout: 20                          # ollama 콜드스타트 대비(≥15s)
  num_retries: 1

litellm_settings:
  drop_params: true                    # 미지원 param 무시(엔진 간 호환)
  # ollama 폴백 stream 버그(#6294) 회피: n8n 호출은 비스트리밍으로 보낼 것(요청 측 설정)
  # 예산캡: 별칭별 월 상한은 LiteLLM Admin UI에서 가상 키(virtual key)에 max_budget으로 설정.
  #   워크플로별 가상 키 발급 → 80% 경고(웹훅→#ops)/100% 도달 시 해당 키 차단→상위 폴백 자동 강등.

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL      # 예산·사용량 집계 UI
BOOTSTRAP_EOF
echo "  생성: litellm-config.yaml"

cat > init-db.sql <<'BOOTSTRAP_EOF'
-- Postgres 초기화 (최초 1회, docker-entrypoint-initdb.d). D2.
-- n8n 자체 테이블은 n8n이 생성. 여기선 우리 도메인 테이블만.

CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector (RAG 임베딩용)

-- GD-2 멱등성: 매매·발행·이메일 부작용 1회 보장
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key        TEXT PRIMARY KEY,           -- trade:{...} | publish:{...} | email:{...}
  kind       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',   -- pending|done|failed
  result     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 실행 전: INSERT ... ON CONFLICT (key) DO NOTHING → 0행이면 "이미 처리됨" → 스킵

-- 어학 표현 (voicebridge → 간격반복 퀴즈로 소비)
CREATE TABLE IF NOT EXISTS expressions (
  id          BIGSERIAL PRIMARY KEY,
  lang        TEXT NOT NULL,             -- en|ja
  original    TEXT NOT NULL,             -- 내 표현
  correction  TEXT,                      -- 교정/대안
  tags        TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review TIMESTAMPTZ                -- 간격반복 스케줄
);

-- 리드 (파트 정의 테이블 기반 공용 파이프라인)
CREATE TABLE IF NOT EXISTS leads (
  id         BIGSERIAL PRIMARY KEY,
  business   TEXT NOT NULL,              -- biz-a|biz-b|biz-c
  company    TEXT,
  contact    TEXT,
  source     TEXT,
  score      NUMERIC,
  status     TEXT NOT NULL DEFAULT 'new',
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_business_status ON leads(business, status);

-- 학습 아카이브 (수집→요약→임베딩)
CREATE TABLE IF NOT EXISTS archive (
  id         BIGSERIAL PRIMARY KEY,
  source     TEXT,
  title      TEXT,
  body       TEXT,
  summary    TEXT,
  embedding  vector(1024),              -- BGE-M3 dense 차원(1024, 확인됨)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ANN 인덱스(L1): 아카이브 커지면 풀스캔 방지. 코사인 기준.
CREATE INDEX IF NOT EXISTS idx_archive_embedding
  ON archive USING hnsw (embedding vector_cosine_ops);
BOOTSTRAP_EOF
echo "  생성: init-db.sql"

cat > .env <<'BOOTSTRAP_EOF'
# NAS 백본 시크릿 (실제 값은 ~/deploy/nas/.env 로 복사해 채우고 git에 넣지 말 것)
# .gitignore가 *.env 차단 확인. 실제 값은 패스워드 매니저에도 이중 보관.

# Postgres
PG_USER=agent
PG_PASSWORD=CHANGE_ME_strong_random
PG_DB=agent

# 네트워크 — 포트를 Tailscale IP에만 바인딩(H1). `tailscale ip -4`로 NAS의 100.x 주소 확인.
NAS_TS_IP=100.x.y.z                        # NAS의 Tailscale IPv4 (LAN IP 아님)
STUDIO_OLLAMA_BASE=http://100.a.b.c:11434  # Studio의 Tailscale IP:11434 (litellm이 참조)

# n8n — ★ 이 키는 별도 위치(패스워드 매니저)에 반드시 백업. 분실 시 크리덴셜 복구 불가.
N8N_ENCRYPTION_KEY=CHANGE_ME_32byte_random
N8N_HOST=nas.YOUR-TAILNET.ts.net          # Tailscale MagicDNS 이름

# LiteLLM
LITELLM_MASTER_KEY=sk-CHANGE_ME_random

# 모델 API 키 (종량제 — Claude Code 구독과 무관)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
MOONSHOT_API_KEY=

# 매매(D7~) — 읽기전용/실전 분리. 지금은 비워둠.
# KIS_APPKEY_PAPER=
# KIS_APPSECRET_PAPER=
# KIS_APPKEY_LIVE=
# KIS_APPSECRET_LIVE=
BOOTSTRAP_EOF
echo "  생성: .env"

echo ""
echo "=== 다음 (수동) ==="
echo "1) nano .env  → 실제 값 채우기:"
echo "   NAS_TS_IP=100.86.100.119"
echo "   STUDIO_OLLAMA_BASE=http://100.65.201.6:11434"
echo "   N8N_HOST=nas.<tailnet>.ts.net  (또는 100.86.100.119)"
echo "   PG_PASSWORD=\$(openssl rand -hex 24)"
echo "   N8N_ENCRYPTION_KEY=\$(openssl rand -hex 16)  ← 패스워드매니저에도 백업"
echo "   LITELLM_MASTER_KEY=sk-\$(openssl rand -hex 24)  ← sk- 접두 필수"
echo "   ANTHROPIC_API_KEY / MOONSHOT_API_KEY (있으면. 없으면 로컬만 동작)"
echo "2) docker compose up -d   (또는 sudo docker compose up -d)"
echo "3) docker compose ps      → 4개 up + postgres healthy"
