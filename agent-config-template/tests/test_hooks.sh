#!/bin/sh
# 훅 스크립트 검증 — 커밋 전 / 맥 설치 직후 실행한다.
# macOS와 Linux 양쪽에서 돌 수 있게 POSIX sh 기준.

set -u
BASE="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0

pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

echo "[1/4] 셸 문법 검사 (sh -n)"
for f in "$BASE"/hooks/*.sh "$BASE"/hooks/lib/*.sh; do
  if sh -n "$f" 2>/dev/null; then pass "$(basename "$f")"; else fail "$(basename "$f") 문법 오류"; fi
done

echo "[2/4] plist XML 유효성"
for p in "$BASE"/hooks/launchd/*.plist; do
  if python3 -c "import plistlib,sys; plistlib.loads(open(sys.argv[1],'rb').read())" "$p" 2>/dev/null; then
    pass "$(basename "$p")"
  else
    fail "$(basename "$p") XML 파싱 실패"
  fi
done

echo "[3/4] notify — 시크릿 없이 안전하게 실패하는지"
# SLACK_WEBHOOK_URL 미설정 시: 죽지 않고 rc=1 + stderr 안내가 정상 동작
OUT="$(AGENT_SECRETS=/nonexistent SLACK_WEBHOOK_URL= sh -c ". '$BASE/hooks/lib/notify.sh'; notify 'test'" 2>&1)"
RC=$?
if [ $RC -eq 1 ] && echo "$OUT" | grep -q "SLACK_WEBHOOK_URL not set"; then
  pass "notify graceful failure (rc=1)"
else
  fail "notify가 시크릿 없이 비정상 동작 (rc=$RC, out=$OUT)"
fi

echo "[4/4] guard — 실패한 명령의 종료코드를 보존하는지"
AGENT_SECRETS=/nonexistent SLACK_WEBHOOK_URL= sh "$BASE/hooks/guard.sh" test-label sh -c 'exit 7' 2>/dev/null
RC=$?
if [ $RC -eq 7 ]; then pass "guard exit code 보존 (7)"; else fail "guard 종료코드 왜곡 (기대 7, 실제 $RC)"; fi

# 인자 부족 시 사용법 안내
sh "$BASE/hooks/guard.sh" only-label 2>/dev/null
RC=$?
if [ $RC -eq 2 ]; then pass "guard 인자 검증 (rc=2)"; else fail "guard 인자 검증 실패 (rc=$RC)"; fi

echo ""
if [ $FAIL -eq 0 ]; then
  echo "ALL PASS"
  exit 0
else
  echo "$FAIL개 실패"
  exit 1
fi
