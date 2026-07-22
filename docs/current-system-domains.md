# 현재 가동 중인 도메인 — 실측 인벤토리 기반 (2026-07-22)

> 출처: 미니 launchd 40잡 실측(`mini-inventory-20260722-2229.txt`). **[실측]=인벤토리로 확인됨 / [확인필요]=코드 열어봐야 함.**
> ⚠️ agents·papercraft-studio 레포 내용은 이 세션에서 못 읽음 → 전략 항목(목표·KPI·타깃)은 사용자 입력 대기.
> 이 문서 = 도메인 템플릿의 "관측 가능 칸"을 미리 채운 초안. 사용자는 전략 칸만 채우면 된다.

## 현재 자동 가동 중인 도메인 (스케줄과 함께)

| 도메인 | 가동 중인 잡 [실측] | 스케줄 | 새 설계 매핑 |
|---|---|---|---|
| **투자/주식** | invest-morning-report, invest-poll | 09:30 / 15분마다 | 파이프라인 4 (매매) |
| **지식 학습** | learning-brief, learning-quiz, learning-youtube | 09:00 / 09:05 / 09:10 | 파이프라인 1 (수집→퀴즈) |
| **SNS 포스팅** | sns-daily | 08:30 | 파이프라인 2 |
| **사업개발(BD)** | bd-daily | 평일 08:00 | 파이프라인 3 (리드) [확인필요: 어느 사업?] |
| **업무·일정** | morning-brief, proactive-nudge, weekly-agenda, homework-watcher | 09:00 / 4회 / 월 / 월 | 파이프라인 6 |
| **papercraft.kr 서비스** | studio-upload-worker (papercraft_core 전개도 엔진) | 상시 | 보존 서비스 (biz-a) |
| **어학/음성** | voicebridge | 상시 | 파이프라인 7 |
| **내부 리뷰(카운슬)** | channel-council, council-project-review, council-weekly-report | 4/12/18시 / 일 / 금 | [확인필요: 다중에이전트 심의 시스템] |
| **자기개선·품질** | agent-review, agent-audit, qc-eval | 04:00 / 10:30 / — | 스킬 효과 측정 루프 (Q5 답의 데이터원) |
| **관제·인프라** | dashboard, heartbeat, slack-health-check, failover, google-token-check | — | Kuma로 대체 예정 |

## 도메인 템플릿 — 관측칸 선채움 (전략칸은 사용자)

### PART A · papercraft.kr (biz-a) — [실측 근거 있음]
| 항목 | 내용 |
|---|---|
| ID / 이름 | `biz-a` / Paper Engineering Studio (papercraft.kr) [실측: site.ts + papercraft-studio 코드] |
| 담당 자동화 [실측] | studio-upload-worker 가동 중. bd-daily·sns-daily가 이 사업용인지 [확인필요] |
| 발행 채널 | [확인필요: web_publish.py 존재 → 자체 웹? WordPress?] |
| 쌓는 데이터 [실측] | papercraft_core 전개도 생성물, curation_m1.json |
| 목표·KPI·타깃 | ⬜ 사용자 입력 |

### 사업 외 도메인 — [실측: 전부 가동 중]
| 도메인 | 실측 상태 | 사용자 입력 필요 |
|---|---|---|
| 투자 | invest 2잡 가동 → 이미 뭔가 폴링·리포트 중 | 시장·전략·리스크한도·계좌 |
| 학습 | learning 3잡 가동 → 주제 [확인필요: learning 설정파일] | 학습 주제 확정 |
| 어학 | voicebridge 가동 (오세기 정보 기억 중) | 언어·수준·목표 |
| SNS/브랜드 | sns-daily 가동 | 포지셔닝·콘텐츠축·빈도 |

---

## 🔑 딥리뷰 실측 (2026-07-22 deep-review.sh) — 미정이던 것들의 답

### 실제 사업 3개 확정 [실측: agents 자기점검 리포트]
그동안 [확인필요]였던 biz-b/biz-c의 정체가 드러남 — 자기점검이 "24개 채널 중 **biz·regen·edu 3개만 사업 커버**"라고 명시:
- **biz-a = 페이퍼크래프트 사업** (papercraft.kr) [채널: biz-페이퍼크래프트사업]
- **biz-b = 지역재생** (regen) [채널: regen-지역재생, sns-regen]
- **biz-c = 스타트업강의** (edu) [채널: edu-스타트업강의, sns-edu]

### 핵심 진단: 시스템이 과확장됨 [실측, 자기점검이 스스로 지적]
- **24개 채널** 존재, 그중 **21개는 "활용 전략 부재"** — 당신의 "도메인 재편" 직감을 시스템이 데이터로 확증.
- 24채널: biz·per-일상·inv-투자·brn-브랜딩학습·ai-omc·sysops·daily·regen·edu·idea·ai-builder·travel·weekly·work·personal·learning·미진행·cos-오케스트레이터·따라잡기·img·sns-biz·sns-edu·sns-regen·sns-personal
- **62 에이전트 / 62 config** (무결성 OK), **엔진 배분 claude 54 / codex 1 / ollama 7** → 자기점검이 "Claude 과의존, codex/ollama 미미"로 지적.
- **에러 발생 파이프라인**: channel-council · invest-poll · learning-quiz · learning-youtube · proactive-nudge → **우리가 n8n으로 재구축할 바로 그것들**(이관=버그 수정 겸함).

### 스킬 현황 [Q5 답]
- **`agent-config/skills/`는 전부 비어있음**(.gitkeep만, 실파일 0개). 신규 관제층의 "미리 써둘 스킬"은 **아직 채워지지 않음.**
- 실제 자산은 `agents`의 **62개 에이전트 config + 설정 파일**에 있음. "스킬"이 별도 폴더가 아니라 채널별 에이전트 정의에 내장.
- **효과 측정 루프는 작동 중**: 자기점검이 로컬 gemma3로 매일 돌며 과확장·Claude과의존·에러를 실제로 잡아냄 → **루프 자체는 유효.** 즉 "미리 써둔 스킬이 효과 있었나"의 답 = 루프는 효과적, 그러나 그 루프가 "너무 넓게 벌렸다"고 경고 중.

### 이미 "파트 정의 테이블" 패턴을 쓰고 있음 [실측 — 재활용 가치 높음]
- `sns-daily` → **config/sns_lines.json**의 모든 사업 라인 순회(스크립트 불변, 설정만 수정) = 내가 제안한 공용 플로우와 동일 철학.
- `learning-quiz` → **config/learning.json**의 요일별 블록(industry=claude+검색 / invest=ollama gemma3:27b / culture=claude). ObsidianVault 아카이브.
- `invest-morning-report` → **kis-balance 모듈로 KIS 잔고 조회 이미 통합**(READ-ONLY). 주식 도메인이 생각보다 진척됨.
→ 이 config 파일들(sns_lines.json, learning.json)이 n8n 파트 정의 테이블의 **직접 재료**. 재작성 아님, 이관.

### 새 설계로의 함의
1. **도메인 재편 = 24채널 → 핵심 3사업 + 소수 개인용으로 축소** (자기점검이 이미 처방).
2. 재구축 대상(에러나는 council/invest/learning)은 n8n에서 깨끗이 다시 — 버그 수정 겸함.
3. Claude 과의존(54/62) → LiteLLM 라우팅으로 로컬·저가 티어 이동이 실측 근거를 얻음.
4. sns_lines.json·learning.json·kis-balance = **검증된 재활용 자산**. 블라인드 폐기 금지.
