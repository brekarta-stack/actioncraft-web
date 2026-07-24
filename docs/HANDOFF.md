# 인수인계 — 로컬 Claude Code 세션용 (2026-07-24)

> **누가 읽나**: 사용자의 **Mac Studio 또는 NAS에서 로컬로 실행되는 Claude Code 세션**.
> (클라우드 세션은 사용자 기기에 접근 못 함 → 로컬 세션이 남은 인프라 작업을 직접 실행한다.)
> **시작 시 반드시 먼저 읽기**: `docs/CLAUDE.md`(설계 마스터·불변원칙), `deploy/STATE.md`(현재 상태), `deploy/REVIEW-FIXES.md`(적대검증 결과).
> **작업 방식**: 셸 작업은 직접 실행(복사·붙여넣기 왕복 없이). 위험/비가역 작업만 사용자 확인.

## 접근 정보
- **NAS SSH**: `ssh 오세기@172.30.1.10` (LAN) 또는 `ssh 오세기@100.86.100.119` (Tailscale). Docker는 `sudo docker`(계정이 docker 그룹 아님). 배포 폴더 `~/agent-backbone`.
- **Studio**: 로컬 셸. ollama가 `100.65.201.6:11434`(Tailscale)에 상시. 모델 4종 상주.
- **Tailscale**: macstudio 100.65.201.6 · nas 100.86.100.119 · mini 100.67.146.83 · node(win) 100.104.71.7.
- **git 원격**: `brekarta-stack/actioncraft-web`, 브랜치 `claude/mac-agent-subscription-comparison-5vFfQ`. NAS엔 git 없음(부트스트랩으로 배포함).

## 지금까지 완료 (건드리지 말 것, 검증됨)
- Studio 로컬 티어: ollama 4종(qwen2.5:7b·qwen3.6:35b-a3b·qwen3-coder:30b·bge-m3), 재부팅 생존, curl 통과.
- NAS 백본: `~/agent-backbone`에 compose 배포. postgres(healthy, 스키마 로드)·litellm(:4000)·n8n(:5679)·uptime-kuma(:3001) 4개 Up, 전부 `restart:unless-stopped`. Tailscale은 `tailgate-tailscale-1`(host 모드).
- **검증됨**: `curl litellm classify-fast` → Studio qwen2.5:7b → 한국어 응답. Kuma 모니터 3개(studio-ollama·n8n·litellm) 그린.
- `.env`의 `N8N_ENCRYPTION_KEY`는 사용자가 패스워드매니저에 백업(확인 요망).

## 남은 작업 (순서대로) — [자동]=로컬세션이 직접 / [사람]=사용자 필요

### 1. Kuma → Slack 알림 [사람: 웹훅 URL 확보 → 자동: 나머지 없음, GUI]
- 웹훅은 Slack #agent-log용(사용자 확보). Kuma 설정>알림>Slack에 등록 → 3모니터 연결. (GUI라 사용자 클릭.)

### 2. 외부 하트비트 (NAS 자체 감시) [사람: healthchecks.io 가입 → 자동: cron 연결]
- healthchecks.io 무료 가입 → ping URL 발급(사람). 그 URL을 NAS cron으로 5분마다 curl(자동). Kuma가 못 잡는 "NAS 다운"을 커버.

### 3. LiteLLM 클라우드 티어 [사람: API 키 → 자동: .env 갱신·재시작·검증]
- 사용자가 ANTHROPIC/MOONSHOT 키 발급(`deploy/llm-api-keys.md`). 키 받으면 `~/agent-backbone/.env`에 넣고 `sudo docker compose up -d litellm` 재시작 → `write-ko-final`(claude) 호출로 폴백·프런티어 검증(자동).

### 4. 백업 3-2-1 [자동 대부분]
- NAS에 daily cron: `pg_dump` + n8n 워크플로 export + `N8N_ENCRYPTION_KEY` 사본 → 로컬(다른 volume) + **오프사이트 B2**(사용자: B2 계정·키). restic 재사용 검토(미니의 backup-restic 패턴). 2주차 말 복원 리허설.

### 5. 독립 n8n 컨테이너 정리 [자동: 확인 후, 사람: 유지/삭제 결정]
- `sudo docker logs n8n --tail 30`으로 정체 확인. 잔재면 `sudo docker rm -f n8n` 후 우리 n8n을 5678로 복귀(compose 수정+up). 필요한 거면 5679 유지. **삭제는 사용자 확인 후**(대체 검증 전 삭제 금지 원칙).

### 6. 미니 하드코딩 감사 [자동]
- 미니 제거 전, 미니의 40잡/스크립트에서 미니 자신의 IP·호스트네임 하드코딩 스캔(→ MagicDNS로 교체 대상 목록화). `~/agents`, launchd plist grep.

### 7. UGOS Docker 자동시작 확인 [자동: 검증]
- `sudo docker inspect -f '{{.Name}} {{.HostConfig.RestartPolicy.Name}}'` 이미 unless-stopped 확인됨. 실제 재부팅 후 복구는 다음 계획된 재부팅 때 확인.

### 🚧 8. 도메인 게이트 [사람: 결정] → 그 후 파이프라인 [자동+사람]
- 사용자가 `docs/domain-definition-template.md` + `docs/channel-reorg-proposal.md`(O/X) 채움. 그 전엔 사업 파이프라인 착수 금지.
- 채워지면 `deploy/pipelines/part-definitions.yaml` 생성 → 공용 플로우 3종(lead-gen·blog·quote) n8n 구현. 도메인 독립(일정·매매·어학)은 게이트 안 기다리고 착수 가능.

## 불변 원칙 (docs/CLAUDE.md §불변)
멀티모델(탈클로드) · 운영은 API/로컬 무중단 · LLM 직접 주문권한 금지 · 2주·초보 제약 · 과잉설계 금지 · 대체 검증 전 삭제 금지("켜기 전에 끈다") · 대외 산출물=프런티어 고정.

## 세션 종료 시
진척을 `deploy/STATE.md`에 갱신하고 커밋·푸시. 다음 세션(로컬이든 클라우드든) 맥락 연속성 확보.
