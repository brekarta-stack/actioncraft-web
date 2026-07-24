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

## ✅ 4차 (2026-07-24 — Orca 원격 개발 서버)
- **목표**: Studio를 상시 "원격 Orca 서버"로 → Windows(100.104.71.7)·폰이 Tailscale로 붙어 조종, 노트북 닫아도 세션이 Studio에서 지속. (원리는 `docs/remote-dev-guide.md`의 tmux와 동일: 세션이 Studio에 상주.)
- **설치**: `brew install --cask stablyai/orca/orca` → `/Applications/Orca.app` + CLI `/opt/homebrew/bin/orca`(v1.4.152). `orca serve`가 **macOS에서 headless 지원됨**(C-1 경로).
- **상시 가동**: LaunchAgent `com.orca.serve`(gui/$UID, KeepAlive+RunAtLoad). 실측 검증: serve PID `kill -9` → launchd ~2초 재기동(runs=2). 소스는 repo `deploy/studio/`(plist·`orca-serve-setup.sh` 멱등 재설치·`orca-mobile-pair.sh` 폰 QR). 로그 `~/Library/Logs/orca-serve.log`.
- **엔드포인트**: `ws://100.65.201.6:6768`(Tailscale, port 6768). 바인드는 0.0.0.0:6768이나 페어링 신뢰모델로 보호 — **라우터 6768 포워딩 금지**(C-6). 페어링 코드(`orca://pair?code=…`)는 **비밀**→repo 미기록. 취득: `grep 'Pairing URL:' ~/Library/Logs/orca-serve.log`.
- **핵심 실측 2건**: (1) 서버 identity 공개키(`publicKeyB64`)가 재시작 후 **불변**(userData 영속) → 한 번 페어링한 Windows·폰은 launchd 재시작 후에도 신뢰 유지. (2) 단일 인스턴스 락 → `orca serve`는 동시 1개뿐 → persistent는 **runtime scope**(Windows 데스크톱 + 브라우저 웹클라이언트 `http://100.65.201.6:6768/web-index.html#pairing=…`). 폰 네이티브 앱 mobile-scope QR은 `orca-mobile-pair.sh`가 서버를 잠깐 바꿔치기해 발급(동일 서버 identity).
- **선점 정리**: 기동 시 quarantine된 옛 Orca.app이 **App Translocation** 경로에서 락 점유 중 → 빈 인스턴스(워크트리·레포·환경 0) 확인 후 종료. brew본이 정상본.
- **하드닝**: `pmset` 이미 sleep 0·disksleep 0·standby 0(24/7 충족). ⚠️ **자동 로그인 OFF** → 재부팅 시 GUI 로그인 전엔 LaunchAgent 미기동. 무인 재부팅 복구 원하면 시스템 설정>사용자 및 그룹>자동 로그인 ON(사용자 GUI, 보안 트레이드오프).
- **경계 준수**: Orca=개발 세션 오케스트레이터(무인 자동화 백본 아님, 그건 n8n@NAS). 매매·발행 권한 미부여.

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

## ✅ 4차 (같은 날 — 재부팅 검증 3회로 부팅 순서 결함 발견·수복)
- **재부팅 #1이 진짜 버그 적발**: TS IP(100.86.100.119)에 바인딩하는 3종(n8n·litellm·kuma)이 부팅 시
  tailscale 컨테이너보다 먼저 복원 시도 → `cannot assign requested address` → **재시도 없이 사망**.
  (postgres=포트없음·tailscale=host·restic=0.0.0.0만 생존. `restart: always`만으로는 불충분 — 재부팅 #2로 확인.)
- **수정(이중 방어)**: ① `/etc/sysctl.d/99-agent-backbone.conf` → `ip_nonlocal_bind=1`(v4/v6)
  ② cron `@reboot` → `ab-boot-up.sh`(docker·TS IP 대기 후 compose up 3회 재시도, 로그 `/var/log/agent-backbone-boot.log` — /volume2 리다이렉트는 마운트 전에 죽는 것도 실측·수정) ③ compose `restart: always`.
- **재부팅 #3 완전 통과**: 부팅 직후 6/6 자동복구 + 2차 방어선 "compose up OK" + cron 생존 + TS 포트 3종 OPEN + e2e 라우팅("GREEN").
- **OPENAI 키**: TextEdit 사고로 뒤섞인 것을 확정 재구성(`sk-proj-`+몸통)해 설치, 인증 통과 확인. 단 **계정 크레딧 0 → 쿼터 오류** — 충전 전까지 gpt-frontier 비활성.

## ⬜ 남은 것 — [사람] 필요
1. **healthchecks.io** 가입 → 체크 2개(nas-alive 5분/backup-daily 1일) → URL을 위 파일 2개에 기록 (#2 완성)
2. **Kuma GUI**: n8n 모니터 URL 5679→**5678** 수정 + #agent-log 웹훅 등록 → 3모니터 연결 (#1)
3. **OpenAI 크레딧 충전**(선택) — 키는 유효 설치됨, 잔액 0이라 429. 충전 즉시 gpt-frontier 활성(재시작 불필요)
4. **B2 계정** → restic.env(root:600)+에스크로 → 오프사이트 자동 활성 (#4 완성)
5. 도메인 게이트: domain-definition-template + channel-reorg O/X (🚧 Track B 종속분 선행조건)

## ⬜ UGOS 업데이트 후 생존 확인 3종
`/etc/cron.d/agent-backbone` · `/etc/sysctl.d/99-agent-backbone.conf` · `/usr/local/sbin/ab-*.sh` (없어졌으면 install-cron.sh 재실행 + sysctl 재적용)
