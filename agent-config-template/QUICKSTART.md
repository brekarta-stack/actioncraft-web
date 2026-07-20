# 퀵스타트 — 당신이 할 일은 딱 2가지

> 나머지(파일 배치·시크릿 설정·훅 등록·전원 설정·테스트·heartbeat 검증)는
> `install.sh` 가 전부 자동으로 합니다. 아래 2가지만 하시면 됩니다.

---

## STEP 1 · 웹훅 만들기 (브라우저, 약 2분)

1. **https://api.slack.com/apps** 접속 → **Create New App** → **From an app manifest**
2. 워크스페이스 선택 → 아래 파일 내용을 붙여넣기 → **Create**
   - 붙여넣을 내용: 이 폴더의 **`slack-app-manifest.json`**
3. 좌측 메뉴 **Incoming Webhooks** → **Add New Webhook to Workspace**
4. 채널 **#agent-log** 선택 → **Allow**
5. 생성된 **Webhook URL 복사** (`https://hooks.slack.com/services/...`)

> #agent, #agent-log 채널은 이미 만들어져 있습니다(에이전트가 생성함). 만들 필요 없습니다.

---

## STEP 2 · 맥에서 설치 (터미널, 약 5분)

Mac Mini에서 **터미널**을 열고 아래 두 줄을 붙여넣기:

```bash
git clone https://github.com/brekarta-stack/actioncraft-web.git ~/acw
sh ~/acw/agent-config-template/install.sh
```

설치기가 물어보는 것에만 답하면 됩니다:

| 물어보는 것 | 답 |
|---|---|
| `git 사용자 이름 / 이메일` | (처음 한 번만) 아무 이름·이메일 |
| `Slack Webhook URL 붙여넣기` | **STEP 1에서 복사한 URL** 붙여넣고 Enter |
| `agent-config 비공개 레포 URL` | 있으면 붙여넣기 / **없으면 그냥 Enter** (나중에 추가 가능) |
| `헤르메스 포그라운드 시작 명령` | 알면 입력 / **모르면 그냥 Enter** |
| `로그인 암호` | 맥 로그인 암호 (잠자기 해제 설정용) |

끝나면 화면에 **`=== 설치 완료 ===`** 가 뜨고, 곧바로 **#agent-log 채널에 heartbeat 메시지**가 옵니다.

---

## 확인 · 다음

- **성공 신호**: #agent-log 에 `[heartbeat] ...` 메시지 도착.
  - 이 시점엔 :rotating_light: `hermes=DOWN` 이 **정상**입니다 (헤르메스를 아직 안 붙였을 때). "메시지가 온다"가 핵심.
- **헤르메스 연결**: 준비되면 `sh ~/agent-config/install.sh` 를 다시 실행하고, 시작 명령을 입력하면 :green_heart: 로 바뀝니다.
- **매일**: 아침에 #agent-log 의 heartbeat 한 번 보는 것 — 그게 운영의 전부입니다.
- **되돌리기**: `sh ~/agent-config/uninstall.sh` (데이터는 보존).

문제가 생기면 그 화면을 그대로 캡처해서 물어보세요.
