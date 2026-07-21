#!/bin/sh
# 훅 스크립트 검증 — 커밋 전 / 맥 설치 직후 실행한다.
# macOS와 Linux 양쪽에서 돌 수 있게 POSIX sh 기준.
#
# 원칙: "조용한 실패"가 이 시스템 최악의 결함이므로, 테스트는 문법이 아니라
#       실제 전송 경로(목 웹훅)와 실패 경로(5xx, 시크릿 부재)를 검증한다.
# 모든 케이스는 AGENT_SECRETS=/nonexistent 로 실 시크릿과 격리된다.

set -u
BASE="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0
WORK="$(mktemp -d "${TMPDIR:-/tmp}/hooktest.XXXXXX")"
SRV_PIDS=""

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
cleanup() {
  for p in $SRV_PIDS; do kill "$p" 2>/dev/null; done
  rm -rf "$WORK"
}
trap cleanup EXIT

# 공통 테스트 환경: 시크릿 격리 + 로그/상태를 작업 폴더로
# (문자열 확장이 아닌 함수 — $WORK에 공백이 있어도 안전)
iso() {
  env "AGENT_SECRETS=/nonexistent" "AGENT_LOG_DIR=$WORK/logs" "AGENT_STATE_DIR=$WORK/state" "$@"
}

start_server() {
  # $1 = mode(ok|fail), $2 = 이름. 표준출력: 포트번호
  _pf="$WORK/port.$2"; _bl="$WORK/bodies.$2"
  : > "$_bl"
  # stdout/stderr 을 반드시 끊는다 — 안 끊으면 호출부의 $(...) 가 EOF를 못 받아 영원히 대기
  python3 "$BASE/tests/mock_webhook.py" "$_pf" "$_bl" "$1" >/dev/null 2>&1 &
  SRV_PIDS="$SRV_PIDS $!"
  _i=0
  while [ ! -s "$_pf" ] && [ $_i -lt 50 ]; do sleep 0.1; _i=$((_i + 1)); done
  cat "$_pf"
}

json_check() {
  # $1 = body_log, $2 = 반드시 포함돼야 할 문자열. 마지막 body가 유효 JSON인지 + 문자열 포함인지
  python3 - "$1" "$2" <<'PYEOF'
import json, sys
raw = open(sys.argv[1], 'rb').read().split(b'\n===\n')
bodies = [b for b in raw if b.strip()]
if not bodies:
    sys.exit(1)
obj = json.loads(bodies[-1].decode('utf-8'))   # 유효 UTF-8 + 유효 JSON 강제
sys.exit(0 if sys.argv[2] in obj.get('text', '') else 1)
PYEOF
}

echo "[1/8] 셸 문법 검사 (sh -n)"
for f in "$BASE"/hooks/*.sh "$BASE"/hooks/lib/*.sh "$BASE"/tests/*.sh; do
  if sh -n "$f" 2>/dev/null; then pass "$(basename "$f")"; else fail "$(basename "$f") 문법 오류"; fi
done

echo "[2/8] plist 유효성 (macOS면 plutil, 아니면 python3)"
for p in "$BASE"/hooks/launchd/*.plist; do
  # __REPO__ 치환 후의 결과물을 검사한다 (설치 시 실제로 load되는 형태)
  SUBST="$WORK/$(basename "$p")"
  sed "s|__REPO__|/tmp/repo|g; s|__HERMES_START_COMMAND__|/bin/true|g" "$p" > "$SUBST"
  if command -v plutil >/dev/null 2>&1; then
    plutil -lint -s "$SUBST" >/dev/null 2>&1 && pass "$(basename "$p")" || fail "$(basename "$p") plutil 실패"
  else
    python3 -c "import plistlib,sys; plistlib.loads(open(sys.argv[1],'rb').read())" "$SUBST" 2>/dev/null \
      && pass "$(basename "$p")" || fail "$(basename "$p") 파싱 실패"
  fi
done

echo "[3/8] notify — 시크릿 없이 안전하게 실패 + 실패 로그 기록"
OUT="$(iso SLACK_WEBHOOK_URL= sh -c ". '$BASE/hooks/lib/notify.sh'; notify 'test'" 2>&1)"
RC=$?
if [ $RC -eq 1 ] && echo "$OUT" | grep -q "SLACK_WEBHOOK_URL not set"; then
  pass "graceful failure (rc=1)"
else
  fail "시크릿 없이 비정상 동작 (rc=$RC)"
fi
[ -f "$WORK/logs/notify-fail.log" ] && pass "notify-fail.log 기록됨" || fail "실패가 로그에 안 남음"

echo "[4/8] notify — 목 웹훅으로 실제 전송: 탭·CR·한글·따옴표가 유효 JSON으로 도착"
PORT_OK="$(start_server ok s_ok)"
iso SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_OK" sh -c \
  ". '$BASE/hooks/lib/notify.sh'; notify \"라인1 \\\"인용\\\" 값
라인2	탭과	한글 메시지 $(printf '\015')CR포함\"" 2>/dev/null
RC=$?
if [ $RC -eq 0 ]; then pass "전송 rc=0"; else fail "전송 실패 (rc=$RC)"; fi
json_check "$WORK/bodies.s_ok" "라인2" && pass "제어문자 포함 메시지가 유효 JSON" || fail "JSON 깨짐/내용 유실"

echo "[5/8] notify — Slack 5xx를 실패로 취급하고 흔적을 남기는지"
PORT_BAD="$(start_server fail s_bad)"
: > "$WORK/logs/notify-fail.log" 2>/dev/null || true
iso SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_BAD" sh -c \
  ". '$BASE/hooks/lib/notify.sh'; notify 'must-fail'" 2>/dev/null
RC=$?
if [ $RC -ne 0 ]; then pass "5xx → rc≠0 ($RC)"; else fail "5xx를 성공으로 처리 (조용한 유실!)"; fi
grep -q "SEND_FAIL" "$WORK/logs/notify-fail.log" 2>/dev/null && pass "실패 흔적 로그 기록" || fail "5xx 실패가 무흔적"

echo "[6/8] guard — 종료코드 보존·인자 검증·라벨 검증"
iso SLACK_WEBHOOK_URL= sh "$BASE/hooks/guard.sh" test-label sh -c 'exit 7' 2>/dev/null
[ $? -eq 7 ] && pass "종료코드 보존 (7)" || fail "종료코드 왜곡"
iso SLACK_WEBHOOK_URL= sh "$BASE/hooks/guard.sh" only-label 2>/dev/null
[ $? -eq 2 ] && pass "인자 부족 rc=2" || fail "인자 검증 실패"
iso SLACK_WEBHOOK_URL= sh "$BASE/hooks/guard.sh" "bad/label" true 2>/dev/null
[ $? -eq 2 ] && pass "경로문자 라벨 거부 rc=2" || fail "위험 라벨 통과"

echo "[7/8] guard — 한글·탭 섞인 실패 출력이 유효 JSON으로 도착 + 전체 로그 보존"
iso SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_OK" sh "$BASE/hooks/guard.sh" krtest \
  sh -c 'printf "에러:\t한글 메시지와 아주 긴 출력 %0.s가나다라마바사아자차카타파하 " 1 2 3 4 5 6 7 8 9 10; exit 3' 2>/dev/null
[ $? -eq 3 ] && pass "실패 rc 보존 (3)" || fail "rc 왜곡"
json_check "$WORK/bodies.s_ok" "guard" && pass "실패 알림이 유효 JSON (한글 절단 안전)" || fail "실패 알림 JSON 깨짐"
ls "$WORK/logs"/guard.krtest.*.log >/dev/null 2>&1 && pass "실패 전체 로그 보존" || fail "실패 로그 미보존"

echo "[8/8] heartbeat + git-sync — launchd 유사 환경(env -i)에서 완주"
# git 픽스처: bare 원격 + 클론
git init --bare -q "$WORK/remote.git"
git clone -q "$WORK/remote.git" "$WORK/repo" 2>/dev/null
( cd "$WORK/repo" && git config user.email t@t && git config user.name t \
  && mkdir -p skills/_quarantine && echo x > seed.txt && git add -A \
  && git commit -qm seed && git push -q origin HEAD )
# heartbeat 완주 (launchd처럼 최소 PATH)
env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" \
  AGENT_SECRETS=/nonexistent AGENT_LOG_DIR="$WORK/logs" AGENT_STATE_DIR="$WORK/state" \
  AGENT_REPO="$WORK/repo" SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_OK" \
  sh "$BASE/hooks/heartbeat.sh" 2>/dev/null
json_check "$WORK/bodies.s_ok" "heartbeat" && pass "heartbeat 완주·전송" || fail "heartbeat 실패"
# git-sync 완주: 격리함 자동 캡처 → 원격 반영 + 신선도 기록
echo "auto-skill" > "$WORK/repo/skills/_quarantine/new-skill.md"
env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" \
  AGENT_SECRETS=/nonexistent AGENT_LOG_DIR="$WORK/logs" AGENT_STATE_DIR="$WORK/state" \
  AGENT_REPO="$WORK/repo" SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_OK" \
  sh "$BASE/hooks/git-sync.sh" 2>/dev/null
( cd "$WORK/remote.git" && git log --format=%s -1 2>/dev/null | grep -q quarantine ) \
  && pass "격리함 자동 캡처가 원격 도달" || fail "격리함 캡처 미푸시 (Mini 사망 시 소실 위험)"
[ -f "$WORK/state/gitsync.ok" ] && pass "동기화 신선도 기록" || fail "gitsync.ok 미기록"

# 8b. git 신원 부재 → 허위 성공 알림 금지 (복구 직후 Mini 시나리오)
# macOS/최신 git은 신원이 없으면 user@host 로 자동 생성하므로, useConfigOnly=true 로
# 자동 생성을 막아 "커밋 실패" 조건을 확실히 재현한다(안 그러면 커밋이 성공해 오탐).
mkdir -p "$WORK/nohome"
printf '[user]\n\tuseConfigOnly = true\n' > "$WORK/nohome/gitconfig"
git clone -q "$WORK/remote.git" "$WORK/repo2" 2>/dev/null
echo "orphan-skill" > "$WORK/repo2/skills/_quarantine/orphan.md"
: > "$WORK/bodies.s_ok"
env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin HOME="$WORK/nohome" \
  GIT_CONFIG_GLOBAL="$WORK/nohome/gitconfig" GIT_CONFIG_SYSTEM=/dev/null \
  AGENT_SECRETS=/nonexistent AGENT_LOG_DIR="$WORK/logs" AGENT_STATE_DIR="$WORK/state2" \
  AGENT_REPO="$WORK/repo2" SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_OK" \
  sh "$BASE/hooks/git-sync.sh" 2>/dev/null
if grep -q "캡처·푸시했습니다" "$WORK/bodies.s_ok" 2>/dev/null; then
  fail "신원 부재인데 허위 성공 알림 발송"
else
  pass "신원 부재 시 허위 성공 없음"
fi
grep -q "커밋 실패" "$WORK/bodies.s_ok" 2>/dev/null \
  && pass "커밋 실패가 알림으로 드러남" || fail "커밋 실패가 무음"

# 8c. 분기(divergence) 자동 해소 — 로컬 미푸시 커밋 + 원격 선행 커밋 → rebase로 동기화
( cd "$WORK/repo" && echo local-note > local.md && git add local.md \
  && git commit -qm "local: unpushed note" )
git clone -q "$WORK/remote.git" "$WORK/other" 2>/dev/null
( cd "$WORK/other" && git config user.email o@o && git config user.name o \
  && echo remote-change > CLAUDE-extra.md && git add -A \
  && git commit -qm "remote: laptop edit" && git push -q )
env -i PATH=/usr/bin:/bin:/usr/sbin:/sbin HOME="$HOME" \
  AGENT_SECRETS=/nonexistent AGENT_LOG_DIR="$WORK/logs" AGENT_STATE_DIR="$WORK/state" \
  AGENT_REPO="$WORK/repo" SLACK_WEBHOOK_URL="http://127.0.0.1:$PORT_OK" \
  sh "$BASE/hooks/git-sync.sh" 2>/dev/null
RC=$?
REMOTE_LOG="$(cd "$WORK/remote.git" && git log --format=%s 2>/dev/null)"
if [ $RC -eq 0 ] && echo "$REMOTE_LOG" | grep -q "local: unpushed note" \
   && echo "$REMOTE_LOG" | grep -q "remote: laptop edit"; then
  pass "분기 자동 해소 (rebase) — 양쪽 커밋 모두 원격 도달"
else
  fail "분기 교착 (rc=$RC) — ff-only 회귀 의심"
fi

echo ""
if [ $FAIL -eq 0 ]; then
  echo "ALL PASS"
  exit 0
else
  echo "${FAIL}개 실패"
  exit 1
fi
