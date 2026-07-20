#!/bin/sh
# 매일 아침 생존신호 → #agent-log
# launchd(com.agent.heartbeat.plist)가 매일 08:00 실행.
# "heartbeat이 안 오면 죽은 것" — 운영자의 매일 10초 확인 지점.
#
# 검사 항목 (문제 하나라도 있으면 :rotating_light: 로 격상):
#   1) 헤르메스 데몬 생존 (launchd 기준 — pgrep 부분매칭 오탐 방지)
#   2) 디스크 사용률 임계치 (>=90%)
#   3) git-sync 신선도 (마지막 성공 30분 초과 = sync 죽음)
#   4) skills/ 무커밋 변조 (_quarantine 밖에 커밋 안 된 변경 = 격리 우회 신호)

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

HERMES_PATTERN="${HERMES_PATTERN:-hermes}"
HOST="$(hostname -s 2>/dev/null || hostname)"
NOW="$(date '+%Y-%m-%d %H:%M')"
PROBLEMS=""

# 1) 헤르메스 데몬 생존 — launchd에 직접 묻는다.
#    (pgrep -f 는 'hermes.env를 연 편집기' 같은 무관 프로세스에 오탐한다)
if command -v launchctl >/dev/null 2>&1; then
  if launchctl list com.agent.hermes 2>/dev/null | grep -q '"PID"'; then
    HERMES_STATUS="OK"
  else
    HERMES_STATUS="DOWN"
    PROBLEMS="$PROBLEMS
- 헤르메스 데몬 다운 → runbook '데몬 재기동 3단계' 참조"
  fi
else
  # launchctl 없는 환경(테스트 등) 폴백
  if pgrep -f "$HERMES_PATTERN" >/dev/null 2>&1; then HERMES_STATUS="OK"; else HERMES_STATUS="DOWN"; fi
fi

# 2) 디스크 임계치 — macOS는 '/'가 봉인된 시스템 볼륨이라 실사용을 반영 못 한다 → Data 볼륨 우선
DISK_PCT="$(df /System/Volumes/Data 2>/dev/null | awk 'NR==2{gsub("%","",$5); print $5}')"
[ -z "$DISK_PCT" ] && DISK_PCT="$(df / 2>/dev/null | awk 'NR==2{gsub("%","",$5); print $5}')"
if [ -n "$DISK_PCT" ] && [ "$DISK_PCT" -ge 90 ] 2>/dev/null; then
  PROBLEMS="$PROBLEMS
- 디스크 ${DISK_PCT}% — 로그/백업 정리 필요"
fi

# 3) git-sync 신선도 (5분 주기이므로 30분 넘게 성공 기록이 없으면 sync가 죽은 것)
SYNC_OK_FILE="$AGENT_STATE_DIR/gitsync.ok"
if [ -f "$SYNC_OK_FILE" ]; then
  # 빈 파일/오염된 값이면 0으로 폴백 (산술 문법 오류로 heartbeat 자체가 죽는 것 방지)
  _sync_ts="$(cat "$SYNC_OK_FILE" 2>/dev/null)"
  case "$_sync_ts" in ''|*[!0-9]*) _sync_ts=0;; esac
  SYNC_AGE=$(( $(date +%s) - _sync_ts ))
  if [ "$SYNC_AGE" -gt 1800 ]; then
    PROBLEMS="$PROBLEMS
- git-sync 마지막 성공 $((SYNC_AGE / 60))분 전 — sync 에이전트 확인 필요"
  fi
  SYNC_NOTE="sync=$((SYNC_AGE / 60))m"
else
  SYNC_NOTE="sync=none"
fi

# 4) skills/ 무커밋 변조 감지 — "격리 밖으로 나가는 유일한 방법은 심사 후 커밋"의 강제 장치
#    - status.renames=false: 스테이징된 격리→core 이동(R 한 줄)이 필터를 뚫는 것 방지 (D+A로 분해)
#    - core.quotepath=off: 한글 파일명이 따옴표 이스케이프돼 필터를 비껴가는 것 방지
REPO="${AGENT_REPO:-$HOME/agent-config}"
if [ -d "$REPO/.git" ]; then
  DRIFT="$(cd "$REPO" && git -c core.quotepath=off -c status.renames=false status --porcelain -- skills/ 2>/dev/null | grep -v ' skills/_quarantine/' | head -3)"
  if [ -n "$DRIFT" ]; then
    PROBLEMS="$PROBLEMS
- skills/ 에 커밋 안 된 변경 (격리 우회 의심):
$DRIFT"
  fi
fi

# 5) NAS 마운트 (NAS_MOUNT 가 설정된 경우만 — §13.2 대표 고장 'NAS 마운트 해제' 감지)
if [ -n "${NAS_MOUNT:-}" ]; then
  if ! mount 2>/dev/null | grep -qF " on $NAS_MOUNT "; then
    PROBLEMS="$PROBLEMS
- NAS 미마운트: $NAS_MOUNT — 백업·데이터 작업이 로컬에 잘못 쓰일 수 있음"
  fi
fi

# 6) 헤르메스 Slack 봇 토큰 유효성 (HERMES_BOT_TOKEN 설정 시 — §13.2 대표 고장 1호 '토큰 만료')
#    토큰이 죽으면 데몬은 살아 있어도 에이전트는 귀머거리가 된다.
if [ -n "${HERMES_BOT_TOKEN:-}" ]; then
  if ! curl -sf -m 5 -H "Authorization: Bearer $HERMES_BOT_TOKEN" \
       https://slack.com/api/auth.test 2>/dev/null | grep -q '"ok" *: *true'; then
    PROBLEMS="$PROBLEMS
- 헤르메스 Slack 봇 토큰 인증 실패 — 토큰 만료/회수 확인 (에이전트 수신 불능 상태)"
  fi
fi

MSG="[heartbeat] host=$HOST hermes=$HERMES_STATUS disk=${DISK_PCT:-?}% $SYNC_NOTE ($NOW)"

if [ -n "$PROBLEMS" ]; then
  notify ":rotating_light: $MSG$PROBLEMS"
else
  notify ":green_heart: $MSG"
fi
