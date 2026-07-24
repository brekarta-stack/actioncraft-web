#!/usr/bin/env bash
#
# Install / refresh the durable Orca headless runtime server on the Mac Studio.
# Idempotent: safe to re-run. Reads the plist next to this script.
#
#   bash deploy/studio/orca-serve-setup.sh
#
set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"

LABEL="com.orca.serve"
UID_N="$(id -u)"
DOMAIN="gui/${UID_N}"
SRC_PLIST="$(cd "$(dirname "$0")" && pwd)/${LABEL}.plist"
DST_PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
LOG="${HOME}/Library/Logs/orca-serve.log"

command -v orca >/dev/null || { echo "ERROR: orca CLI not on PATH (brew install --cask stablyai/orca/orca)"; exit 1; }
[ -f "$SRC_PLIST" ] || { echo "ERROR: missing $SRC_PLIST"; exit 1; }

echo "→ Installing LaunchAgent plist"
mkdir -p "${HOME}/Library/LaunchAgents" "${HOME}/Library/Logs"
cp "$SRC_PLIST" "$DST_PLIST"
plutil -lint "$DST_PLIST" >/dev/null

echo "→ (Re)loading ${LABEL} in ${DOMAIN}"
launchctl bootout "${DOMAIN}/${LABEL}" 2>/dev/null || true
launchctl bootstrap "${DOMAIN}" "$DST_PLIST"
launchctl enable "${DOMAIN}/${LABEL}"

echo "→ Waiting for the server to advertise pairing…"
for i in $(seq 1 120); do
  if grep -q "Pairing URL:" "$LOG" 2>/dev/null && lsof -nP -iTCP:6768 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "→ Ready after ~${i}s"
    break
  fi
  sleep 1
done

echo ""
echo "==== Pairing (Tailscale-only — never port-forward 6768) ===="
grep "Advertised endpoint:" "$LOG" | tail -1
grep "Pairing URL:"        "$LOG" | tail -1
grep "Web client URL:"     "$LOG" | tail -1
echo ""
echo "Status:"; orca status 2>/dev/null | grep -iE "appRunning|runtimeState|runtimeReachable|graphState" || true
echo ""
echo "Manage:  launchctl print ${DOMAIN}/${LABEL} | grep -E 'state|pid|runs'"
echo "Stop:    launchctl bootout ${DOMAIN}/${LABEL}"
echo "Logs:    tail -f ${LOG}"
