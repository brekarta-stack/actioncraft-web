# 프로덕트 개발 관리 프로토콜 (2026-07-22)

> 질문: impact-ledger, papercraft-studio, agent-dashboard, proof-market 등 외주·콜드밋업 기반
> 프로덕트 개발(Claude Code 채팅 개발)을 기존 운영 시스템에 통합할지, 별도 프로토콜로 갈지.
> **판정: 별도 프로토콜 + 통합 가시성.** 운영에 섞으면 둘 다 망가진다.

## 1. 핵심 통찰 — 이건 성격이 다른 두 종류의 일이다

| 구분 | 운영 자동화 (Operations) | **프로덕트 개발 (Delivery)** |
|---|---|---|
| 성격 | 반복·결정적·상시 | 에피소드·창의·프로젝트 단위 |
| 런타임 | n8n @ NAS (24시간) | **Claude Code 세션 (레포별)** |
| "완료"의 의미 | 매일 돌면 성공 | 마일스톤 달성/납품 |
| 관리 질문 | "살아있나?" (Kuma) | **"어디까지 됐나? 다음은?"** (포트폴리오) |
| 예시 | SNS·리드·학습·매매·견적 | impact-ledger·proof-market·papercraft-studio |

**결론: 프로덕트 개발을 n8n에 넣지 마라.** n8n은 반복 자동화 엔진이고, 프로덕트 개발은 Claude Code가 맞는 도구다. 섞으면 n8n은 프로젝트 추적 지옥이 되고, 개발은 워크플로에 갇힌다. (이미 겪은 "채널마다 에이전트" 스프롤의 재발.)

## 2. 그래도 "통합"이 필요한 지점 — 가시성과 공급

두 세계는 **두 접점**에서만 만난다:
1. **가시성(위로)**: 모든 프로덕트의 상태를 한 곳에서 본다 → 포트폴리오 레지스트리 + 주간 다이제스트.
2. **공급(아래로)**: 운영 자동화가 프로덕트를 **먹인다** — 리드젠→고객, trend-radar→기회, SNS→홍보. 콜드밋업/외주 고객은 리드 파이프라인의 출력이다. 하지만 개발 자체는 관리하지 않는다.

## 3. 제안 구조 — "얇은 포트폴리오 레지스트리" (자체 대시보드 재제작 금지)

### (a) 단일 진실원: `portfolio/projects.yaml` (git 관리)
```yaml
- id: impact-ledger
  repo: brekarta-stack/impact-ledger
  business: regen          # 어느 사업/독립
  client: "OO재단"          # 외주 고객 or self
  stage: build             # idea → validate → build → deliver → maintain
  next: "MVP 데모 (콜드밋업 OO)"
  due: 2026-08-05
  status: green            # green/amber/red
- id: proof-market
  repo: brekarta-stack/proof-market
  ...
```
- 새 프로덕트 = 행 하나 추가. 죽은 프로덕트 = archived로. **이게 곧 파이프라인 게이트**(idea→validate 통과해야 build).

### (b) 상태 자동 수집: git 활동으로 "실제로 도는지" 판정
- n8n 주간 잡 1개가 각 repo의 최근 커밋·PR·이슈를 읽어 projects.yaml의 status를 대조 → "build인데 2주 커밋 0" = amber 경고.
- 이건 운영 자동화의 정당한 역할(반복·관측). **개발이 아니라 개발의 관측.**

### (c) 주간 포트폴리오 다이제스트: council-project-review 부활
- 이미 있던 `council-project-review`(일요일)를 이 용도로 재편: projects.yaml + git활동 → **"이번 주 각 프로덕트 어디까지, 다음 마일스톤, 막힌 것"** 요약을 Slack #portfolio로.
- 기존 자산 재활용(council_week.py) — 새로 안 만듦.

### (d) Slack: #portfolio 채널 1개
- 프로덕트 상태·마일스톤·주간 다이제스트만. 개발 대화는 여기 아님(그건 Claude Code 세션).

## 4. 개발 워크플로 자체 (Claude Code 세션 표준화)
- **프로덕트 = 레포 1개** (이미 그렇게 하고 있음: impact-ledger, papercraft-studio, region-ip-orchestrator …).
- 각 레포에 `CLAUDE.md`(맥락) + 표준 세션 훅(heartbeat·git-sync) 이식 → 어느 기기·세션에서 이어받아도 동일.
- **콜드밋업 → 외주 계약 → 프로덕트**: 밋업 노트를 #inbox로 → 리드/기회로 projects.yaml에 idea 행 추가 → validate 게이트 → build.

## 5. Plane 등 정식 PM 도구는?
- **지금은 도입 금지.** projects.yaml + 주간 다이제스트로 시작. 프로덕트가 10개 넘고 칸반·의존성 관리가 실제로 아쉬워지는 시점에만 Plane(자가호스트 @NAS) 승격 검토. (운영 원칙: 만들지/도입하지 말고, 부족이 증명되면 그때.)

## 6. 한 줄 판정
**운영(n8n)과 개발(Claude Code)은 분리하고, 둘을 잇는 건 얇은 레지스트리(projects.yaml) + 주간 다이제스트 하나뿐.**
프로덕트 개발을 자동화 시스템에 통합하는 게 아니라, **자동화 시스템이 프로덕트를 관측·공급**하게 한다.
