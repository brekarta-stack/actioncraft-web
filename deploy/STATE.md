# 배포 상태 체크포인트 (2026-07-24 저녁 — 로컬 세션 1차)

> 확정된 실측값 기록(비밀 아님). 이전 체크포인트(07-23)를 대체.

## 확정 값
```
NAS_TS_IP=100.86.100.119
STUDIO_OLLAMA_BASE=http://100.65.201.6:11434
NAS SSH: Studio에서 `ssh nas` (~/.ssh/config 별칭, ed25519 키 등록됨, 무비밀번호 sudo=/etc/sudoers.d/claude-ops)
  ※ 한글 계정명은 명령줄 인용 문제로 반드시 별칭 사용. LAN 172.30.1.10 / TS 100.86.100.119(nas-ts)
NAS 백업 목적지: /volume2/backup/agent-backbone (pool2 — docker의 pool1과 분리)
NAS 호스트 TZ=KST, Debian 12, docker compose v5.1.3, /etc/cron.d 지원(실발화 확인)
```

## 기기 상태 (Tailscale)
| 기기 | 이름 | IP | 상태 |
|---|---|---|---|
| Mac Studio M3 Ultra 96GB | macstudio | 100.65.201.6 | ✅ 로컬 티어 완성 |
| NAS DXP4800+ 32GB | nas | 100.86.100.119 | ✅ 백본+백업+cron 가동 |
| Mac mini M4 24GB | mini-dashboard | 100.67.146.83 | 이관 대상. **Tailscale SSH 활성**(로컬 계정명 확인 필요) |
| 삼성 노트북 | node | 100.104.71.7 | 접속용 |

## ✅ 완료 (2026-07-24 로컬 세션)
- **HANDOFF #4 백업 3-2-1 로컬 파트**: `/etc/cron.d/agent-backbone` 매일 03:30 KST → `/volume2/backup/agent-backbone/daily/<ts>/`
  - 내용: pg_dump(--create)+글로벌 / n8n 워크플로·크리덴셜(암호화)·런타임설정 / Kuma 데이터 / .env+N8N_ENCRYPTION_KEY 사본 / SHA256SUMS. 14일 보존, 실패 시 보존삭제 스킵.
  - **복원 리허설 통과**: 스크래치 컨테이너에 globals+본덤프 로드, ON_ERROR_STOP 무오류, 테이블 대조 일치, 키 3원(해시) 일치.
  - 스크립트는 `/usr/local/sbin/ab-*.sh`(root 소유) 사본 실행. 수정 시 `install-cron.sh` 재실행 필수.
- **HANDOFF #2 하트비트 인프라**: cron 5분 주기 실발화 확인(16:20 journal). URL 파일만 넣으면 활성:
  `echo '<ping-url>' > ~/agent-backbone/heartbeat.url` (+백업용 `heartbeat-backbone.url` 아님 — `heartbeat-backup.url`)
- **HANDOFF #7**: 컨테이너 7종 전부 `restart:unless-stopped` 확인. 오늘 14:27 부팅에서 구컨테이너 3종 자동복구 실증(백본 4종은 부팅 후 배포라 다음 재부팅 때 최종 확인).
- **★ 스키마 미적용 사고 발견·수복**: 07-23 기록 "스키마 로드"는 오기. 실제로는 init.sql이 UGOS ACL(1000:uucp 770) 탓에 postgres(999)가 못 읽어 **Permission denied → 영구 스킵**된 상태였음. 수동 적용(§3-b)으로 vector 확장+idempotency_keys·expressions·leads·archive+hnsw 인덱스 생성 확인. 파일 644로 수정(재발 방지). **교훈: healthy≠스키마 있음. 복원 리허설이 잡아냄.**
- `.env` 권한 777→600. repo compose를 실배포와 동기화(n8n 호스트포트 5679).

## 🔍 발견 (조치 대기)
- **구 n8n 컨테이너**(`n8n`, 0.0.0.0:5678, LAN 노출): 6/10 생성 `/home/agent/gateway` 실험 잔재. 워크플로 0개, DB 마지막 쓰기 7/2. → **사용자 삭제 승인 대기**. 삭제 시 백본 n8n 5678 복귀 여부도 결정.
- **restic-rest 컨테이너**(0.0.0.0:8000, 인증 OFF): 같은 gateway 산물이지만 **현역** — 오늘 03:30에도 스냅샷 갱신(미니 백업 수신 추정, 3.6G). 건드리지 말 것. 단 인증 없음+LAN 노출은 미니 이관 때 정리 대상.
- 미니 22포트는 Tailscale SSH가 응답 — 올바른 로컬 계정명이면 무비밀번호 진입 가능(#6 감사 경로).

## ⬜ 남은 것 — [사람] 필요
1. **healthchecks.io** 가입 → 체크 2개(nas-alive 5분/backup-daily 1일) → URL을 위 파일 2개에 기록 (#2 완성)
2. **Kuma→Slack**: #agent-log 웹훅 확보 → Kuma 설정>알림 GUI 등록 → 3모니터 연결 (#1)
3. **API 키**(ANTHROPIC/MOONSHOT, 선택 OPENAI) 발급 → `.env` 채우기 → litellm 재시작+검증 (#3, 절차는 `llm-api-keys.md`)
4. **B2 계정** → restic.env(root:600)+에스크로 → 오프사이트 자동 활성 (#4 완성)
5. **구 n8n 삭제 승인** (#5)
6. **미니 로컬 계정명** 제공 → 하드코딩 감사 진행 (#6)
7. 도메인 게이트: domain-definition-template + channel-reorg O/X (🚧 Track B 종속분 선행조건)

## ⬜ 다음 재부팅 때
- 백본 4종 자동복구 최종 확인 + `/etc/cron.d/agent-backbone` 생존 확인(UGOS 업데이트 후에도)
