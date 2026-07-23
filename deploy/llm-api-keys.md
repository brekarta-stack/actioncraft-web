# LLM API 키 발급 (LiteLLM 클라우드 티어용)

> 이 키들은 **구독(Claude Code)과 별개인 종량제 API 키**다. 운영 무중단의 핵심 — 구독 토큰 소진돼도 이 키로 자동화가 돈다.
> 발급 후 `deploy/nas/.env`에만 넣고(패스워드 매니저에도), **git에 절대 커밋 금지**.
> 로컬 티어(Studio ollama)만으로도 백본은 뜬다 — 클라우드 키는 "어려운 것/폴백"용이라 나중에 추가해도 됨.

## 우선순위
| 키 | 필수도 | 용도 | 발급처 |
|---|---|---|---|
| **ANTHROPIC_API_KEY** | ★필수 | 대외 문서·매매 분석·최난도 코딩(프런티어) | https://console.anthropic.com → API Keys |
| **MOONSHOT_API_KEY** (Kimi) | ★필수 | 대량 저가 티어 + 로컬 재부팅 백스톱 | https://platform.moonshot.ai → API Keys |
| **OPENAI_API_KEY** | ○권장 | 프리미엄 교차검증/폴백 + 임베딩 백스톱 | https://platform.openai.com → API Keys |

## 발급 요령
1. **Anthropic**: Console 로그인 → 결제수단 등록 → **Create Key** → `sk-ant-...` 복사. (구독 계정과 같은 이메일이어도 API는 별도 크레딧.)
2. **Moonshot(Kimi)**: platform.moonshot.ai 가입(국제판, .cn 아님) → 최소 ~$1 충전 → **API Key** 발급. OpenAI 호환 `https://api.moonshot.ai/v1`.
3. **OpenAI**: Platform → 결제 등록 → **Create secret key** → `sk-...` 복사.

## 초기 예산 (소액으로 시작 — 예산캡이 상한 보장)
- 각 3만~5만원 충전이면 2주 검증엔 충분. LiteLLM Admin UI에서 별칭별 월 상한 걸어 초과 차단.
- 로컬 티어가 대량을 흡수하므로 실제 클라우드 소모는 대외 산출물·어려운 판단 몇 건뿐.

## `.env`에 들어갈 형태
```
ANTHROPIC_API_KEY=sk-ant-...
MOONSHOT_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

## 확인
키가 준비되면 금요일(또는 지금 백본을 8GB에서 먼저 띄운다면) LiteLLM이 로컬+클라우드를 다 라우팅한다.
키 없이 먼저 띄우면 로컬 티어(Studio)만 동작하고, 클라우드 별칭은 키 추가 후 컨테이너 재시작으로 활성.
