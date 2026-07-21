#!/bin/sh
# agent-config 원커맨드 설치기 — 이 한 줄이 기존 README 0~5단계를 전부 대신한다.
#   sh install.sh
# 재실행해도 안전(idempotent). macOS 대상(리눅스에서는 launchd/pmset을 건너뛴다).
#
# 물어보는 값은 딱 두 가지(그마저도 대부분 자동 감지·건너뛰기 가능):
#   1) Slack Webhook URL (필수) — 붙여넣기
#   2) macOS 로그인 암호 (pmset sudo용) — 상시 가동 설정 시
#
# 환경변수로 무인 실행도 가능:
#   AGENT_WEBHOOK=... AGENT_REMOTE=... AGENT_HERMES_CMD=... sh install.sh
#   AGENT_INSTALL_DRYRUN=1 → 실제 변경 없이 흐름만 점검(리눅스 테스트용)

set -u
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="${AGENT_HOME:-$HOME/agent-config}"
SECRETS_DIR="$HOME/.agent-secrets"
SECRETS_FILE="$SECRETS_DIR/hermes.env"
DRY="${AGENT_INSTALL_DRYRUN:-0}"
NONINT="${AGENT_NONINTERACTIVE:-0}"   # 1이면 선택 프롬프트(원격·헤르메스)를 건너뛴다
IS_MAC=0; [ "$(uname 2>/dev/null)" = "Darwin" ] && IS_MAC=1

say()  { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
die()  { printf '  \033[31m✗ %s\033[0m\n' "$1"; exit 1; }
run()  { if [ "$DRY" = 1 ]; then printf '  [dry] %s\n' "$*"; else "$@"; fi; }
ask()  { printf '\n\033[1m%s\033[0m ' "$1" >&2; IFS= read -r _a || _a=""; printf '%s' "$_a"; }

# env 파일에 key=value 를 안전하게 기록(값에 / & 가 있어도 안전 — sed 미사용)
set_env() {
  _k="$1"; _v="$2"; _f="$3"
  [ -f "$_f" ] || : > "$_f"
  grep -v "^${_k}=" "$_f" > "$_f.tmp" 2>/dev/null || : > "$_f.tmp"
  printf '%s=%s\n' "$_k" "$_v" >> "$_f.tmp"
  mv "$_f.tmp" "$_f"
  chmod 600 "$_f" 2>/dev/null || true
}

printf '\n\033[1m=== agent-config 설치 ===\033[0m\n'
[ "$DRY" = 1 ] && warn "DRY-RUN 모드 — 실제 변경 없음"
[ "$IS_MAC" = 1 ] || warn "macOS가 아님 — launchd/pmset 단계는 건너뜁니다(파일 설치·테스트만)."

# ── 1. 선행 확인 ──
say "1/7 선행 확인"
command -v git >/dev/null 2>&1 || die "git이 필요합니다. Xcode Command Line Tools를 먼저 설치하세요: xcode-select --install"
ok "git 확인"
if ! git config --global user.email >/dev/null 2>&1; then
  warn "git 신원이 없습니다 (없으면 자동 커밋이 실패합니다)."
  if [ "$NONINT" = 1 ]; then
    _nm="${GIT_NAME:-agent}"; _em="${GIT_EMAIL:-agent@localhost}"
  else
    _nm="${GIT_NAME:-$(ask 'git 사용자 이름:')}"
    _em="${GIT_EMAIL:-$(ask 'git 이메일:')}"
  fi
  run git config --global user.name "$_nm"
  run git config --global user.email "$_em"
  ok "git 신원 설정"
else
  ok "git 신원 확인 ($(git config --global user.email))"
fi

# ── 2. 파일 배치 ──
say "2/7 파일 배치 → $DEST"
if [ "$SRC_DIR" != "$DEST" ]; then
  run mkdir -p "$DEST"
  # .git 등 제외하고 템플릿 내용만 복사
  if [ "$DRY" != 1 ]; then
    (cd "$SRC_DIR" && tar cf - --exclude=.git --exclude=logs .) | (cd "$DEST" && tar xf -)
  fi
fi
[ "$DRY" = 1 ] || cd "$DEST" || die "$DEST 로 이동 실패"
if [ "$DRY" != 1 ] && [ ! -d .git ]; then
  git init -b main >/dev/null 2>&1 || git init >/dev/null 2>&1
  ok "git 저장소 초기화"
fi
run mkdir -p logs
# 베이스라인 커밋 — 안 하면 전 파일이 '미추적'이라 heartbeat의 격리-우회 검사가 오탐한다
if [ "$DRY" != 1 ] && ! git -C "$DEST" rev-parse HEAD >/dev/null 2>&1; then
  git -C "$DEST" add -A >/dev/null 2>&1
  git -C "$DEST" commit -q -m "chore: bootstrap agent-config baseline" >/dev/null 2>&1 \
    && ok "베이스라인 커밋" || warn "베이스라인 커밋 실패 (git 신원 확인)"
fi
ok "파일 배치 완료"

# ── 3. 시크릿 ──
say "3/7 시크릿 파일"
run mkdir -p "$SECRETS_DIR"
run chmod 700 "$SECRETS_DIR"
if [ "$DRY" != 1 ] && [ ! -f "$SECRETS_FILE" ]; then
  cp "$DEST/config/hermes.env.example" "$SECRETS_FILE"
  chmod 600 "$SECRETS_FILE"
fi
# Webhook (필수)
_have_wh=0
[ "$DRY" != 1 ] && grep -q '^SLACK_WEBHOOK_URL=https' "$SECRETS_FILE" 2>/dev/null && _have_wh=1
if [ "$_have_wh" = 0 ]; then
  _wh="${AGENT_WEBHOOK:-$(ask 'Slack Webhook URL 붙여넣기 (없으면 Enter로 건너뛰고 나중에):')}"
  if [ -n "$_wh" ]; then
    [ "$DRY" = 1 ] || set_env SLACK_WEBHOOK_URL "$_wh" "$SECRETS_FILE"
    ok "Webhook 저장"
  else
    warn "Webhook 미설정 — heartbeat가 Slack에 못 갑니다. 나중에 $SECRETS_FILE 편집."
  fi
else
  ok "Webhook 이미 설정됨"
fi
# AGENT_REPO 절대경로 기록 (헤르메스/훅이 참조)
[ "$DRY" = 1 ] || set_env AGENT_REPO "$DEST" "$SECRETS_FILE"
ok "AGENT_REPO=$DEST 기록"

# ── 4. 실행권한 + 테스트 ──
say "4/7 실행권한 + 자동 테스트"
run chmod +x "$DEST"/hooks/*.sh "$DEST"/hooks/lib/*.sh "$DEST"/tests/*.sh
if [ "$DRY" = 1 ]; then
  warn "dry-run: 테스트 건너뜀"
else
  if sh "$DEST/tests/test_hooks.sh" >/tmp/agent-install-test.log 2>&1; then
    ok "자동 테스트 ALL PASS"
  else
    warn "테스트 실패 — /tmp/agent-install-test.log 확인 (설치는 계속)"
  fi
fi

# ── 5. 원격 백업(선택) ──
say "5/7 원격 백업 저장소 (선택)"
if [ "$DRY" != 1 ] && ! git -C "$DEST" remote get-url origin >/dev/null 2>&1; then
  _rm="${AGENT_REMOTE:-}"
  if [ -z "$_rm" ] && [ "$NONINT" != 1 ]; then
    _rm="$(ask 'agent-config 비공개 레포 URL (없으면 Enter로 건너뜀 — 원격 백업은 나중에):')"
  fi
  if [ -n "$_rm" ]; then
    git -C "$DEST" add -A && git -C "$DEST" commit -m "chore: bootstrap agent-config" >/dev/null 2>&1
    git -C "$DEST" remote add origin "$_rm"
    if git -C "$DEST" push -u origin main >/dev/null 2>&1 || git -C "$DEST" push -u origin master >/dev/null 2>&1; then
      ok "원격 백업 연결·푸시"
    else
      warn "푸시 실패(인증 확인). 로컬 커밋은 됨 — 나중에 git push."
    fi
  else
    warn "원격 미설정 — _quarantine 자동 백업이 비활성(로컬 커밋만). 나중에 git remote add origin ... 하면 활성화."
  fi
else
  ok "원격 이미 연결됨 또는 dry-run"
fi

# ── 6. launchd 상시 실행 (macOS) ──
say "6/7 상시 실행 등록 (launchd)"
if [ "$IS_MAC" = 1 ] && [ "$DRY" != 1 ]; then
  LA="$HOME/Library/LaunchAgents"
  mkdir -p "$LA"
  cp "$DEST"/hooks/launchd/*.plist "$LA/"
  # __REPO__ 치환
  for P in "$LA"/com.agent.*.plist; do
    sed -i '' "s|__REPO__|$DEST|g" "$P" 2>/dev/null || sed -i "s|__REPO__|$DEST|g" "$P"
  done
  # 헤르메스 시작 명령 (선택) — 감지 + 프롬프트
  _hcmd="${AGENT_HERMES_CMD:-}"
  if [ -z "$_hcmd" ] && [ "$NONINT" != 1 ]; then
    if pgrep -fl hermes >/dev/null 2>&1; then
      warn "실행 중인 헤르메스로 보이는 프로세스가 있습니다:"
      pgrep -fl hermes 2>/dev/null | head -2 | sed 's/^/      /'
    fi
    _hcmd="$(ask '헤르메스 포그라운드 시작 명령 (예: exec hermes run --foreground / 없으면 Enter로 나중에):')"
  fi
  lc_reload() {
    _L="$1"; _P="$LA/com.agent.$_L.plist"
    launchctl bootout "gui/$(id -u)/com.agent.$_L" 2>/dev/null
    launchctl bootstrap "gui/$(id -u)" "$_P" 2>/dev/null \
      || { launchctl unload "$_P" 2>/dev/null; launchctl load -w "$_P" 2>/dev/null; }
  }
  lc_reload heartbeat; lc_reload gitsync
  ok "heartbeat·git-sync 등록"
  if [ -n "$_hcmd" ]; then
    _esc=$(printf '%s' "$_hcmd" | sed 's/[&|]/\\&/g')
    sed -i '' "s|__HERMES_START_COMMAND__|$_esc|g" "$LA/com.agent.hermes.plist" 2>/dev/null \
      || sed -i "s|__HERMES_START_COMMAND__|$_esc|g" "$LA/com.agent.hermes.plist"
    lc_reload hermes
    ok "헤르메스 등록"
  else
    warn "헤르메스 시작 명령 미입력 — heartbeat가 hermes=DOWN을 보고합니다(정상). 나중에 install 재실행 또는 plist 편집."
  fi
  # 전원·자동기상 (sudo)
  printf '\n  상시 가동을 위해 잠자기 해제·자동기상을 설정합니다(로그인 암호가 필요할 수 있음).\n'
  sudo pmset -a sleep 0 autorestart 1 2>/dev/null && ok "잠자기 해제·정전복구 설정" || warn "pmset 실패 — 나중에: sudo pmset -a sleep 0 autorestart 1"
  sudo pmset repeat wakeorpoweron MTWRFSU 07:55:00 2>/dev/null && ok "매일 07:55 자동 기상" || true
  warn "자동 로그인: 시스템 설정 > 사용자 및 그룹 에서 켜야 재부팅 후에도 훅이 돕니다(FileVault와 트레이드오프)."
else
  warn "macOS 아님/dry-run — launchd·pmset 건너뜀"
fi

# ── 7. 검증: heartbeat 1발 ──
say "7/7 검증"
if [ "$DRY" != 1 ]; then
  if sh "$DEST/hooks/heartbeat.sh" 2>/dev/null; then
    ok "heartbeat 전송 시도 완료 → Slack #agent-log 를 확인하세요"
    printf '     (이 시점 정상 결과는 헤르메스 미설정 시 :rotating_light: hermes=DOWN 입니다 — "메시지가 온다"가 핵심)\n'
  else
    warn "heartbeat 실행 문제 — Webhook 미설정이면 정상. 설정했다면: sh -x $DEST/hooks/heartbeat.sh"
  fi
fi

printf '\n\033[1;32m=== 설치 완료 ===\033[0m\n'
printf '남은 일:\n'
printf '  1) Slack #agent-log 에 heartbeat가 왔는지 확인\n'
printf '  2) (Webhook·헤르메스를 건너뛰었다면) %s 편집 후 이 스크립트 재실행\n' "$SECRETS_FILE"
printf '  3) 매일 아침 10초, #agent-log 의 :green_heart: 확인 — 운영 시작\n'
printf '문서: %s/docs/runbook.md · 복구: %s/docs/recovery.md\n\n' "$DEST" "$DEST"
