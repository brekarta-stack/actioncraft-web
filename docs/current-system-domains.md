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

## 다음: 깊은 검토가 필요한 것 (코드 열람 필요 — 덤프 스크립트로)
1. **스킬 효과 측정** [Q5]: `agents/skills/`, `agent-config/skills/`, `memory/reviews/*.md`, qc-eval 결과 → 어떤 스킬이 실제로 품질을 올렸나
2. **카운슬 시스템 정체**: channel-council이 뭘 하는가 (다중에이전트 심의?)
3. **BD/SNS 잡의 소속**: 어느 사업/브랜드를 위한 것인가
4. **learning 주제**: 현재 무엇을 수집·학습 중인가
5. **글쓰기 스킬 현황** [Q6]: 현재 한국어 글쓰기 스킬이 어떻게 짜여 있나 → 개선 기준선
