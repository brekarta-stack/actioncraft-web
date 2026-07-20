#!/bin/sh
# agent-config 되돌리기 — 상시 실행(launchd)만 안전하게 해제한다.
# 기본은 "비활성화"이며, 데이터(레포·시크릿)는 건드리지 않는다.
#   sh uninstall.sh            → launchd 3종 해제 + plist 제거
#   sh uninstall.sh --purge    → 위 + ~/agent-config, ~/.agent-secrets 까지 삭제(확인 후)

set -u
LA="$HOME/Library/LaunchAgents"
PURGE=0; [ "${1:-}" = "--purge" ] && PURGE=1

say() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
ok()  { printf '  \033[32m✓\033[0m %s\n' "$1"; }

say "launchd 해제"
for L in heartbeat gitsync hermes; do
  P="$LA/com.agent.$L.plist"
  launchctl bootout "gui/$(id -u)/com.agent.$L" 2>/dev/null
  launchctl unload "$P" 2>/dev/null
  [ -f "$P" ] && rm -f "$P" && ok "com.agent.$L 제거" || ok "com.agent.$L 없음"
done

say "전원 스케줄 원복(선택)"
printf '  (원하면 수동으로: sudo pmset repeat cancel)\n'

if [ "$PURGE" = 1 ]; then
  say "데이터 삭제 (--purge)"
  printf '  \033[31m정말 ~/agent-config 와 ~/.agent-secrets 를 삭제할까요? [yes 입력]:\033[0m '
  IFS= read -r a
  if [ "$a" = "yes" ]; then
    rm -rf "$HOME/agent-config" "$HOME/.agent-secrets"
    ok "삭제 완료 (원격 레포는 그대로 — 복구는 install 재실행)"
  else
    ok "취소 — 데이터 보존"
  fi
else
  printf '\n데이터는 보존했습니다. 완전 삭제는 --purge 옵션.\n'
fi
printf '\n해제 완료. 다시 켜려면 install.sh 재실행.\n\n'
