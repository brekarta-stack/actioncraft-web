# 재해 복구 절차 — "Mini가 죽은 날"을 30분짜리 사건으로

> 전제: 이 레포(git) + 패스워드 매니저(시크릿) + NAS(데이터)가 살아 있으면
> Mini는 소모품이다. 이 전제를 매월 리허설로 검증한다.

## 필요한 것 (복구 3요소)

| 요소 | 위치 | 없으면 |
|---|---|---|
| 설정·스킬·훅 | agent-config 레포 (GitHub) | 이 절차 무효 — 즉시 백업 체계 점검 |
| 시크릿 | 패스워드 매니저 (Slack webhook, API 키) | Slack/Anthropic에서 재발급 (각 ~5분) |
| 업무 데이터 | NAS | NAS 자체 백업 정책 확인 |

## 복구 절차 (새 Mini 또는 초기화된 Mini 기준, 약 30분)

```bash
# 1. 레포 복원
git clone <agent-config 레포 URL> ~/agent-config
cd ~/agent-config

# 2. 시크릿 복원 (패스워드 매니저에서 값 꺼내 입력)
mkdir -p ~/.agent-secrets && chmod 700 ~/.agent-secrets
cp config/hermes.env.example ~/.agent-secrets/hermes.env
chmod 600 ~/.agent-secrets/hermes.env
open -e ~/.agent-secrets/hermes.env    # 실제 값 입력

# 3. 훅·launchd 재설치 (README 3~4단계와 동일)
chmod +x hooks/*.sh hooks/lib/*.sh tests/*.sh
tests/test_hooks.sh                     # ALL PASS 확인
cp hooks/launchd/*.plist ~/Library/LaunchAgents/
sed -i '' "s|__REPO__|$HOME/agent-config|g" ~/Library/LaunchAgents/com.agent.*.plist
launchctl load ~/Library/LaunchAgents/com.agent.heartbeat.plist
launchctl load ~/Library/LaunchAgents/com.agent.gitsync.plist

# 4. 헤르메스 재설치 후 com.agent.hermes.plist 의 실행 명령 채워 load

# 5. 검증
sh hooks/heartbeat.sh                   # #agent-log 도착 확인
```

## 월간 리허설 (실제 복구 없이, 약 30분)

1. 임시 폴더에 clone: `git clone <레포 URL> /tmp/recovery-drill && cd /tmp/recovery-drill`
2. `tests/test_hooks.sh` → ALL PASS 확인
3. 패스워드 매니저에서 시크릿 3개를 **실제로 열어보고** 값이 최신인지 확인
   (webhook을 바꿨는데 매니저를 안 고친 상태가 리허설이 잡는 대표 사고)
4. NAS 최신 백업 날짜 확인
5. `#agent-log`에 `recovery drill OK (YYYY-MM-DD)` 기록
6. 정리: `rm -rf /tmp/recovery-drill`

## 이 절차가 지키는 약속

- 복구 시간: 며칠(재구축) → **약 30분**
- 복구 의존성: 운영자의 기억 → **문서 + git + 패스워드 매니저**
