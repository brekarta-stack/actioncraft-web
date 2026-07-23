# 설계 별도 레포 분리 계획 (2026-07-22)

> 문제: 에이전트 오케스트레이션 설계·배포가 papercraft.kr 웹앱 레포(actioncraft-web)에 섞여 있다.
> 실측: `docs/`는 **전부 에이전트 설계**(웹앱 문서 아님), `agent-config-template/`도 관제층 = 웹앱과 무관.
> 권고: **별도 레포 `agent-orchestration` 신설로 분리.** 섞임은 시간이 갈수록 나빠짐.

## 무엇을 옮기나 / 무엇을 남기나
| 이동 → `agent-orchestration` | 잔류 (actioncraft-web = 순수 웹앱) |
|---|---|
| `docs/` 전체(설계 문서 ~20개) | `src/`, `supabase/`, `public/`, `data/` |
| `agent-config-template/`(관제층) | 루트 빌드·설정(next.config·package·tsconfig 등) |
| `deploy/`(NAS·Studio 배포) | 루트 `CLAUDE.md`(웹앱용) · `AGENTS.md` |
| `portfolio/`(projects.yaml) | |

## 제약 (정직)
이 클라우드 세션은 **actioncraft-web 레포에만** 접근 → 새 레포를 내가 못 만든다.
따라서 **당신이 GitHub에서 빈 레포 생성 → 아래 스크립트로 이동**. (문서 이동이라 히스토리 보존 불필요 — 복사로 충분. 원본 이력은 actioncraft-web 브랜치에 남음.)

## 실행 (미니/스튜디오에서)
```bash
# 1) GitHub에서 brekarta-stack/agent-orchestration (Private) 생성.
# 2) 아래 실행:
cat > ~/split-design.sh <<'EOF'
#!/bin/bash
set -e
SRC=~/acw                 # actioncraft-web 클론 위치(없으면 clone)
[ -d "$SRC" ] || git clone https://github.com/brekarta-stack/actioncraft-web.git "$SRC"
git -C "$SRC" fetch origin && git -C "$SRC" checkout claude/mac-agent-subscription-comparison-5vFfQ && git -C "$SRC" pull

DST=~/agent-orchestration
mkdir -p "$DST" && cd "$DST" && git init -b main
# 설계 자산 복사
cp -R "$SRC"/docs .
cp -R "$SRC"/agent-config-template .
cp -R "$SRC"/deploy .
cp -R "$SRC"/portfolio .
# docs/CLAUDE.md를 새 레포 루트 CLAUDE.md로 승격(설계 마스터가 이제 루트가 됨)
cp docs/CLAUDE.md ./CLAUDE.md
printf 'node_modules/\n*.env\n.env*\n!*.env.example\ndeploy/nas/data/\n__pycache__/\n' > .gitignore
git add -A && git commit -m "chore: split agent-orchestration design from web app repo"
git remote add origin git@github.com:brekarta-stack/agent-orchestration.git
git push -u origin main
echo "완료. 이후 설계 작업은 ~/agent-orchestration 에서."
EOF
bash ~/split-design.sh
```

## 분리 후 정리 (선택, 나중에)
- actioncraft-web에서 `docs/`(설계분)·`agent-config-template/`·`deploy/`·`portfolio/` 제거 커밋 → 웹앱 순수화.
  단 **이 2주 빌드가 끝난 뒤에** 정리(지금 옮기면 진행 중 참조가 끊김). 그때까지 두 곳에 존재해도 무방(이동은 복사라 원본 남음).

## 권고 타이밍
- **지금**: 새 레포 생성 + 스크립트로 이동(설계 홈 확보). 이후 커밋은 새 레포에.
- **2주 빌드 후**: actioncraft-web에서 설계 자산 제거(웹앱 순수화).
