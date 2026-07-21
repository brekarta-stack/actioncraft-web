# 로컬 모델 96GB 검증 키트

**목적**: 램을 더 사기 전에, 지금 가진 96GB 스튜디오로 돌릴 수 있는 모델이 **실제 업무를 충분히 해내는지** 실측한다. 결과로 "96GB로 충분 / 부족(→256GB 정당화)"을 근거 있게 판정한다.

측정하는 것:
- **속도** (tok/s)
- **도구호출 신뢰성** (자동채점) — 에이전트 두뇌에 가장 중요
- **구조화 JSON 출력 정확도·일관성** (자동채점)
- **품질** (견적응대·요약·다단계판단 출력을 캡처 → 사람 판정)

## 1. 스튜디오에 파일 가져오기

스튜디오 터미널에서 (gh 로그인이 안 돼 있으면 `gh auth login` 한 번):
```bash
gh repo clone brekarta-stack/actioncraft-web ~/acw 2>/dev/null || git -C ~/acw pull
git -C ~/acw checkout claude/mac-agent-subscription-comparison-5vFfQ
cd ~/acw/agent-config-template/verify-local-model
```

## 2. 실행 (한 줄)

```bash
sh run.sh
```
→ ollama 서버 확인 → 모델 다운로드 → 9개 과제 실행 → `results-<모델>.md` 생성.

## 3. 여러 모델 비교 (권장)

96GB에 들어가는 후보를 각각 돌려 비교하세요:

| 모델 | 성격 | ollama 태그(예상) | 96GB 적합 |
|---|---|---|---|
| Qwen3.6-35B-A3B | **도구호출 신뢰성 1순위**, 빠른 MoE | `qwen3.6:35b-a3b` | ✅ 여유 |
| gpt-oss-120b | **품질 최강(로컬)**, 느림 | `gpt-oss:120b` | ✅ 빠듯 |
| Qwen3.6-27B | 균형(dense) | `qwen3.6:27b` | ✅ |
| Mistral Small 3.2 | 경량·함수호출 | `mistral-small:24b` | ✅ |

```bash
MODEL=qwen3.6:35b-a3b sh run.sh
MODEL=gpt-oss:120b    sh run.sh
```
> 태그가 틀리면 스크립트가 알려줍니다. `ollama list` / https://ollama.com/library 에서 정확한 태그 확인 후 `MODEL=...` 로 재시도.

## 4. 결과 보내기

생성된 **`results-*.md` 파일(들) 전체를 Claude에게 붙여넣으세요.** 제가 세 축으로 종합 판정합니다:
- 도구호출·JSON 자동채점 점수
- 속도(tok/s)가 실사용에 충분한지
- 품질 출력(견적응대·요약·판단)이 "그대로/살짝 손봐서 쓸 만한지"

## 5. 품질 판정 가이드 (사람이 볼 것)

`results-*.md`의 각 quality 과제 출력을 보고 스스로 점수:
- **A**: 그대로 고객에게 보내도 됨
- **B**: 5분 손보면 됨 (실용적)
- **C**: 다시 써야 함 (부적합)

A/B가 대부분이면 그 업무는 로컬로 충분. C가 자주 나오면 그 업무만 Claude로 올리거나(하이브리드), 반복되면 256GB 업그레이드 근거.

## 6. 내 사업에 맞게 과제 추가 (선택)

`verify_local.py`의 `TASKS` 리스트에 당신의 실제 문의/업무 샘플을 넣으면 더 정확합니다. 특히 **사업 B·C**의 대표 과제를 넣으면 그 사업까지 한 번에 검증됩니다. (형식은 기존 항목 참고 — quality/json/tool 중 선택)
