# 재해 복구 절차 — "Mini가 죽은 날"을 1시간짜리 사건으로

> 전제: 아래 **복구 4요소**가 살아 있으면 Mini는 소모품이다.
> 이 전제를 매월 리허설로 검증한다.

## 복구 4요소

| 요소 | 위치 | 없으면 |
|---|---|---|
| 설정·스킬·훅 | agent-config 레포 (GitHub) — `_quarantine/` 포함 (git-sync가 자동 푸시) | 이 절차 무효 — 즉시 백업 체계 점검 |
| 시크릿 (명시 목록: `SLACK_WEBHOOK_URL`, `ANTHROPIC_API_KEY`, **헤르메스 Slack 봇 토큰**) | 패스워드 매니저 (항목명: `agent-webhook`, `agent-anthropic`, `agent-hermes-bot`) | Slack/Anthropic 콘솔에서 재발급 (각 ~5분) |
| 헤르메스 자체 | 설치 명령·버전·설정 위치를 이 문서 하단 "헤르메스 카드"에 기록 | 카드 없이는 복구 시간을 보장할 수 없다 — 지금 채울 것 |
| 업무 데이터 | NAS | NAS 자체 백업 정책 확인 |

## 복구 절차 (새 Mini 또는 초기화된 Mini 기준, 약 1시간)

```bash
# 1. 레포 복원 (git 신원부터 — 없으면 격리함 자동 캡처 커밋이 조용히 실패한다)
git config --global user.name "이름"
git config --global user.email "you@example.com"
git clone <agent-config 레포 URL> ~/agent-config
cd ~/agent-config

# 2. 시크릿 복원 (패스워드 매니저의 세 항목에서 값 입력)
mkdir -p ~/.agent-secrets && chmod 700 ~/.agent-secrets
cp config/hermes.env.example ~/.agent-secrets/hermes.env
chmod 600 ~/.agent-secrets/hermes.env
open -e ~/.agent-secrets/hermes.env

# 3. 훅·launchd 재설치 (README 3~4.5단계와 동일 — 상세는 README가 원본)
chmod +x hooks/*.sh hooks/lib/*.sh tests/*.sh && mkdir -p logs
tests/test_hooks.sh                     # ALL PASS 확인
cp hooks/launchd/*.plist ~/Library/LaunchAgents/
sed -i '' "s|__REPO__|$HOME/agent-config|g" ~/Library/LaunchAgents/com.agent.*.plist
launchctl load ~/Library/LaunchAgents/com.agent.heartbeat.plist
launchctl load ~/Library/LaunchAgents/com.agent.gitsync.plist
# 전원·자동로그인 설정: README 4.5단계 수행

# 4. 헤르메스 복구 (아래 "헤르메스 카드"대로)
#    설치 → 봇 토큰 입력(패스워드 매니저 agent-hermes-bot) → 스킬 경로를 skills/_quarantine/ 로
#    → plist의 시작 명령 치환 후 load:
sed -i '' "s|__HERMES_START_COMMAND__|<카드의 포그라운드 실행 명령>|" ~/Library/LaunchAgents/com.agent.hermes.plist
launchctl load ~/Library/LaunchAgents/com.agent.hermes.plist

# 5. 검증
sh hooks/heartbeat.sh                   # #agent-log에 :green_heart: 도착 확인
```

## 헤르메스 카드 (설치 시 채우고, 바뀔 때마다 갱신 — 이 카드가 복구 시간을 결정한다)

| 항목 | 값 |
|---|---|
| 설치 방법/명령 | (예: `brew install hermes-agent` 또는 설치 스크립트 URL) |
| 현재 버전 | (예: v3.x — `hermes --version` 출력) |
| 설정 파일 위치 | (예: `~/.hermes/config.yaml` — 백업: 레포 `config/`에 사본) |
| 포그라운드 시작 명령 | (plist `__HERMES_START_COMMAND__`에 들어가는 값. `exec` 가능해야 함) |
| Slack 봇 토큰 | 패스워드 매니저 `agent-hermes-bot` (값은 절대 여기 쓰지 않는다) |

## 월간 리허설 (실제 복구 없이, 약 30분)

1. 임시 폴더에 clone: `git clone <레포 URL> /tmp/recovery-drill && cd /tmp/recovery-drill`
2. `tests/test_hooks.sh` → ALL PASS 확인
3. 패스워드 매니저의 세 항목(`agent-webhook`, `agent-anthropic`, `agent-hermes-bot`)을
   **실제로 열어보고** 값이 최신인지 확인
   (webhook을 바꿨는데 매니저를 안 고친 상태가 리허설이 잡는 대표 사고)
4. "헤르메스 카드"가 현재 설치 상태와 일치하는지 확인 (버전·시작 명령)
5. NAS 최신 백업 날짜 확인
6. `#agent-log`에 `recovery drill OK (YYYY-MM-DD)` 기록
7. 정리: `rm -rf /tmp/recovery-drill`

## 이 절차가 지키는 약속

- 복구 시간: 며칠(기억 의존 재구축) → **약 1시간** (헤르메스 카드가 채워져 있을 때)
- 복구 의존성: 운영자의 기억 → **문서 + git + 패스워드 매니저**
