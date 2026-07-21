#!/bin/sh
# 로컬 모델 검증 실행 래퍼 — 스튜디오에서 실행.
#   sh run.sh                          # 기본 모델
#   MODEL=gpt-oss:120b sh run.sh       # 다른 모델로 비교
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
MODEL="${MODEL:-qwen3.6:35b-a3b}"

command -v ollama >/dev/null 2>&1 || { echo "✗ ollama가 없습니다. 먼저 설치하세요."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "✗ python3가 없습니다."; exit 1; }

# ollama 서버 확인 (없으면 백그라운드로 띄움)
if ! curl -s -m 3 http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "… ollama serve 시작"
  (ollama serve >/tmp/ollama-serve.log 2>&1 &) ; sleep 3
fi

echo "모델 준비: $MODEL (없으면 다운로드 — 수GB~수십GB, 시간 걸릴 수 있음)"
if ! ollama pull "$MODEL"; then
  echo ""
  echo "✗ '$MODEL' 다운로드 실패. 정확한 태그를 확인하세요:"
  echo "   ollama list                 (이미 받은 모델)"
  echo "   https://ollama.com/library  (사용 가능한 태그)"
  echo "   그다음: MODEL=<정확한태그> sh run.sh"
  exit 1
fi

MODEL="$MODEL" python3 "$HERE/verify_local.py"
