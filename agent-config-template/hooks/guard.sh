#!/bin/sh
# 실패 알림 래퍼 — 모든 예약 작업을 이걸로 감싼다.
# 사용: guard.sh <라벨> <명령...>
# 예:  guard.sh nightly-backup /usr/bin/rsync -a ~/data /Volumes/NAS/backup
# 명령이 실패(비정상 종료)하면 즉시 #agent-log로 알림. 성공은 조용히.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

if [ $# -lt 2 ]; then
  echo "usage: guard.sh <label> <command...>" >&2
  exit 2
fi

LABEL="$1"; shift

OUT_FILE="$(mktemp "${TMPDIR:-/tmp}/guard.${LABEL}.XXXXXX")"
"$@" >"$OUT_FILE" 2>&1
RC=$?

if [ $RC -ne 0 ]; then
  TAIL="$(tail -c 400 "$OUT_FILE" 2>/dev/null)"
  notify ":x: [guard] '$LABEL' 실패 (exit=$RC)
마지막 출력:
$TAIL"
fi

rm -f "$OUT_FILE"
exit $RC
