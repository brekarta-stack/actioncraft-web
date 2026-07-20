#!/bin/sh
# 설정 레포 동기화 — 5분마다 launchd(com.agent.gitsync.plist)가 실행.
# 역할 1: pull — "어디서든 수정 → 커밋 → Mini가 자동 반영"의 반영 담당
# 역할 2: push — Mini에서 자동 생성된 _quarantine 스킬을 원격에 올려
#               (a) 어느 기기에서든 심사 가능하게 (b) Mini 사망 시에도 소실 없게
#
# 알림 정책: 실패는 "상태 전이 시 1회 + 이후 24시간마다 1회"만 (알림 피로 방지),
#            복구되면 복구 알림 1회.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

export GIT_TERMINAL_PROMPT=0   # launchd 환경에서 인증 프롬프트 대기로 멈추는 것 방지

REPO="${AGENT_REPO:-$HOME/agent-config}"
mkdir -p "$AGENT_STATE_DIR" 2>/dev/null
FAIL_MARK="$AGENT_STATE_DIR/gitsync.lastfail"

fail_once_a_day() {
  # $1 = 알림 메시지. 첫 실패거나 마지막 알림 후 24h 지났을 때만 발송.
  _now=$(date +%s)
  _last=$(cat "$FAIL_MARK" 2>/dev/null || echo 0)
  if [ $((_now - _last)) -gt 86400 ]; then
    echo "$_now" > "$FAIL_MARK"
    notify "$1"
  fi
}

if [ ! -d "$REPO/.git" ]; then
  fail_once_a_day ":x: [git-sync] 레포가 없습니다: $REPO"
  exit 1
fi

cd "$REPO" || exit 1

# ── 역할 2: _quarantine 자동 캡처 (pull 전에 로컬 변경을 먼저 커밋해야 ff-only가 산다) ──
QUAR_CHANGES="$(git status --porcelain -- skills/_quarantine/ 2>/dev/null)"
if [ -n "$QUAR_CHANGES" ]; then
  git add skills/_quarantine/ >/dev/null 2>&1
  git commit -m "chore(quarantine): auto-capture generated skills" >/dev/null 2>&1
fi

# ── 역할 1: pull ──
BEFORE="$(git rev-parse HEAD 2>/dev/null)"
ERR="$(git pull --ff-only 2>&1)"
if [ $? -ne 0 ]; then
  # 원인을 버리지 않는다: launchd 환경에선 "충돌"보다 인증(키체인 잠김, SSH 에이전트 부재)이 더 흔하다
  fail_once_a_day ":x: [git-sync] pull 실패 — 원인:
$(printf '%s' "$ERR" | tail -n 5)
(흔한 원인: 인증 실패 / 로컬 직접 수정 충돌 → $REPO 에서 git status 확인)"
  exit 1
fi

# ── 커밋해둔 _quarantine 캡처 푸시 ──
if [ -n "$QUAR_CHANGES" ]; then
  if git push >/dev/null 2>&1; then
    notify ":inbox_tray: [git-sync] 새 자동 생성 스킬을 _quarantine에 캡처·푸시했습니다 (주간 심사 대상)."
  else
    fail_once_a_day ":x: [git-sync] _quarantine 푸시 실패 — 원격 인증 확인 필요. 스킬은 로컬 커밋으로는 보존됨."
  fi
fi

# ── 성공 처리: 복구 알림 + 신선도 기록 ──
if [ -f "$FAIL_MARK" ]; then
  rm -f "$FAIL_MARK"
  notify ":white_check_mark: [git-sync] 복구됨 — 동기화 정상."
fi
date +%s > "$AGENT_STATE_DIR/gitsync.ok"

AFTER="$(git rev-parse HEAD 2>/dev/null)"

if [ "$BEFORE" != "$AFTER" ]; then
  CHANGED="$(git diff --name-only "$BEFORE" "$AFTER" | head -10)"
  notify ":arrows_counterclockwise: [git-sync] 설정 반영됨 ($(git log -1 --format=%h))
$CHANGED"

  # plist는 ~/Library/LaunchAgents/ 의 사본이 실행되므로 pull만으로는 반영되지 않는다.
  if git diff --name-only "$BEFORE" "$AFTER" | grep -q '^hooks/launchd/.*\.plist$'; then
    notify ":warning: [git-sync] launchd plist가 변경되었습니다. README 4단계(복사·치환·reload)를 다시 실행해야 반영됩니다."
  fi
fi
