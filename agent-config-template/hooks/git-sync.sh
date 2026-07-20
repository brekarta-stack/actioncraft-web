#!/bin/sh
# 설정 레포 동기화 — 5분마다 launchd(com.agent.gitsync.plist)가 실행.
# 역할 1: pull — "어디서든 수정 → 커밋 → Mini가 자동 반영"의 반영 담당
# 역할 2: push — Mini에서 자동 생성된 _quarantine 스킬을 원격에 올려
#               (a) 어느 기기에서든 심사 가능하게 (b) Mini 사망 시에도 소실 없게
#
# 불변 조건:
#   - 자동 캡처는 오직 skills/_quarantine/ 만 커밋한다. 격리 밖 경로가 스테이징돼
#     있으면 캡처를 중단하고 경보한다 (격리 우회를 자동 커밋으로 위장하는 것 방지).
#   - 성공 알림은 실제로 원격에 도달했을 때만 보낸다 (허위 성공 금지).
# 알림 정책: 실패는 "첫 발생 1회 + 이후 24시간마다 1회", 복구 시 복구 알림 1회.

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HOOK_DIR/lib/notify.sh"

export GIT_TERMINAL_PROMPT=0   # launchd 환경에서 인증 프롬프트 대기로 멈추는 것 방지

REPO="${AGENT_REPO:-$HOME/agent-config}"
mkdir -p "$AGENT_STATE_DIR" 2>/dev/null
FAIL_MARK="$AGENT_STATE_DIR/gitsync.lastfail"
LOCK_DIR="$AGENT_STATE_DIR/gitsync.lock"
RUN_FAILED=""
HAD_FAIL=""
[ -f "$FAIL_MARK" ] && HAD_FAIL=1

# ── 동시 실행 방지 (launchd 주기와 수동 실행 겹침 → index.lock 경합) ──
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  # 10분 넘은 락은 죽은 실행의 잔재로 보고 회수
  if [ -d "$LOCK_DIR" ] && [ -n "$(find "$LOCK_DIR" -maxdepth 0 -mmin +10 2>/dev/null)" ]; then
    rmdir "$LOCK_DIR" 2>/dev/null
    mkdir "$LOCK_DIR" 2>/dev/null || exit 0
  else
    exit 0   # 다른 실행이 진행 중 — 조용히 양보
  fi
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null' EXIT

fail_once_a_day() {
  RUN_FAILED=1
  _now=$(date +%s)
  _last=$(cat "$FAIL_MARK" 2>/dev/null || echo 0)
  case "$_last" in ''|*[!0-9]*) _last=0;; esac
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

# ── 역할 2a: _quarantine 자동 캡처 커밋 ──
QUAR_CAPTURED=""
QUAR_CHANGES="$(git status --porcelain -- skills/_quarantine/ 2>/dev/null)"
if [ -n "$QUAR_CHANGES" ]; then
  # 안전 검증: 격리 밖 경로가 이미 스테이징돼 있으면 자동 커밋에 휩쓸린다 → 중단·경보
  STAGED_OUTSIDE="$(git diff --cached --name-only 2>/dev/null | grep -v '^skills/_quarantine/' | head -3)"
  if [ -n "$STAGED_OUTSIDE" ]; then
    fail_once_a_day ":rotating_light: [git-sync] 격리 밖 경로가 스테이징돼 있어 자동 캡처를 중단합니다 (격리 우회 의심 — 심사 절차로만 이동 가능):
$STAGED_OUTSIDE"
  else
    # 새 스킬에 대한 기계 레드플래그 검사 (실행이 아닌 grep — 격리 원칙 유지)
    REDFLAGS=""
    if [ -x "$REPO/tests/skill-redflags.sh" ]; then
      for _f in $(git status --porcelain -- skills/_quarantine/ | awk '{print $NF}'); do
        [ -f "$_f" ] || continue
        if ! "$REPO/tests/skill-redflags.sh" "$_f" >/dev/null 2>&1; then
          REDFLAGS="$REDFLAGS $_f"
        fi
      done
    fi
    ERR_COMMIT="$(git add skills/_quarantine/ 2>&1 && git commit -m "chore(quarantine): auto-capture generated skills" -- skills/_quarantine/ 2>&1)"
    if [ $? -eq 0 ]; then
      QUAR_CAPTURED=1
    else
      fail_once_a_day ":x: [git-sync] 격리 캡처 커밋 실패 — git config user.name/email 설정 여부 확인:
$(printf '%s' "$ERR_COMMIT" | tail -n 3)"
    fi
  fi
fi

# ── 역할 1: pull (rebase — 격리 캡처 커밋과 원격 커밋의 분기를 자동 해소) ──
BEFORE="$(git rev-parse HEAD 2>/dev/null)"
ERR="$(git -c rebase.autoStash=true pull --rebase 2>&1)"
if [ $? -ne 0 ]; then
  fail_once_a_day ":x: [git-sync] pull 실패 — 원인:
$(printf '%s' "$ERR" | tail -n 5)
(해소: Mini에서 cd $REPO && git -c rebase.autoStash=true pull --rebase — runbook 참조)"
  exit 1
fi

# ── 역할 2b: 미푸시 커밋 푸시 (이번 실행 캡처분 + 과거에 좌초된 커밋 모두 재시도) ──
UNPUSHED="$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)"
case "$UNPUSHED" in ''|*[!0-9]*) UNPUSHED=0;; esac
if [ "$UNPUSHED" -gt 0 ]; then
  if git push >/dev/null 2>&1; then
    if [ -n "$QUAR_CAPTURED" ]; then
      if [ -n "${REDFLAGS:-}" ]; then
        notify ":rotating_light: [git-sync] 새 자동 생성 스킬 캡처·푸시 — 단, 레드플래그 검출(우선 심사 요망):$REDFLAGS"
      else
        notify ":inbox_tray: [git-sync] 새 자동 생성 스킬을 _quarantine에 캡처·푸시했습니다 (주간 심사 대상)."
      fi
    fi
  else
    fail_once_a_day ":x: [git-sync] 푸시 실패 (미푸시 커밋 ${UNPUSHED}건 — 다음 주기에 자동 재시도). 원격 인증 확인 필요."
  fi
fi

# ── 마무리: 신선도 기록 + 복구 알림 (이번 실행이 무결했을 때만) ──
date +%s > "$AGENT_STATE_DIR/gitsync.ok"
if [ -z "$RUN_FAILED" ] && [ -n "$HAD_FAIL" ]; then
  rm -f "$FAIL_MARK"
  notify ":white_check_mark: [git-sync] 복구됨 — 동기화 정상."
fi

AFTER="$(git rev-parse HEAD 2>/dev/null)"

if [ "$BEFORE" != "$AFTER" ]; then
  CHANGED="$(git diff --name-only "$BEFORE" "$AFTER" 2>/dev/null | head -10)"
  notify ":arrows_counterclockwise: [git-sync] 설정 반영됨 ($(git log -1 --format=%h))
$CHANGED"

  # plist는 ~/Library/LaunchAgents/ 의 사본이 실행되므로 pull만으로는 반영되지 않는다.
  if git diff --name-only "$BEFORE" "$AFTER" 2>/dev/null | grep -q '^hooks/launchd/.*\.plist$'; then
    notify ":warning: [git-sync] launchd plist 변경됨 — 재적용 필요:
cp hooks/launchd/*.plist ~/Library/LaunchAgents/ && sed -i '' \"s|__REPO__|\$HOME/agent-config|g\" ~/Library/LaunchAgents/com.agent.*.plist
launchctl unload ~/Library/LaunchAgents/com.agent.<이름>.plist && launchctl load ~/Library/LaunchAgents/com.agent.<이름>.plist"
  fi
fi
