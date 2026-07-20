#!/bin/sh
# Slack 알림 공용 함수 — 모든 훅이 이 파일을 source 한다.
# 시크릿은 ~/.agent-secrets/hermes.env 에서만 로드 (git 밖).
#
# 설계 원칙: 이 함수의 실패는 절대 조용해선 안 된다.
#   전송 실패 시 ① 영속 로그(notify-fail.log) 기록 ② macOS 로컬 알림 폴백.

SECRETS_FILE="${AGENT_SECRETS:-$HOME/.agent-secrets/hermes.env}"
if [ -f "$SECRETS_FILE" ]; then
  # shellcheck disable=SC1090
  . "$SECRETS_FILE"
fi

AGENT_LOG_DIR="${AGENT_LOG_DIR:-$HOME/Library/Logs/agent}"
AGENT_STATE_DIR="${AGENT_STATE_DIR:-$HOME/.agent-state}"

_notify_log_fail() {
  mkdir -p "$AGENT_LOG_DIR" 2>/dev/null
  printf '%s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S')" "$1" >> "$AGENT_LOG_DIR/notify-fail.log" 2>/dev/null
}

# notify "메시지" — #agent-log 채널로 전송. 실패해도 호출자를 죽이지 않는다.
notify() {
  _msg="$1"

  case "$SLACK_WEBHOOK_URL" in
    http://*|https://*) : ;;
    *)
      echo "[notify] SLACK_WEBHOOK_URL not set — message: $_msg" >&2
      _notify_log_fail "NO_WEBHOOK: $_msg"
      return 1
      ;;
  esac

  # 1) 제어문자 무해화: 탭/CR → 공백, 그 외 제어문자(ANSI ESC 포함) 제거 (개행은 보존)
  #    도구 출력(탭·컬러코드)이 JSON을 깨뜨려 "실패 알림일수록 유실되는" 결함의 방지선.
  _clean=$(printf '%s' "$_msg" | tr '\011\015' '  ' | tr -d '\000-\010\013-\037\177')

  # 2) JSON 이스케이프 (백슬래시 → 따옴표 → 개행 순서 중요)
  _esc=$(printf '%s' "$_clean" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

  # 3) 전송 — -f 로 HTTP 4xx/5xx 를 실패로 취급, 일시 장애는 3회 재시도
  #    (주의: rc는 반드시 명령 직후 캡처 — else 없는 if 뒤의 $? 는 0이 된다)
  curl -sS -f -m 10 --retry 3 --retry-all-errors -X POST \
    -H 'Content-type: application/json' \
    --data "{\"text\":\"${_esc}\"}" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
  _rc=$?
  [ "$_rc" -eq 0 ] && return 0

  # 4) 실패를 조용히 삼키지 않는다: 영속 로그 + 로컬 알림 폴백
  echo "[notify] Slack 전송 실패 (rc=$_rc): $_msg" >&2
  _notify_log_fail "SEND_FAIL(rc=$_rc): $_msg"
  if command -v osascript >/dev/null 2>&1; then
    osascript -e 'display notification "Slack 알림 전송 실패 — notify-fail.log 확인" with title "agent"' >/dev/null 2>&1
  fi
  return "$_rc"
}
