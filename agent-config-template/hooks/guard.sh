#!/bin/sh
# 실패 알림 래퍼 — 모든 예약 작업을 이걸로 감싼다.
# 사용: guard.sh <라벨(영숫자._-)> <명령...>
# 예:  guard.sh nightly-backup /usr/bin/rsync -a ~/data /Volumes/NAS/backup
# 명령이 실패(비정상 종료)하면 즉시 #agent-log로 알림. 성공은 조용히.
#
# 불변 조건: 어떤 경우에도 ① 감싼 명령은 반드시 실행되고
#           ② 명령의 종료코드가 그대로 보존된다.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

if [ $# -lt 2 ]; then
  echo "usage: guard.sh <label> <command...>" >&2
  notify ":x: [guard] 설정 오류 — 인자 부족으로 예약 작업이 실행되지 않음: guard.sh $*"
  exit 2
fi

LABEL="$1"; shift

# 라벨 검증: 경로문자 등이 섞이면 mktemp가 실패해 명령 실행까지 막을 수 있다
case "$LABEL" in
  ""|*[!A-Za-z0-9._-]*)
    echo "usage: guard.sh <label> — 라벨은 영숫자 . _ - 만 허용" >&2
    notify ":x: [guard] 설정 오류 — 잘못된 라벨 '$LABEL' 로 예약 작업이 실행되지 않음 (영숫자 . _ - 만 허용)"
    exit 2
    ;;
esac

# 출력 캡처 준비 — mktemp가 실패해도(디스크 풀 등) 명령 실행은 무조건 보장
OUT_FILE="$(mktemp "${TMPDIR:-/tmp}/guard.${LABEL}.XXXXXX" 2>/dev/null || true)"
CAPTURE_NOTE=""
if [ -n "$OUT_FILE" ]; then
  trap 'rm -f "$OUT_FILE"' EXIT
  "$@" >"$OUT_FILE" 2>&1
  RC=$?
else
  CAPTURE_NOTE=" (출력 캡처 실패: mktemp — 디스크 확인 필요)"
  "$@"
  RC=$?
fi

if [ $RC -ne 0 ]; then
  TAIL=""; KEPT_NOTE=""
  if [ -n "$OUT_FILE" ]; then
    # 바이트 절단이 한글(멀티바이트)을 중간에 자르면 JSON이 깨진다 → iconv -c 로 깨진 바이트 제거
    if command -v iconv >/dev/null 2>&1; then
      TAIL="$(tail -c 500 "$OUT_FILE" 2>/dev/null | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null)"
    else
      TAIL="$(tail -n 8 "$OUT_FILE" 2>/dev/null)"
    fi
    # 조사용 전체 출력 보존 (Slack엔 꼬리만, 원본은 로그 디렉토리에)
    mkdir -p "$AGENT_LOG_DIR" 2>/dev/null
    KEEP_FILE="$AGENT_LOG_DIR/guard.${LABEL}.$(date '+%Y%m%d-%H%M%S').log"
    if mv "$OUT_FILE" "$KEEP_FILE" 2>/dev/null; then
      OUT_FILE=""   # trap의 rm 대상에서 제외
      KEPT_NOTE="
전체 로그: $KEEP_FILE"
    fi
  fi
  notify ":x: [guard] '$LABEL' 실패 (exit=$RC)$CAPTURE_NOTE
마지막 출력:
$TAIL$KEPT_NOTE"
fi

exit $RC
