#!/bin/sh
# 헤르메스 자동 감지 — 맥에서 실행하면 recovery.md "헤르메스 카드"를 채울 값을 출력한다.
# 읽기 전용(시스템 변경 없음). SSH로 접속해 실행하고 출력을 그대로 카드에 붙이면 된다.
#   sh hooks/detect-hermes.sh
#   sh hooks/detect-hermes.sh --write   # recovery.md 카드 자리에 자동 반영(백업 남김)

set -u
REPO="$(cd "$(dirname "$0")/.." && pwd)"

find_bin() {
  command -v hermes 2>/dev/null && return 0
  for p in /opt/homebrew/bin/hermes /usr/local/bin/hermes "$HOME/.local/bin/hermes" \
           "$HOME/go/bin/hermes" /opt/hermes/bin/hermes; do
    [ -x "$p" ] && { echo "$p"; return 0; }
  done
  return 1
}

BIN="$(find_bin || true)"
VERSION="(확인 필요)"; CONFIG="(확인 필요)"; RUNCMD="(확인 필요)"; INSTALL="(확인 필요)"

if [ -n "$BIN" ]; then
  INSTALL="$BIN (PATH에 설치됨)"
  case "$BIN" in
    /opt/homebrew/*|/usr/local/*) INSTALL="brew (추정) — 확인: brew list | grep -i hermes / $BIN" ;;
  esac
  V="$("$BIN" --version 2>/dev/null || "$BIN" version 2>/dev/null || echo '')"
  [ -n "$V" ] && VERSION="$V"
fi

# 실행 중인 프로세스에서 실제 시작 명령 추출
# (부분매칭 오탐 방지: 실행 파일 토큰 자체에 hermes가 있을 때만 인정 — 'hermes.env 편집기' 등 배제)
PS_LINE="$(pgrep -fl hermes 2>/dev/null | grep -v detect-hermes \
  | awk '{ c=$2; n=split(c,a,"/"); if (a[n] ~ /hermes/) { print; exit } }' || true)"
if [ -n "$PS_LINE" ]; then
  RUNCMD="exec ${PS_LINE#* }"   # PID 제거 후 exec 접두(포그라운드 권장)
fi

# 설정 파일 후보
for c in "$HOME/.hermes/config.yaml" "$HOME/.hermes/config.yml" "$HOME/.hermes/config.json" \
         "$HOME/.config/hermes/config.yaml" "$HOME/Library/Application Support/hermes/config.yaml"; do
  [ -f "$c" ] && { CONFIG="$c"; break; }
done

# 스킬 저장 경로 후보 (격리 연결 대상)
SKILLDIR="(확인 필요 — skills/_quarantine/ 로 지정 권장)"
for s in "$HOME/.hermes/skills" "$HOME/.config/hermes/skills"; do
  [ -d "$s" ] && { SKILLDIR="$s  →  $REPO/skills/_quarantine/ 로 변경 권장"; break; }
done

CARD="| 항목 | 값 |
|---|---|
| 설치 방법/명령 | $INSTALL |
| 현재 버전 | $VERSION |
| 설정 파일 위치 | $CONFIG |
| 스킬 저장 경로 | $SKILLDIR |
| 포그라운드 시작 명령 | $RUNCMD |
| Slack 봇 토큰 | 패스워드 매니저 \`agent-hermes-bot\` (값은 여기 쓰지 않는다) |"

printf '\n===== 헤르메스 카드 (recovery.md 에 붙여넣기) =====\n\n%s\n\n' "$CARD"
[ -z "$BIN" ] && printf '⚠️ hermes 바이너리를 찾지 못했습니다. 실행 중이면 pgrep -fl hermes 로 경로를 확인하세요.\n\n'

if [ "${1:-}" = "--write" ]; then
  RC="$REPO/docs/recovery.md"
  if [ -f "$RC" ]; then
    cp "$RC" "$RC.bak.$(date +%Y%m%d-%H%M%S)"
    printf '%s\n' "$CARD" > "$REPO/docs/.hermes-card.detected"
    printf '감지 결과를 %s/docs/.hermes-card.detected 에 저장했습니다.\n' "$REPO"
    printf 'recovery.md 의 "헤르메스 카드" 표를 이 내용으로 교체 후 커밋하세요.\n'
  fi
fi
