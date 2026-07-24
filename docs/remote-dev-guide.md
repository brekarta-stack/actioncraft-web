# 끊김 없는 원격 개발 가이드 — tmux / Orca (2026-07-24)

> 목표: **Studio(24h)에서 Claude Code를 돌리고, Windows/폰은 붙었다 떨어지는 리모컨.**
> 노트북을 닫아도 Studio 안의 작업은 계속된다. 핵심은 tmux(세션을 기기에 붙들어두는 것).

## 왜 tmux인가 (원리)
- `ssh → claude`만 하면 SSH 끊기는 순간 claude도 죽는다(프로세스가 SSH에 매달려 있어서).
- **tmux로 감싸면** claude가 tmux 세션에 속해 Studio 안에서 독립적으로 살아있다 → SSH 끊어도, 노트북 닫아도 계속 돎.
- 나중에 다시 SSH로 붙어 `attach`하면 그동안 진행된 상태를 그대로 본다.

## 선행 (Studio에서 한 번만)
1. **SSH 켜기**: 시스템 설정 → 일반 → 공유 → **원격 로그인(Remote Login) ON**.
2. **tmux 설치**(없으면): `brew install tmux`
3. Studio 접속 정보: 사용자 `seakimacultra`, Tailscale IP `100.65.201.6`, 호스트 `segiui-MacStudio`.

## 일상 워크플로우
```bash
# ── Windows PowerShell에서 ──
ssh seakimacultra@100.65.201.6         # Studio 접속 (어디서든, Tailscale만 켜져 있으면)

# ── Studio 안(프롬프트가 seakimacultra@segiui-MacStudio 로 바뀜) ──
tmux new -s dev                        # 'dev' 세션 새로 생성 (레포 폴더로 cd 후 하면 좋음)
claude                                 # 그 안에서 Claude Code 실행 → 작업 지시

#  자리를 뜰 때: Ctrl+b 눌렀다 떼고, 이어서 d  → "detach" (세션은 계속 살아있음)
#  → 이제 SSH 끊고 노트북 닫아도 Studio 안에서 claude가 계속 작업.

# ── 나중에 다시 (같은/다른 기기) ──
ssh seakimacultra@100.65.201.6
tmux attach -t dev                     # 진행된 상태 그대로 이어봄
```

## tmux 치트시트 (Ctrl+b = 프리픽스, 누르고 뗀 뒤 다음 키)
| 하고 싶은 것 | 키/명령 |
|---|---|
| 세션 나가되 살려두기 | `Ctrl+b` → `d` (detach) |
| 세션 목록 | `tmux ls` |
| 특정 세션 재접속 | `tmux attach -t dev` (짧게 `tmux a -t dev`) |
| 새 세션 생성 | `tmux new -s 이름` |
| 스크롤(위 로그 보기) | `Ctrl+b` → `[` , 방향키/PageUp, 끝내기 `q` |
| 한 세션 안에 창 추가 | `Ctrl+b` → `c` , 창 전환 `Ctrl+b` → `0`/`1`/`2` |
| 세션 종료 | `tmux kill-session -t dev` |

## 프로덕트 여러 개 = 세션 여러 개
```bash
cd ~/impact-ledger && tmux new -s impact   # claude 실행
# Ctrl+b d 로 나오고
cd ~/proof-market && tmux new -s proof     # 또 claude 실행
# Ctrl+b d
tmux ls                                    # impact, proof, dev ... 다 살아있음
```
각 세션이 독립적으로 계속 돈다. 노트북 닫아도 전부 유지. → **레포마다 세션 하나**로 병렬 개발.

## 재부팅 주의 (한계)
- tmux 세션은 **Studio 재부팅 시 사라진다**(claude 작업도 그때 중단). 재부팅 후엔 세션을 다시 시작.
- 재부팅이 드무니 실용상 문제 적음. 원하면:
  - launchd **tmux-keeper**(부팅 시 빈 tmux 세션 자동 생성) — 미니의 `remote-claude/tmux-keeper.sh` 패턴을 Studio로 이식.
  - 또는 `tmux-resurrect`/`continuum` 플러그인(세션 레이아웃 저장·복원). 고급.

## 폰에서 (제일 편한 경로)
- **Claude Code Remote Control**: Studio 세션에서 `/remote-control` → 폰 앱·claude.ai/code 브라우저에 그 세션이 뜸 → 폰에서 지시. tmux SSH보다 폰에선 이게 편함.
- tmux는 "견고한 정석", Remote Control은 "폰 편의" — 둘 다 Studio에서 돈다는 원리는 같음.

## Orca (여러 세션이 많아지면 = 다음 단계)
- **무엇**: Studio(macOS)에 설치하는 GUI 오케스트레이터. Claude Code 등 여러 세션을 **격리 git worktree에서 병렬 실행·관리** + **iOS/Android 앱**으로 모니터·지시·완료 알림. MIT 무료 + BYO 구독(추가 마크업 없음).
- **tmux 대비**: tmux를 손으로 저글링하는 걸 GUI+폰앱+worktree 격리+알림으로 대체. 원리(세션이 Studio에서 24h 돎)는 동일.
- **도입 타이밍**: 지금은 tmux/Remote Control로 충분. **동시에 3~4개 세션 돌리며 관리가 번거로워질 때** 설치(과잉설계 금지). 설치는 Orca 공식 배포처에서 받고 절차는 그 시점 확인.
- **경계(전 검증 유지)**: 무인 스케줄링 백본으로는 쓰지 말 것(cron 없음 → 그건 n8n@NAS). 매매·발행 권한 미부여.

## 정직한 한계 (공통)
- claude가 **위험/모호한 지점에서 승인을 물으면 거기서 대기**한다(자리 뜬 사이 멈춤). 완전 무인은 자동승인 모드가 필요하고 리스크 있음 → 신중히.
- 즉 "노트북 닫아도 실행은 계속되나, 승인 필요 지점에선 당신이 돌아올 때까지 대기"가 정확한 그림.

## 한 줄
**24h Studio + tmux(또는 Orca) + Claude Code = 노트북 닫아도 안 끊기는 개발.** Windows/폰은 접속 창일 뿐.
