#!/bin/bash
# Studio 24/7 하드닝 (D2) — 로컬 티어 상시 가동 준비. sudo 필요.
# 실행: bash harden-studio.sh
set -u

echo "== 1. 전원: 잠자기 방지 + 정전 후 자동시동 =="
sudo pmset -a sleep 0 disksleep 0 womp 1 autorestart 1 && echo "OK pmset" || echo "! pmset 실패"
echo "  자동 로그인: 시스템 설정>사용자 및 그룹 에서 수동으로 켜기(재부팅 후 서비스 자동시작)"

echo "== 2. ollama를 Tailscale에서 접근 가능하게 (NAS가 호출) =="
# 기본은 127.0.0.1만 → NAS에서 못 붙음. 0.0.0.0 바인딩 + Tailscale ACL/방화벽으로 제한.
launchctl setenv OLLAMA_HOST "0.0.0.0:11434"
mkdir -p ~/Library/LaunchAgents
# brew services 재시작으로 env 반영
brew services restart ollama 2>/dev/null || (ollama serve >/tmp/ollama.log 2>&1 &)
echo "  ⚠️ 보안: 0.0.0.0 노출은 LAN 개방 → macOS 방화벽 ON + Tailscale만 신뢰. 공인망 노출 금지."

echo "== 3. 로컬 모델 상주 (미리 받기) =="
for m in qwen2.5:7b qwen3.6:35b-a3b qwen3-coder:30b bge-m3; do
  echo "  pull $m ..."; ollama pull "$m" || echo "  ! $m 실패(태그 확인)"
done
# 소형 모델 keep_alive로 상주(콜드스타트 제거). 큰 모델은 호출 시 로드.
echo "== 4. 확인 =="
ollama list
echo "== 5. Studio의 Tailscale 이름 확인(라우팅 config의 STUDIO_HOST에 사용) =="
/Applications/Tailscale.app/Contents/MacOS/Tailscale status 2>/dev/null | head -3 || tailscale status 2>/dev/null | head -3
echo "완료. litellm-config.yaml의 STUDIO_HOST를 위 Tailscale 이름으로 교체."
