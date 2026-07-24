# Orca Windows 클라이언트 연결 — Windows Claude Code 세션용 프롬프트

> 목표: Windows Orca(클라이언트)를 Mac Studio Orca 호스트(100.65.201.6)에 연결.
> 맥 호스트가 발급한 **페어링 URL**이 필요(맥 세션의 orca-setup 결과물). Windows에서 `claude` 실행 후 아래 붙여넣기.
> 정직한 한계: 최종 페어링은 대체로 Orca 앱 GUI 붙여넣기(클로드가 클릭 못 함). 이 프롬프트는 네트워크 검증 + `orca://` 딥링크 자동페어링 시도까지 자동화하고, 안 되면 GUI 한 단계만 짚어준다.

---

## 붙여넣기 프롬프트 (이 아래 전체를 복사)

```
너는 지금 내 Windows 노트북(Tailscale node 100.104.71.7)에서 로컬로 도는 Claude Code다.
목표: 이 Windows의 Orca(클라이언트)를 내 Mac Studio Orca 호스트(Tailscale IP 100.65.201.6,
Orca 기본 포트 6768)에 연결해서, 코딩 세션은 맥에서 돌고 Windows는 조종만 하게 만드는 것.
맥 호스트가 발급한 페어링 URL이 필요하다 — 없으면 나에게 먼저 요청해라(맥 orca-setup 세션 결과물).

터미널로 되는 건 네가 직접 하고, Orca 앱 GUI 클릭이 불가피한 것만 정확히 짚어라.
위험·비가역만 나에게 물어라.

[1. 네트워크 경로 검증 — 가장 중요. 이게 안 되면 페어링이 실패한다]
- Tailscale 연결 확인(Windows Tailscale). 내 node가 온라인이고 macstudio(100.65.201.6)가
  피어 목록에 보이는지. 안 보이면 Tailscale부터 켜라고 나에게 알려라.
- 맥 도달성 + Orca 포트 열림 확인:
  PowerShell `Test-NetConnection 100.65.201.6 -Port 6768` (TcpTestSucceeded=True 여야 함).
  실패면: 맥에서 Orca 호스트(orca serve 또는 "앱을 서버로 광고")가 안 떠 있거나 Tailscale 경로 문제 →
  그 사실과 어느 쪽인지 추정해서 나에게 보고.

[2. Orca CLI로 자동 연결 가능한지 확인]
- Windows에 orca 명령/CLI가 있는지 탐색(설치 경로 포함). 있으면 `orca --help`에서
  서버 추가/페어링 관련 서브커맨드(connect, pair, add-server, server add 류)가 있는지 확인.
- 있으면 그 커맨드로 페어링 URL을 넣어 맥 호스트에 연결 시도.

[3. 딥링크 자동 페어링 시도 (CLI가 없을 때)]
- 페어링 URL이 `orca://`로 시작하면 딥링크로 Orca를 열어 자동 페어링 시도:
  PowerShell `Start-Process "<페어링URL>"`. Orca 앱이 뜨며 페어링 대화가 나오면 성공 흐름.
  (URL을 나에게 받아서 실행. 이건 GUI를 여는 것이지만 클릭 대신 자동 실행이라 시도할 가치 있음.)

[4. 위가 다 안 되면 — 순수 GUI, 이 한 단계만 내 몫]
- 나에게 정확히 안내: "Windows Orca 앱 → 설정 → 원격 Orca 서버(Remote Orca Servers) →
  Add Server → 이 페어링 URL 붙여넣기." (이건 앱 안 클릭이라 네가 못 한다.)

[5. 연결 후 검증 + 사용법 상기]
- 연결되면 Windows Orca 서버 목록에 맥(macstudio/100.65.201.6)이 뜨는지 나에게 확인 요청.
- ★ 반드시 상기시켜라: "프로젝트/세션은 **맥 서버 런타임에서 열어야** 에이전트가 맥에서 돈다.
  Windows에서 로컬로 새 세션 만들지 말 것. 그때 로컬 'Agent 런타임 Windows|WSL' 설정은 무시된다."
- 최종 검증: 맥에서 세션 하나 만들고 Windows에서 그게 보이면 성공. 노트북 닫았다 열어도
  계속돼 있으면 "맥 호스트 상시 실행"까지 확인된 것.

주의: 페어링 URL은 비밀(런타임 접근권). Tailscale 전용, 공인망 노출/포트포워딩 금지.
```

---

## 흐름 요약
1. **맥 세션**(orca-setup-prompt): 호스트 상시 구동 + **페어링 URL 발급**.
2. 그 URL을 **Windows 세션**(이 프롬프트)에 준다.
3. Windows 세션: 네트워크 검증 → 딥링크/CLI 자동 페어링 시도 → 안 되면 GUI 한 단계 안내.
4. 폰: 맥 호스트의 모바일 QR을 Orca 앱으로 스캔(Tailscale 켜고).
