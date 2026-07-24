#!/usr/bin/env bash
#
# Pair the native Orca mobile app (iOS/Android) with the Studio runtime.
#
# The durable server (com.orca.serve) advertises a *runtime*-scope pairing for the
# Windows desktop + browser web client. The mobile app wants a *mobile*-scope QR,
# and Orca's single-instance lock allows only one `orca serve` at a time — so this
# helper briefly stops the durable server, prints a QR to scan, then restores it.
#
# FIRST install the native Orca Mobile app on the phone (the pairing links are
# NOT install links — orca://pair and the web-client URL only work once the app
# exists / in a browser):
#   iOS App Store : https://apps.apple.com/app/orca-ide/id6766130217
#   iOS TestFlight: https://testflight.apple.com/join/YjeGMQBA
#   Android APK   : https://github.com/stablyai/orca/releases  (tag mobile-android-v*)
#
# Then: phone Tailscale ON -> open Orca app -> Pair -> scan the QR below -> Ctrl+C.
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

echo "→ Install the Orca Mobile app on the phone FIRST (pairing links are not install links):"
echo "    iOS : https://apps.apple.com/app/orca-ide/id6766130217  (or TestFlight https://testflight.apple.com/join/YjeGMQBA)"
echo "    Android APK: https://github.com/stablyai/orca/releases  (latest tag mobile-android-v*)"
echo ""
echo "→ Starting mobile pairing. In the Orca app tap Pair, then scan the QR below (Tailscale ON)."
echo "  Already-paired Windows/desktop clients reconnect automatically afterwards."
echo "  Press Ctrl+C once the phone shows paired."
echo ""
orca serve --port 6768 --pairing-address 100.65.201.6 --mobile-pairing
