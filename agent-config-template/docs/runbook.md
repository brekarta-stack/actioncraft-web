# 운영 런북 — 이 문서 밖의 것은 관리하지 않는다

> 총 부담: **매일 10초 + 주 45분 내외(심사량 많은 주 최대 60분) + 월 1회 45분.**
> (정직한 숫자다 — 30분으로 압축하면 개선 루프가 예산 밖 유령이 된다)
> 이 범위를 넘는 관리가 필요해지면, 그것은 운영자가 부지런해질 일이 아니라
> 시스템에서 기능을 빼야 한다는 신호다.

## 매일 (10초) — 아침 커피와 함께

1. Slack `#agent-log` 열기.
2. 오늘 아침 8시 `[heartbeat]` 메시지 확인:
   - :green_heart: → 끝. 아무것도 하지 않는다.
   - :rotating_light: → 메시지에 적힌 문제 항목별 대응 (데몬 다운이면 아래 "재기동 3단계").
   - **heartbeat 자체가 안 옴** → 순서대로: ① Mini 전원/네트워크 ② 로그인 여부
     (LaunchAgent는 로그인 상태에서만 돈다) ③ Slack webhook 실효 여부
     (Mini에서 `sh ~/agent-config/hooks/heartbeat.sh` 수동 실행 → stderr 확인).

### 데몬 재기동 3단계 (hermes=DOWN일 때)

```bash
# 1) 강제 재기동
launchctl kickstart -k gui/$(id -u)/com.agent.hermes
# 2) 안 되면 재로드
launchctl unload ~/Library/LaunchAgents/com.agent.hermes.plist
launchctl load   ~/Library/LaunchAgents/com.agent.hermes.plist
# 3) 그래도 안 되면 원인 확인
tail -50 ~/agent-config/logs/com.agent.hermes.err
```

## 매주 (45분) — 요일을 정해 고정 (권장: 금요일 오후)

| 순서 | 할 일 | 시간 |
|---|---|---|
| 1 | **스킬 심사**: `skills/AUDIT.md` 대로 `_quarantine/` 처리 (최대 7개, 1개당 2~5분) + `skill audit done` 기록 | 15~30분 |
| 2 | **로그 리뷰**: 지난주 `:x:` 알림 훑기 + 반복 실패(2회+) 원인 메모 + **ACK 없는 요청 스캔**(#agent 명령 중 접수 확인이 안 달린 것 = 유실 의심) | 10분 |
| 3 | **개선 1개**: 반복 실패 원인 제거 / 스킬 1개 개선 / 수동 2회+ 작업 1개 자동화 — 셋 중 **하나만** | 15분 |
| 4 | **커밋 확인**: `git log --oneline -10`, 미커밋 변경 정리·푸시 | 5분 |

- 개선(3번)이 15분을 넘길 규모면 그 자리에서 하지 말고 다음 주 3번 슬롯의 계획으로 메모만 남긴다.
- 심사(1번)가 30분을 넘기는 주가 반복되면 스킬 생성량 자체를 줄여야 한다는 신호다 (AUDIT.md 유량 상한 참조).

### [git-sync] pull 실패 알림이 이어질 때 (분기 해소)

git-sync는 rebase로 대부분 자동 해소한다. 그래도 실패가 반복되면 — **철칙 2의 명시적 예외**로 Mini에서:

```bash
cd ~/agent-config && git -c rebase.autoStash=true pull --rebase && git push
```

## 매월 (45분) — 리허설 + 정리

1. **복구 리허설 (30분)**: `docs/recovery.md` 절차 수행 → `#agent-log`에 `recovery drill OK (날짜)` 기록. 실패하면 그것이 이번 달 최우선 수리 항목.
2. **대시보드 KEEP 재점검 (5분)**: `docs/observability.md` §2 — KEEP이 3~5개를 넘었으면 다시 줄인다.
3. **스킬 부패 검토 (10분)**: `audited` 날짜가 90일 지난 스킬 중, 최근 4주 `#agent-log` 검색에서 사용 흔적이 0건인 것 → 삭제 검토.
   (월간 작업은 이 3개가 전부다 — 다른 문서에 월간 항목을 추가하지 말 것)

## 확장을 결정할 때 (수시)

새 기능·채널·모델을 추가하기 전에 두 질문:

1. 이게 고장나면 **5분 안에 알 수 있는가?** (없으면 guard.sh/알림부터)
2. 이것만 **따로 끌 수 있는가?** (없으면 설계를 바꾼다)

두 질문을 통과 못 하면 추가하지 않는다.

## 단계 전환

- 현재 단계와 전환 조건·측정 방법: `config/routing-policy.md`
- 전환도 커밋이다 — 정책 파일을 수정·커밋하는 것으로 전환을 기록한다.
