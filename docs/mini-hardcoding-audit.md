# 미니 하드코딩 감사 (HANDOFF #6) — 2026-07-24 실측

> 대상: `agent@mini`(agentui-Macmini, macOS 26.5)의 `~/agents` 코드 디렉토리(bin·config·scripts·scheduled·ops·mcp-servers·dashboard·setup-*.sh) + `~/Library/LaunchAgents` plist 45개.
> 접근: **Tailscale SSH**(무키·무비밀번호, 계정 `agent`) — `ssh agent@100.67.146.83`.
> 결론 요약: **plist는 IP 제로(깨끗)**, `.env`도 IP 참조 없음. 하드코딩은 소수 파일에 집중되어 있고, 절반은 7/14 이사(192.168.0.x→172.30.1.x)로 **이미 죽은 참조**다.

## 실측 교차검증 — DHCP 드리프트 실증 (C-6 근거)
| 참조 | 기록값(미니) | 오늘 실측 | 판정 |
|---|---|---|---|
| NAS LAN | `machines.json` 172.30.1.25 (7/14 기록) | **172.30.1.10** | ❌ 이미 또 어긋남 — LAN IP 참조는 신뢰 불가 |
| NAS mDNS | `DXP4800PLUS-osk.local` | 동일 호스트명 확인 | ✅ 이사에도 생존 |
| 구 서브넷 | 192.168.0.x 참조 다수 | 소멸(이사) | ❌ 전부 사문 |
| Tailscale | `*.tail3a6eb6.ts.net` | 태일넷 도메인 확인 | ✅ 권장 경로 |

## 교체/폐기 대상 목록
| # | 파일:줄 | 내용 | 분류 | 조치(이관 시) |
|---|---|---|---|---|
| 1 | `bin/backup-restic:10` | `NAS_FAST="10.10.10.2"` (2.5GbE 직결) | **미니 전용 물리 토폴로지** | Studio 이관 시 직결 없음 → `nas.tail3a6eb6.ts.net` 또는 mDNS로. 대상 restic-rest(:8000)는 현역 |
| 2 | `bin/backup-restic:11` | `NAS_LAN="DXP4800PLUS-osk.local"` | mDNS(양호) | 유지 가능. Tailscale명이 더 견고 |
| 3 | `bin/homework-watcher:20` | `https://mini-dashboard.tail3a6eb6.ts.net/` | **미니 자신 참조** | 대시보드 폐기 방침(C-4)과 함께 정리 |
| 4 | `config/machines.json` (nas.lan_ip=172.30.1.25) | 소비처: `bin/ask·status·failover·wake-ultra·sleep-ultra`, `dashboard/server.py` | **SSOT 오염** | lan_ip 필드 폐기, MagicDNS 단일화. 오늘 기준으로도 틀린 값 |
| 5 | `ops/cutover-mini-activate.sh` / `ops/cutover-rollback.sh` | tailscale hostname 스왑(mini-dashboard↔agentui-macmini) | 이관기 도구 | 미니 은퇴와 함께 폐기 |
| 6 | `bin/agentlib.py:121`, `bin/gen-run:79` | 프롬프트 문구 내 `ssh agent@192.168.0.120`(윈도우 노트북 구주소) | 사문(구 서브넷) | 이관 시 해당 문구 제거/치환 |
| 7 | `bin/mini-services:40,122` | `smb://agentui-Macmini.local` | 미니 자신 참조 | 미니 은퇴와 함께 소멸 |
| 8 | `dashboard/server.py:9` | 주석 속 `Studio(192.168.0.245)` | 사문 주석 | 무시(폐기 대상 컴포넌트) |
| — | `*.bak*`, `__pycache__/*.pyc`, `dashboard/_edits_backup/*` | 위 항목들의 사본 | 노이즈 | 조치 불요 |

## 함께 확인된 사실 (이관 계획 참고)
- **launchd 잡 42개 로드 중** — `com.papercraft.*` 40종 + gitsync/heartbeat. celery·slackbot·docker·hermes는 7/23 이미 `.disabled`.
- `machines.json`의 `ultra`(96GB Mac Studio)는 **06-17 "처분·은퇴" 기록** 상태 — 현 아키텍처(신형 M3 Ultra=핵심 컴퓨트)와 정반대. 미니의 세계관은 "미니 단독" 시대에 멈춰 있음 → 이관 시 machines.json 전면 재작성이 맞다(부분 수정 비추).
- NAS에 `agent` 계정 존재(/home/agent) = 미니 restic 백업 수신 경로. **restic-rest는 현역**(당일 03:30 스냅샷) — 미니 이관 완료 전 절대 중단 금지.
- 미니 dashboard는 `tailscale serve`로 tailnet 노출 중(server.py) — 폐기 시 serve 설정도 해제할 것.

## 사각지대 추가 스캔 (plist가 ~/agents 밖을 실행하는 경우)
plist ProgramArguments 역추적으로 외부 코드 루트 3곳 발견 → 동일 패턴 스캔 결과 **전부 깨끗**(코드 내 IP/호스트 하드코딩 0):
- `~/agent-config/hooks/` (git-sync.sh·heartbeat.sh) — 로그에 자기 호스트명 문자열만(런타임 산출물)
- `~/papercraft-studio/` (upload_worker 등)
- `~/voicebridge/` — **Studio 이식 대상(D8)인데 기기 참조 하드코딩 없음 = 이식 용이** ✅

부수 발견: `com.agent.heartbeat`의 Slack 전송이 7/23부터 실패 중(rc=56) — slackbot 비활성화(7/23)와 동시점. 미니 은퇴 경로라 수리 불요, 소음만 인지.

## 이관 원칙 재확인 (C-6)
기기 참조는 **Tailscale MagicDNS**(`macstudio` / `nas` / … `.tail3a6eb6.ts.net`)로만. LAN IP는 이번 감사로 두 번(192.168→172.30, .25→.10) 어긋난 것이 실증됨. mDNS(.local)는 차선.
