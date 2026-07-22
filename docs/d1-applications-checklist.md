# D1 신청 5종 체크리스트 (리드타임 발사용)

> 왜 지금: 아래 승인은 2~8주 걸리는 게 섞여 있어, 오늘 쏴야 2주 계획의 발행/영상 단계가 안 막힌다.
> 전부 당신 계정 로그인이 필요해 내가 대신 못 하지만, 각 3~5분이면 끝난다. 발급된 키/ID는
> **여기 커밋하지 말고** 패스워드 매니저에 저장(§시크릿 원칙).

| # | 신청 | 리드타임 | 상태 | 발급물(패스워드매니저에) |
|---|---|---|---|---|
| 1 | LinkedIn API 심사 | 2~8주 | ⬜ | Client ID/Secret |
| 2 | YouTube API 감사 | 2~4주 | ⬜ | OAuth Client + API Key |
| 3 | 한국투자증권 KIS | 즉시~수일 | ⬜ | App Key/Secret(모의+실전) |
| 4 | Kling API | 즉시 | ⬜ | API Key + 패키지 결제 |
| 5 | Supertone Play | 즉시 | ⬜ | API Key |

---

## 1 · LinkedIn "Share on LinkedIn" (심사 2~8주 — 제일 먼저)
1. https://www.linkedin.com/developers/apps → **Create app**
2. 앱 이름/회사 페이지/로고 입력 (회사 페이지 없으면 임시로 하나 연결)
3. **Products** 탭 → **"Share on LinkedIn"** + **"Sign In with LinkedIn using OpenID Connect"** 요청
4. **Auth** 탭에서 Client ID/Secret 확인 → 패스워드 매니저에 저장
5. 심사가 걸리는 스코프: `w_member_social`. 신청 사유에 "개인 브랜드 계정에 본인 콘텐츠 자동 게시" 명시
> 승인 전까지는 Postiz(자가호스트) 또는 Buffer로 발행 — 파이프라인 동일, 발행 노드만 교체.

## 2 · YouTube Data API 감사 (감사 전엔 업로드가 private 강제)
1. https://console.cloud.google.com → 프로젝트 생성(예: `agent-automation`)
2. **APIs & Services → Library** → "YouTube Data API v3" **Enable**
3. **OAuth consent screen** 구성(External, 테스트 사용자에 본인 이메일 추가)
4. **Credentials** → OAuth Client ID(Desktop) 생성 → 저장
5. **감사 신청**: "YouTube API Services – Audit and Quota Extension" 폼 제출(공개 업로드 잠금 해제용). 사유에 "개인 채널 자동 업로드 파이프라인"
> 감사 승인 전 운영: API로 **private 업로드 → YouTube Studio에서 수동 공개**.

## 3 · 한국투자증권 KIS Developers (해외주식까지 단일 API)
1. https://apiportal.koreainvestment.com → 로그인(계좌 필요) → **API 신청**
2. **실전투자** App Key/Secret 발급 + **모의투자** 계좌 개설 후 별도 App Key/Secret 발급
3. 해외주식 사용 시 해외 서비스도 신청에 포함
4. 4종 키(실전·모의 각각)를 패스워드 매니저에 저장 — **AppKey 유효기간 1년**(갱신 알림 설정)
> 매매는 P2(D7~8). 지금은 키만 확보. 순서: 모의 → 소액 실전.

## 4 · Kling API (영상 렌더)
1. https://klingai.com/global/dev (또는 app.klingai.com) → 가입 → 개발자 콘솔
2. **API Key 발급** + **API 전용 리소스 패키지 구매**(소비자 크레딧과 별개, ~$9.8부터)
3. 카드 결제(USD) → API Key 저장
> 실패 생성은 미과금. 10초 1080p ≈ $0.32. 초저가 백업은 Hailuo/MiniMax.

## 5 · Supertone Play (한국어 TTS)
1. https://www.supertone.ai → Play API 가입
2. 요금제 선택(엔트리 저가부터) → **API Key 발급** → 저장
> 한국어 운율 1순위. 저가 대량은 Naver CLOVA Voice 백업.

---

### 완료 후
5칸 상태를 ⬜→✅로 바꿔 커밋(키 값은 넣지 말 것). LinkedIn·YouTube는 "신청 접수"만 되면 오늘 임무 끝 —
승인은 알아서 익는다. 도착하면 해당 파이프라인의 발행/렌더 노드를 실키로 교체.
