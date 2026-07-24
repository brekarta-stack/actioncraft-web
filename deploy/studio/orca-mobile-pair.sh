#!/usr/bin/env bash
#
# Pair the native Orca mobile app (iOS/Android) with the Studio runtime.
#
# The durable server (com.orca.serve) advertises a *runtime*-scope pairing for the
# Windows desktop + browser web client. The mobile app wants a *mobile*-scope QR,
# and Orca's single-instance lock allows only one `orca serve` at a time — so this
# helper briefly stops the durable server, prints a QR to scan, then restores it.
#
# Phone must have Tailscale ON. Scan the QR in the Orca app, then press Ctrl+C.
#
#   bash deploy/studio/orca-mobile-pair.sh
#
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

LABEL="com.orca.serve"
UID_N="$(id -u)"
DOMAIN="gui/${UID_N}"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"

restore() {
  echo ""
  echo "→ Restoring durable runtime server (${LABEL})…"
  launchctl bootstrap "${DOMAIN}" "$PLIST" 2>/dev/null || true
  launchctl enable "${DOMAIN}/${LABEL}" 2>/dev/null || true
  sleep 2
  orca status 2>/dev/null | grep -iE "runtimeReachable" || true
  echo "→ Done."
}
trap restore EXIT INT TERM

echo "→ Stopping durable server to free the single-instance lock…"
launchctl bootout "${DOMAIN}/${LABEL}" 2>/dev/null || true
for i in $(seq 1 20); do
  pgrep -f "app.asar.unpacked/out/cli/index.js serve" >/dev/null 2>&1 || break
  sleep 0.5
done

echo "→ Starting mobile pairing. Scan the QR below with the Orca app (Tailscale ON)."
echo "  Already-paired Windows/desktop clients reconnect automatically afterwards."
echo "  Press Ctrl+C once the phone shows paired."
echo ""
orca serve --port 6768 --pairing-address 100.65.201.6 --mobile-pairing
