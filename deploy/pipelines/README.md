# 공용 파이프라인 골격 (D5) — "표 하나 읽고 다 돈다"

> 핵심: 사업 파트마다 워크플로를 복제하지 않는다. **범용 플로우 1개 × 파트 정의 테이블**.
> 도메인 재편 = `part-definitions.yaml`의 행 수정(코드 무변경). 기존 시스템의 sns_lines.json·learning.json과 같은 철학.

## 공용 파이프라인 = 재사용 패턴 하나
```
트리거(스케줄/명령) → 파트 정의 로드 → [단계들, 파트 설정대로] → 승인 게이트(대외만) → 실행 → 관제/멱등
```
n8n에서 이 패턴을 **워크플로 3개**로 구현하고, 각 워크플로가 `part-definitions.yaml`을 순회한다:

| 워크플로 | 파트별로 읽는 것 | 단계 |
|---|---|---|
| **lead-gen** | `parts[*].lead_gen`(sources·keywords·min_score) | 수집 → `score_model`(로컬) 스코어링 → `leads` 테이블 적재 |
| **blog** | `parts[*].blog`(platform·approval) | 상위 리드/키워드 → `draft_model`(로컬 초안) → `polish_model`(프런티어 퇴고) → 승인 → 발행(WordPress) |
| **quote** | `parts[*].quote`(pricebook·template·send) | 요청 → pricebook 조회 → `quote_model` 문안 → PDF → 승인 → Gmail |

`active:false`인 파트는 건너뛴다. → 도메인 정의 전엔 biz-a만 돌고, 정의되면 b/c의 `active`를 켜기만.

## 라우팅 규칙(이미 확정) 재사용
- 로컬 저가: `classify-fast`(스코어링), `write-ko-draft`(초안)
- 프런티어 고정(대외·돈): `write-ko-final`(발행 퇴고), `quote-legal`(견적 문안)
- 멱등성: 발행=`publish:{channel}:{해시}:{date}`, 이메일=`email:{quote_id}:{recipient}:{ver}` (GD-2 키 테이블)
- 승인: `approval: required`면 #approvals 버튼 통과 후에만 실행

## 파트 추가·변경 절차
1. `docs/domain-definition-template.md`에 사람 언어로 정의(목표·타깃·채널).
2. 그걸 `part-definitions.yaml` 행으로 distill(이 폴더의 example 구조).
3. `pricebooks/biz-x.yaml`·`templates/quote-biz-x.html` 작성(견적 쓰는 파트만).
4. `active: true` → 다음 스케줄부터 자동 반영. **대응하는 미니 레거시 잡은 OFF**("켜기 전에 끈다").

## 실파일
`part-definitions.yaml`(실값)은 `.gitignore`(사업 키워드·단가가 민감할 수 있음). 구조는 `.example.yaml` 참조.
D10~14(도메인 종속 파이프라인)에서 이 골격 위에 파트를 채워 나간다.
