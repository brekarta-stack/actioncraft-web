#!/bin/sh
# Slack 알림 공용 함수 — 모든 훅이 이 파일을 source 한다.
# 시크릿은 ~/.agent-secrets/hermes.env 에서만 로드 (git 밖).

SECRETS_FILE="${AGENT_SECRETS:-$HOME/.agent-secrets/hermes.env}"
if [ -f "$SECRETS_FILE" ]; then
  # shellcheck disable=SC1090
  . "$SECRETS_FILE"
fi

# notify "메시지" — #agent-log 채널로 전송. 실패해도 호출자를 죽이지 않는다.
notify() {
  _msg="$1"
  if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "[notify] SLACK_WEBHOOK_URL not set — message: $_msg" >&2
    return 1
  fi
  # JSON 이스케이프 (백슬래시 → 따옴표 → 개행 순서 중요)
  _esc=$(printf '%s' "$_msg" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
  curl -sS -m 10 -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"${_esc}\"}" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
  _rc=$?
  if [ $_rc -ne 0 ]; then
    echo "[notify] Slack 전송 실패 (rc=$_rc): $_msg" >&2
  fi
  return $_rc
}
