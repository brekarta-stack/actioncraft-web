#!/bin/sh
# 매일 아침 생존신호 → #agent-log
# launchd(com.agent.heartbeat.plist)가 매일 08:00 실행.
# "heartbeat이 안 오면 죽은 것" — 운영자의 매일 10초 확인 지점.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

HERMES_PATTERN="${HERMES_PATTERN:-hermes}"
HOST="$(hostname -s 2>/dev/null || hostname)"
NOW="$(date '+%Y-%m-%d %H:%M')"

# 1) 헤르메스 데몬 생존
if pgrep -f "$HERMES_PATTERN" >/dev/null 2>&1; then
  HERMES_STATUS="OK"
else
  HERMES_STATUS="DOWN"
fi

# 2) 디스크 여유
DISK_USED="$(df -h / 2>/dev/null | awk 'NR==2{print $5}')"

# 3) 설정 레포 동기화 상태
REPO="${AGENT_REPO:-$HOME/agent-config}"
if [ -d "$REPO/.git" ]; then
  SYNC_AGE="$(cd "$REPO" && git log -1 --format=%cr 2>/dev/null || echo 'unknown')"
else
  SYNC_AGE="repo missing"
fi

MSG="[heartbeat] host=$HOST hermes=$HERMES_STATUS disk=$DISK_USED config-last-change=$SYNC_AGE ($NOW)"

if [ "$HERMES_STATUS" = "DOWN" ]; then
  notify ":rotating_light: $MSG — 데몬이 죽어 있습니다. launchctl list | grep hermes 로 확인하세요."
else
  notify ":green_heart: $MSG"
fi
