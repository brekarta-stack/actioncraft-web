# D2 배포 초안 — 적대적 리뷰 & 수정 로그 (2026-07-22)

독립 리뷰어가 `docker compose up` 시 실제로 깨질 지점을 훑음. 발견·수정 내역.

| # | 심각도 | 문제 | 수정 |
|---|---|---|---|
| C1 | Critical | n8n이 HTTP+비localhost 호스트에서 secure-cookie 기본값 때문에 **로그인 무한 튕김** | `N8N_SECURE_COOKIE: "false"` (Tailscale이 이미 암호화) |
| C2 | Critical | ollama `launchctl setenv`는 **재부팅 시 소실** + brew services가 env 미승계 → NAS가 못 붙음 | 전용 LaunchAgent(`com.agent.ollama.plist`)에 `OLLAMA_HOST`·`KEEP_ALIVE=-1` 영속화 |
| H1 | High | published 포트가 **0.0.0.0 = LAN 전체 노출**("Tailscale 전용" 위배, LAN은 ACL 우회) | 포트를 `${NAS_TS_IP}:PORT:PORT`로 Tailscale IP에만 바인딩 |
| H2 | High | ollama 0.0.0.0 + macOS 앱 방화벽으로는 인터페이스 제한 불가, ollama 무인증 | Studio **Tailscale IP에 바인딩**(0.0.0.0 아님) |
| H3 | High | `.gitignore`의 `.env*`가 `.env.example`까지 무시 → 런북 `cp` 소스 부재 | `!.env.example`·`!*.env.example` 추가, 템플릿 추적 |
| H4 | High | 런북이 LiteLLM master key를 `sk-` 접두 없이 생성 → 가상키/인증 깨짐 | `echo "sk-$(openssl rand -hex 24)"` |
| M1 | Med | `init-db.sql`은 빈 볼륨에서만 1회 실행 → 재배포 시 스키마 누락(런타임 실패) | 기존 볼륨용 수동 적용 절차(§3-b) |
| M2 | Med | UGOS 공유폴더 바인드마운트 → Postgres uid 999 권한오류 빈발 | Postgres를 **명명 볼륨**으로 |
| M3 | Med | `embed` 별칭에 폴백 없음 → Studio 다운 시 임베딩 하드실패 | `embed-cloud`(OpenAI) 폴백 추가 |
| L1 | Low | pgvector ANN 인덱스 없음(스케일 시 풀스캔) | `hnsw (embedding vector_cosine_ops)` 인덱스 |
| L3 | Low | `STUDIO_HOST` 리터럴 5곳 수동치환 위험(LiteLLM은 os.environ만 확장) | `os.environ/STUDIO_OLLAMA_BASE` 단일 env |
| L4 | Low | UGOS 포트 충돌·컨테이너 자동시작 미확인 | 런북에 충돌 점검 + 자동시작 켜기 |
| L5 | Low | keep_alive 언급만 하고 미설정 | plist에 `OLLAMA_KEEP_ALIVE=-1` |

**리뷰어가 정상 확인(무수정)**: pgvector:pg16 태그 유효 · n8n DB_POSTGRESDB_* env 정확 · `mem_limit`가 compose v2 비스웜에 맞음 · depends_on healthcheck 문법 정확 · `ollama_chat/`(챗)+`ollama/bge-m3`(임베딩) 접두 정확 · router_settings.fallbacks 구조 현행 일치 · BGE-M3 1024차원 정확.

**여전히 "설치 시 확인" 잔여**: 모든 image 태그 현재 안정판 핀 · 모델ID(claude/gpt/kimi) 현재값 · L2(litellm·n8n DB 공유는 동작하나 장기적으로 분리 고려).

## 버전 핀 + 모델 ID 확정 (2026-07-23 리서치)
| 대상 | 확정 값 | 비고 |
|---|---|---|
| n8n | `n8nio/n8n:2.32.2` | 2.x 안정선(신규 설치라 마이그레이션 무관) |
| LiteLLM | `ghcr.io/berriai/litellm:v1.93.0` | **main-stable 폐기** → 평문 SemVer 핀 |
| Postgres | `pgvector/pgvector:0.8.5-pg17-bookworm` | PG17 안정 |
| Uptime Kuma | `louislam/uptime-kuma:2` | v2 GA(루트리스) |
| Claude 프런티어/최난도 | `claude-sonnet-5` / `claude-opus-4-8` | 날짜접미사 금지 |
| GPT 프런티어 | `gpt-5.6-sol` | (저가 필요시 gpt-5.6-luna) |
| Kimi 저가 | `moonshot/kimi-k2.6` | LiteLLM moonshot 프로바이더 |
| 임베딩 | `ollama/bge-m3`(1024) | **클라우드 폴백 제거**(벡터공간 불일치 — text-embedding-3-small은 1536차원) |

**추가로 잡은 버그**: embed 별칭에 클라우드 폴백(text-embedding-3-small)을 걸었던 것 → BGE-M3(1024)와 차원·벡터공간 불일치로 검색 파괴 → 제거. 임베딩은 단일 모델 원칙, Studio 다운 시 큐잉.
**설치 시 재확인**: n8n 패치·LiteLLM 주간마이너·gpt-5.6/kimi 정확한 ID(가장 빠르게 변함). 쓰기 데이터는 전부 명명 볼륨으로 전환(UGOS 권한 안전).
