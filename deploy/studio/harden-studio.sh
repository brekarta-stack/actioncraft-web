#!/bin/bash
# Studio 24/7 하드닝 (D2) — 로컬 티어 상시 가동 준비. sudo 필요.
# 실행: bash harden-studio.sh
set -u

echo "== 1. 전원: 잠자기 방지 + 정전 후 자동시동 =="
sudo pmset -a sleep 0 disksleep 0 womp 1 autorestart 1 && echo "OK pmset" || echo "! pmset 실패"
echo "  자동 로그인: 시스템 설정>사용자 및 그룹 에서 수동으로 켜기(재부팅 후 서비스 자동시작)"

echo "== 2. ollama를 NAS가 부를 수 있게 (재부팅 생존 + Tailscale IP 전용 바인딩) =="
# 문제(리뷰 C2/H2): launchctl setenv는 재부팅 시 사라지고, brew services는 그 env를 못 받음.
#   0.0.0.0은 LAN 전체 노출(ollama 인증 없음). → Studio의 Tailscale IP에만 바인딩 + 전용 LaunchAgent로 영속화.
STUDIO_TS_IP=$(tailscale ip -4 2>/dev/null || /Applications/Tailscale.app/Contents/MacOS/Tailscale ip -4 2>/dev/null | head -1)
if [ -z "$STUDIO_TS_IP" ]; then echo "  ! Tailscale IP를 못 찾음 — Tailscale 로그인 후 재실행"; else echo "  Studio Tailscale IP = $STUDIO_TS_IP"; fi
brew services stop ollama 2>/dev/null; launchctl bootout gui/$(id -u)/homebrew.mxcl.ollama 2>/dev/null || true   # 중복 바인드 방지
OLLAMA_BIN=$(command -v ollama)
mkdir -p ~/Library/LaunchAgents ~/Library/Logs
cat > ~/Library/LaunchAgents/com.agent.ollama.plist <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.agent.ollama</string>
  <key>ProgramArguments</key><array><string>${OLLAMA_BIN}</string><string>serve</string></array>
  <key>EnvironmentVariables</key><dict>
    <key>OLLAMA_HOST</key><string>${STUDIO_TS_IP}:11434</string>
    <key>OLLAMA_KEEP_ALIVE</key><string>-1</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${HOME}/Library/Logs/ollama.log</string>
  <key>StandardErrorPath</key><string>${HOME}/Library/Logs/ollama.err</string>
</dict></plist>
PLIST
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.agent.ollama.plist 2>/dev/null || launchctl load -w ~/Library/LaunchAgents/com.agent.ollama.plist
echo "  → ollama가 ${STUDIO_TS_IP}:11434 에 바인딩(재부팅 생존). NAS의 .env STUDIO_OLLAMA_BASE=http://${STUDIO_TS_IP}:11434"
echo "  ⚠️ macOS 방화벽 ON. Tailscale IP 바인딩이라 LAN 노출 없음(0.0.0.0 아님)."
# CLIENT도 같은 엔드포인트를 봐야 함(서버가 127.0.0.1이 아니라 Tailscale IP에 붙음). 영구 등록.
grep -q '^export OLLAMA_HOST=' ~/.zshrc 2>/dev/null || echo "export OLLAMA_HOST=\"${STUDIO_TS_IP}:11434\"" >> ~/.zshrc
# 서버가 실제로 응답할 때까지 대기(경쟁 조건 방지 — 안 하면 첫 pull이 튕김)
echo "  ollama 서버 기동 대기..."
for i in $(seq 1 30); do
  curl -s "http://${STUDIO_TS_IP}:11434/api/tags" >/dev/null 2>&1 && { echo "  서버 준비됨"; break; }
  sleep 1
done

echo "== 3. 로컬 모델 상주 (미리 받기) =="
# OLLAMA_HOST가 설정됐으니 pull도 같은 엔드포인트로. (태그는 설치 시 현재 버전 확인)
export OLLAMA_HOST="${STUDIO_TS_IP}:11434"
for m in qwen2.5:7b qwen3.6:35b-a3b qwen3-coder:30b bge-m3; do
  echo "  pull $m ..."; ollama pull "$m" || echo "  ! $m 실패(태그 확인)"
done
# OLLAMA_KEEP_ALIVE=-1(plist)로 모델 상주 → 콜드스타트 제거.
echo "== 4. 확인 =="
ollama list
echo "== 5. Studio의 Tailscale 이름 확인(라우팅 config의 STUDIO_HOST에 사용) =="
/Applications/Tailscale.app/Contents/MacOS/Tailscale status 2>/dev/null | head -3 || tailscale status 2>/dev/null | head -3
echo "완료. litellm-config.yaml의 STUDIO_HOST를 위 Tailscale 이름으로 교체."
