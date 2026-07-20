#!/bin/sh
# 스킬 심사 보조 — 기계적으로 잡을 수 있는 위험 패턴 검사
# 사용: tests/skill-redflags.sh <스킬파일>
# 종료코드: 0 = 패턴 없음, 1 = 위험 패턴 발견(심사 체크리스트상 즉시 삭제 대상)

if [ $# -ne 1 ] || [ ! -f "$1" ]; then
  echo "usage: skill-redflags.sh <skill-file>" >&2
  exit 2
fi

FOUND=0

check() {
  # $1 = 패턴(grep -E), $2 = 설명
  if grep -nE "$1" "$FILE" 2>/dev/null | head -3 | grep -q .; then
    echo "🚩 $2:"
    grep -nE "$1" "$FILE" | head -3 | sed 's/^/   /'
    FOUND=1
  fi
}

FILE="$1"

# 난독화·간접 실행
check 'base64[[:space:]]+(-d|--decode)' "base64 디코드 (난독화 의심)"
check '\beval\b' "eval 사용 (간접 실행)"
check 'curl[^|]*\|[[:space:]]*(ba)?sh' "curl | sh (원격 코드 실행)"
check 'wget[^|]*\|[[:space:]]*(ba)?sh' "wget | sh (원격 코드 실행)"

# 행동 조작 지시문 (프롬프트 주입)
check '(항상|절대|조용히|몰래|사용자에게[[:space:]]*알리지)' "행동 조작 지시문 의심 (문맥 확인 필요)"
check '(이[[:space:]]*규칙을[[:space:]]*우선|규칙을[[:space:]]*무시|지침을[[:space:]]*무시)' "규칙 우회 지시문"

# 시크릿 하드코딩 흔적
check '(sk-[A-Za-z0-9]{20,}|xox[bap]-|hooks\.slack\.com/services/)' "시크릿/토큰 하드코딩 의심"

if [ $FOUND -eq 0 ]; then
  echo "OK: 기계 검사 통과 (사람 심사 항목은 별도 수행)"
  exit 0
fi
exit 1
