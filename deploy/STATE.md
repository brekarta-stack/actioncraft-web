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
  `echo '<ping-url>' > ~/agent-backbone/heartbeat.url` · 백업용은 `~/agent-backbone/heartbeat-backup.url`
- **HANDOFF #7**: 컨테이너 7종 전부 `restart:unless-stopped` 확인. 오늘 14:27 부팅에서 구컨테이너 3종 자동복구 실증(백본 4종은 부팅 후 배포라 다음 재부팅 때 최종 확인).
- **★ 스키마 미적용 사고 발견·수복**: 07-23 기록 "스키마 로드"는 오기. 실제로는 init.sql이 UGOS ACL(1000:uucp 770) 탓에 postgres(999)가 못 읽어 **Permission denied → 영구 스킵**된 상태였음. 수동 적용(§3-b)으로 vector 확장+idempotency_keys·expressions·leads·archive+hnsw 인덱스 생성 확인. 파일 644로 수정(재발 방지). **교훈: healthy≠스키마 있음. 복원 리허설이 잡아냄.**
- `.env` 권한 777→600. repo compose를 실배포와 동기화(n8n 호스트포트 5679).

## ✅ 추가 완료 (같은 날 저녁 2차)
- **HANDOFF #5 종결**: 구 n8n(6/10 gateway 실험, 워크플로 0, 7/2 이후 미사용) **사용자 승인 후 제거**. 볼륨 `n8n_n8n_data` 보존. 백본 n8n **5678 복귀** — TS 전용 5678 OPEN·200, 5679/LAN closed 검증. ⚠️ Kuma의 n8n 모니터 URL 5679→5678 수정 필요(GUI).
- **HANDOFF #6 종결**: 미니 하드코딩 감사 완료 → `docs/mini-hardcoding-audit.md`. 미니 접근=Tailscale SSH `ssh agent@100.67.146.83`(무비밀번호). 핵심: plist 45개 IP 제로 / machines.json의 NAS lan_ip가 오늘 또 어긋남(.25→실제 .10, DHCP 드리프트 재실증) / voicebridge는 하드코딩 없어 이식 용이 / 외부 코드루트 3곳(agent-config·papercraft-studio·voicebridge)도 깨끗.
- **변경 후 스모크**: litellm classify-fast → Studio qwen "파란색" 응답 — 오늘 모든 변경 후에도 라우팅 정상.

## 🔍 잔여 관찰
- **restic-rest 컨테이너**(0.0.0.0:8000, 인증 OFF): gateway 산물이지만 **현역** — 미니가 매일 03:30 스냅샷 푸시(3.6G). 미니 이관 완료 전 중단 금지. 인증 없음+LAN 노출은 이관 때 정리.
- 미니 heartbeat의 Slack 알림 7/23부터 실패(rc=56) — slackbot 비활성화 여파. 은퇴 경로라 수리 불요.
- 미니 machines.json의 "ultra 은퇴" 기록은 구시대 정보 — 이관 시 machines.json 전면 재작성 권장.

## ✅ 3차 (같은 날 — 클라우드 티어 활성화)
- **HANDOFF #3 종결**: ANTHROPIC(108ch)·MOONSHOT(51ch) 키 `.env` 반영(파일 경유, 채팅/로그 미노출) → litellm 재생성.
  - **검증**: write-ko-final→"Anthropic의 Claude"(직접 API 교차검증 포함) · kimi-cheap→"Moonshot AI의 Kimi".
  - **폴백 드릴 실증**: Studio ollama 정지 → classify-fast가 `kimi-cheap`으로 자동 강등(fallbacks:1) → ollama 복구 → 로컬 복귀(fallbacks:0). 무중단 체계 왕복 확인.
  - **예산 가드**: 가상 키 `n8n-ops`($25/30d) 발급 — `~/agent-backbone/n8n-litellm-key.txt`(600). n8n 워크플로는 master key 대신 이 키 사용.
  - ⚠️ OPENAI 키는 복사 시 앞부분(`sk-proj-` 등) 누락으로 형식 불일치 → 미설치. gpt-frontier 폴백은 그때까지 비활성(프런티어 폴백은 anthropic 상호간 아님 주의).
  - 📝 운영 주의 2건: kimi-k2.6은 추론형 — **max_tokens 작으면 content 빈 응답**(reasoning 소진). litellm 재기동 직후 첫 응답에서 1회 오식별 관찰(재현 안 됨, 웜업 추정).

## ⬜ 남은 것 — [사람] 필요
1. **healthchecks.io** 가입 → 체크 2개(nas-alive 5분/backup-daily 1일) → URL을 위 파일 2개에 기록 (#2 완성)
2. **Kuma GUI**: n8n 모니터 URL 5679→**5678** 수정 + #agent-log 웹훅 등록 → 3모니터 연결 (#1)
3. **OPENAI 키 재복사**(선택) → 파일 경유 재반영하면 gpt-frontier 폴백 활성
4. **B2 계정** → restic.env(root:600)+에스크로 → 오프사이트 자동 활성 (#4 완성)
5. 도메인 게이트: domain-definition-template + channel-reorg O/X (🚧 Track B 종속분 선행조건)

## ⬜ 다음 재부팅 때
- 백본 4종 자동복구 최종 확인 + `/etc/cron.d/agent-backbone` 생존 확인(UGOS 업데이트 후에도)
