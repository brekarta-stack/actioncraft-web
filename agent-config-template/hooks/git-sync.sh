#!/bin/sh
# 설정 레포 동기화 — 5분마다 launchd(com.agent.gitsync.plist)가 실행.
# "어디서든 수정 → 커밋 → Mini가 자동 반영"의 반영 담당.
# 변경이 있으면 #agent-log에 보고, pull 실패 시 즉시 알림.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

REPO="${AGENT_REPO:-$HOME/agent-config}"

if [ ! -d "$REPO/.git" ]; then
  notify ":x: [git-sync] 레포가 없습니다: $REPO"
  exit 1
fi

cd "$REPO" || exit 1

BEFORE="$(git rev-parse HEAD 2>/dev/null)"

# ff-only: 로컬에서 직접 고쳐서 생긴 충돌은 실패로 드러나게 한다 (철칙 2 위반 감지)
if ! git pull --ff-only >/dev/null 2>&1; then
  notify ":x: [git-sync] pull 실패 — 로컬 직접 수정으로 인한 충돌 가능성. $REPO 에서 git status 확인 필요."
  exit 1
fi

AFTER="$(git rev-parse HEAD 2>/dev/null)"

if [ "$BEFORE" != "$AFTER" ]; then
  CHANGED="$(git diff --name-only "$BEFORE" "$AFTER" | head -10)"
  notify ":arrows_counterclockwise: [git-sync] 설정 반영됨 ($(git log -1 --format=%h))
$CHANGED"

  # plist는 ~/Library/LaunchAgents/ 의 사본이 실행되므로 pull만으로는 반영되지 않는다.
  # 변경을 감지하면 재배포(README 4단계 재실행)를 요구하는 알림을 보낸다.
  if git diff --name-only "$BEFORE" "$AFTER" | grep -q '^hooks/launchd/.*\.plist$'; then
    notify ":warning: [git-sync] launchd plist가 변경되었습니다. README 4단계(복사·치환·reload)를 다시 실행해야 반영됩니다."
  fi
fi
