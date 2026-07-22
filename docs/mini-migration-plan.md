# 미니 40잡 이관표 (D1 산출물, 2026-07-22 인벤토리 기준)

> 원칙: "켜기 전에 끈다"(이중발송 방지) · 대체 검증 전 삭제 금지 · 폐기는 OFF 2주 후 삭제.
> 인벤토리 원본: 미니 `~/mini-inventory-20260722-2229.txt`

## 0. 🚨 이관보다 급한 것 — 백업 구멍 3개 (D1 즉시)

| 발견 | 위험 | 조치 |
|---|---|---|
| `~/agents` **미커밋 73개** (branch: feat/agent-skills-upgrade) | 5.1GB 핵심 시스템의 작업물이 미니 디스크에만 존재 | **즉시 commit+push** (원격 있음: brekarta-stack/agents) |
| `~/papercraft-studio` **git 아님** | 181M 서비스 코드가 버전관리 없음 | git init + 비공개 레포 생성·푸시 |
| `~/agent-config` **원격 없음** | 어제 rescue 커밋 포함 로컬에만 존재 | 비공개 레포 만들어 push |
| (보조) `~/voicebridge` 미커밋 2개 | 낮음 | commit+push |
| **NAS 미마운트** (/Volumes에 없음) + restic 타깃 불명 | 3:30 백업이 어디로 가는지 미확인 — 로컬로 가면 3-2-1 전부 미니 안 | restic plist·설정에서 타깃 확인 → B2 오프사이트 추가 |

## 1. NAS(n8n)로 이관 — 22개

| 잡 | 스케줄 | 이관 대상 | 시점 |
|---|---|---|---|
| morning-brief | 매일 9:00 | n8n 아침 브리핑 플로우 | P1 |
| learning-brief / learning-quiz / learning-youtube | 9:00/9:05/9:10 | 학습 파이프라인(수집→퀴즈→아카이빙) | P1 |
| bd-daily | 평일 8:00 | 사업 데일리 플로우 | P1 |
| sns-daily | 매일 8:30 | SNS 포스팅 플로우(승인 게이트 추가) | P1 |
| weekly-agenda | 월 10:00 | 일정 관리 플로우 | P1 |
| homework-watcher | 월 15:00 | 일정/할일 플로우 | P1 |
| proactive-nudge | 9/12/15/18시 | 브리핑 플로우에 통합 | P1 |
| google-token-check | 매일 7:30 | Kuma 체크 or n8n | P0(D4) |
| slack-health-check | 5분 | **Uptime Kuma가 대체** | P0(D4) |
| heartbeat(papercraft, deadman) | 5분 | **Uptime Kuma가 대체** | P0(D4) |
| failover | 30분 | Kuma 알림으로 대체(역할 확인 후) | P0(D4) |
| dashboard + dashboard-exposure-guard | 상시/30분 | NAS 서빙(or Kuma+Homepage로 대체) → guard는 소멸 | P1 |
| slack-bridge | 상시 | n8n Slack **Socket Mode**가 대체 | P1 |
| queue-worker | 상시 | NAS 큐(파이프라인 재설계에 흡수) | P1 |
| channel-council | 4/12/18시 | n8n 플로우 | P1~P2 |
| council-project-review / council-weekly-report | 일/금 12:00 | n8n 주간 리포트 | P1~P2 |
| agent-review / agent-audit | 4:00 / 10:30 | n8n 자기개선·감사 플로우 | P2 |
| invest-morning-report | 매일 9:30 | 매매 서비스의 LLM 분석가(장전 스케줄) | P2 |
| invest-poll | 15분 | 매매 서비스로 흡수 | P2 |
| backup-restic | 매일 3:30 | 유지하되 **타깃 확인 + B2 추가** → 장기 NAS 중심 재편 | P0 |

## 2. 미니 잔류 — 11개 (미니 존속 기간 동안)

| 잡 | 이유 |
|---|---|
| voicebridge | 마이크·스피커 하드웨어 |
| com.papercraft.tailscaled | 네트워크 기반 |
| caffeinate | 잠자기 방지(미니 존속 시) |
| com.brekarta.claude-tmux | Claude Code 원격 세션 keeper |
| studio-upload-worker + studio-worker-guard | papercraft.kr 서비스 연계 — **서비스 보존 원칙**(추후 NAS 이관 검토) |
| com.agent.heartbeat / com.agent.gitsync | 신규 관제층 — Kuma 안착 후 보완재로 유지 |
| com.agents.ollama | voicebridge/로컬 용도 사용 여부 확인 후 결정 |
| com.agents.docker | **내용 확인 필요** — `~/agents/docker/docker-compose.yml`에 뭐가 있는지 (이미 미니에 도커 스택 존재!) |

## 3. 폐기 — 5개 (OFF → 2주 관찰 → 삭제)

| 잡 | 근거 |
|---|---|
| com.agents.celery | 레거시 큐(로드맵 명시 삭제 대상) — exit 78로 이미 부팅 실패 중 |
| com.agents.slackbot | 레거시 봇 — Socket Mode n8n이 대체. exit 78 실패 중 |
| com.agent.hermes | 반쯤 설정된 잔재(실행 명령이 `notify.sh; notify`) — 즉시 OFF 가능 |
| com.papercraft.imgtest | 테스트 잡(스케줄 없음) |
| com.papercraft.qc-eval | 스케줄 없는 eval — 필요 시 수동 실행으로 |

## 4. 스케줄 참고 (이관 시 시간대 유지)

아침 러시: 7:30 토큰체크 → 8:00 bd → 8:30 sns → 9:00 브리핑×3 → 9:05 퀴즈 → 9:10 유튜브 → 9:30 인베스트 → 10:00(월) 아젠다.
야간: 3:30 백업 → 4:00 리뷰·카운슬. n8n 이관 시 동일 시각 배치(TZ=Asia/Seoul), 겹침 정리(9:00에 3개 동시)는 이관하면서 9:00/9:02/9:04로 분산.
