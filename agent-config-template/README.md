# agent-config — 에이전트 시스템 단일 진실원

> Slack–Hermes–Mac Mini–NAS 에이전트의 **설정·맥락·스킬·훅의 원본**이 사는 곳.
> 실행은 Mac Mini, 원본은 이 레포. 변경 = 커밋, 복구 = clone.
> 설계 근거: actioncraft-web `docs/agent-architecture.md` §13(안정화 우선)·§14(4계층 직무기술서)

## 이 레포가 해결하는 것

| 병목 | 해결 |
|---|---|
| 설정이 Mini에만 존재 → 이력 없음, 사망 시 소실 | 모든 설정·스킬이 여기에. 롤백 1분, 복구 = clone |
| 자동 생성 스킬 무심사 누적 → 행동 오염 | `skills/_quarantine/` 격리 + 주간 심사 후 편입 |
| 알림·재시작까지 LLM 판단 의존 | `hooks/` 결정적 스크립트가 100% 강제 |
| 관제 = pull(들어가서 확인) | heartbeat·실패알림이 `#agent-log`로 옴 (push) |

## 구조

```
agent-config-template/
├── CLAUDE.md              # 상시 맥락 (회사·3개 사업·규칙) — 에이전트가 항상 읽음
├── config/
│   ├── hermes.env.example # 시크릿 자리표시자 (실제 값은 절대 git에 넣지 않음)
│   └── routing-policy.md  # 모델 라우팅 정책 (MVL: Claude 단일 → 로컬 복귀 기준)
├── hooks/                 # 결정적 자동화 (LLM 무관, 100% 실행)
│   ├── lib/notify.sh      # Slack 알림 공용 함수
│   ├── heartbeat.sh       # 매일 생존신호 → #agent-log
│   ├── guard.sh           # 작업 래퍼: 실패 시 즉시 알림
│   ├── git-sync.sh        # 레포 pull → Mini 반영
│   └── launchd/           # macOS 상시 실행 정의 (.plist)
├── skills/
│   ├── README.md          # 네임스페이스·심사 규칙
│   ├── AUDIT.md           # 주간 심사 체크리스트
│   ├── _quarantine/       # 자동 생성 스킬 격리 구역 (심사 전)
│   ├── core/              # 전 사업 공용 (심사 통과분만)
│   ├── biz-a-actioncraft/ # 사업 A 전용
│   ├── biz-b/             # 사업 B 전용
│   └── biz-c/             # 사업 C 전용
├── docs/
│   ├── runbook.md         # 매일 10초 / 주 30분 / 월 1회 루틴
│   └── recovery.md        # 재해 복구 절차 (월 1회 리허설)
└── tests/
    └── test_hooks.sh      # 훅 스크립트 검증 (커밋 전 실행)
```

## Mac Mini 설치 (최초 1회, 약 30분)

```bash
# 0. GitHub에서 "비어 있는" 비공개 레포 agent-config 를 먼저 만든다 (README 생성 체크 해제)

# 1. 템플릿 내용을 새 레포로 복사해 넣는다
git clone https://github.com/brekarta-stack/actioncraft-web.git /tmp/acw
cp -R /tmp/acw/agent-config-template ~/agent-config
cd ~/agent-config
git init && git add -A && git commit -m "chore: bootstrap agent-config"
git remote add origin <새로 만든 agent-config 레포 URL>
git push -u origin main

# 2. 시크릿 파일 생성 (git 밖!)
mkdir -p ~/.agent-secrets && chmod 700 ~/.agent-secrets
cp config/hermes.env.example ~/.agent-secrets/hermes.env
chmod 600 ~/.agent-secrets/hermes.env
open -e ~/.agent-secrets/hermes.env   # 열어서 실제 값 입력 (Slack webhook, API 키)
#  ⚠️ 같은 값을 패스워드 매니저(1Password 등)에도 저장한다.
#     시크릿은 git에 없으므로, Mini가 죽으면 여기서 재입력하는 것이 복구 경로다.

# 3. 훅 실행 권한 + 테스트
chmod +x hooks/*.sh hooks/lib/*.sh tests/*.sh
tests/test_hooks.sh          # 전부 PASS 확인

# 4. launchd 등록 (상시 실행)
cp hooks/launchd/*.plist ~/Library/LaunchAgents/
sed -i '' "s|__REPO__|$HOME/agent-config|g" ~/Library/LaunchAgents/com.agent.*.plist
launchctl load ~/Library/LaunchAgents/com.agent.heartbeat.plist
launchctl load ~/Library/LaunchAgents/com.agent.gitsync.plist
launchctl list | grep com.agent      # 등록 확인 (com.agent.hermes 는 실행 명령을 채운 뒤 load)

# 5. 검증
sh hooks/heartbeat.sh        # #agent-log 채널에 heartbeat 도착 확인
#  안 오면: ① ~/.agent-secrets/hermes.env 의 SLACK_WEBHOOK_URL 채웠는지
#          ② sh -x hooks/heartbeat.sh 출력에서 curl 에러 확인
```

> **plist를 수정할 때**: plist는 위 4단계에서 `~/Library/LaunchAgents/`로 복사·치환된 사본이 실행된다.
> 레포의 plist를 고쳐 커밋했다면 4단계를 다시 실행해야 반영된다 (git-sync가 plist 변경을 감지하면 알림을 보낸다).

## 철칙

1. **시크릿은 절대 이 레포에 넣지 않는다.** (`.gitignore`가 차단하지만, 사람이 1차 방어선)
2. **Mini에서 직접 수정하지 않는다.** 어디서든 수정 → 커밋 → `git-sync.sh`가 반영.
3. **`_quarantine/` 밖으로 스킬을 옮기는 유일한 방법은 `AUDIT.md` 심사 후 커밋.**
4. 새 기능 추가 전 두 질문: "고장을 5분 내 알 수 있나?" / "따로 끌 수 있나?"
