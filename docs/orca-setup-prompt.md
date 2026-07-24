# Orca 원격 개발 셋업 — 맥 로컬 Claude Code 세션용 프롬프트

> 사용법: 맥(스튜디오)에서 `claude`를 실행해 새 세션을 열고, 아래 "붙여넣기 프롬프트" 전체를 붙여넣는다.
> 그 세션이 터미널로 가능한 건 자동 처리하고, GUI 클릭이 꼭 필요한 것만 사용자에게 짚어준다.

---

## 붙여넣기 프롬프트 (이 아래 전체를 복사)

```
너는 지금 내 Mac Studio(24시간 상시, 호스트명 segiui-MacStudio, 사용자 seakimacultra,
Tailscale IP 100.65.201.6)에서 로컬로 도는 Claude Code다. 목표는 Orca(stablyai)를
이 맥에서 "원격 Orca 서버"로 상시 구동해서, 내 Windows 노트북(Tailscale node 100.104.71.7)과
폰이 Tailscale로 붙어 세션을 조종하고, 노트북을 닫아도 세션이 맥에서 계속 살아있게 만드는 것이다.

먼저 맥락을 읽어라(이 레포 clone 위치를 모르면 물어라):
- docs/CLAUDE.md (설계 마스터·불변원칙)
- docs/remote-dev-guide.md (tmux/Orca 개념)
- docs/HANDOFF.md, deploy/STATE.md (현재 인프라 상태)
읽고 나서 아래를 순서대로 실행. 터미널로 가능한 건 네가 직접 하고, GUI 버튼 클릭이
불가피한 것만 "이 메뉴를 눌러라"로 정확히 짚어라. 위험·비가역만 나에게 물어라.

[A. 선행 확인 — 자동]
1. `which claude && claude --version` 로 Claude Code 인증·설치 확인. 안 되면 PATH(~/.local/bin) 교정.
2. Tailscale 상태 확인: `tailscale ip -4` 가 100.65.201.6 나오는지. 아니면 알려라.
3. Orca 설치 확인: `ls /Applications/Orca.app` 또는 `brew list --cask | grep orca`. 없으면
   `brew install --cask stablyai/orca/orca`.

[B. Orca CLI 찾기 + serve 가능성 판정 — 자동, 이게 핵심 분기]
4. Orca 앱 번들 안의 CLI를 찾아라:
   `ls -la /Applications/Orca.app/Contents/MacOS/` 및 `/Applications/Orca.app/Contents/Resources/`
   에서 `orca` 실행파일 후보 탐색. 있으면 그 경로를 PATH에 임시 추가.
5. `orca --help` 와 `orca serve --help` 를 실행해서 **macOS에서 serve가 지원되는지** 판정하라.
   결과를 나에게 명확히 보고("serve 됨" / "serve 없음/리눅스전용").

[C-1. serve가 macOS에서 되는 경우 — 거의 완전 자동]
6. `orca serve --port 6768 --pairing-address 100.65.201.6` (모바일도 붙이려면 --mobile-pairing 추가)
   를 백그라운드 상시로 띄워라. launchd LaunchAgent(com.orca.serve.plist)로 만들어
   로그인·재부팅 후 자동 시작 + KeepAlive. 로그는 ~/Library/Logs/orca-serve.log.
7. serve가 출력한 **페어링 URL**(orca://pair?code=... 또는 ws://100.65.201.6:6768 형태)을
   나에게 그대로 보여줘라. 모바일용 QR/URL이 따로 있으면 그것도.

[C-2. serve가 안 되는 경우 — 앱을 서버로 광고(이 부분만 내 클릭 필요)]
8. serve가 안 되면 그 사실을 알리고, 나에게 정확히 이렇게 안내하라:
   "맥 Orca 앱 → 설정 → 원격 Orca 서버(Remote Orca Servers) → '이 앱을 서버로 광고
   (Advertise this app as a server)' → New Link → 생성된 페어링 URL을 복사해서 나에게 붙여넣어라."
   (이건 GUI라 네가 못 누른다. 내가 URL을 주면 다음으로.)

[D. 맥 상시 가동 하드닝 — 자동]
9. 잠자기 방지·자동시작 확인: `pmset -g | grep sleep` (이미 sleep 0이면 OK). 아니면
   `sudo pmset -a sleep 0 disksleep 0` (비번 필요시 나에게 요청).
10. Orca 앱을 로그인 항목(Login Items)에 추가하는 방법을 안내(GUI면 경로만 짚어라).

[E. 결과 요약 — 자동]
11. 다 되면 정리해서 나에게 줘라:
    - 맥이 호스트로 상시 구동 중인가 (serve or 앱광고)
    - **페어링 URL** (Windows·폰에 붙일 것)
    - Windows Orca에서 붙는 절차: "설정 → 원격 Orca 서버 → Add Server → 이 URL 붙여넣기 →
      프로젝트를 맥 서버 런타임에서 열기. 로컬 Agent런타임(Windows|WSL) 설정은 무시됨."
    - 폰 Orca 절차: "Tailscale 켜고 → Pair → QR 스캔(또는 URL)"
    - 검증법: 맥에서 세션 하나 만들고 Windows에서 붙어 보이는지 →
      노트북 닫았다 열어 계속돼 있으면 성공.
12. 진척을 deploy/STATE.md에 한 줄 기록하고 커밋·푸시해라.

불변 원칙(docs/CLAUDE.md): Orca를 무인 자동화 백본으로 쓰지 말 것(그건 n8n@NAS),
매매·발행 권한 미부여, 과잉설계 금지. 페어링 URL은 비밀로 취급(Tailscale 전용, 공인망 노출 금지).
```

---

## 이 프롬프트의 설계 의도
- **터미널로 되는 것**(Claude/Tailscale/Orca 확인, `orca serve` 상시화, launchd, 페어링 URL 발급, pmset) → 맥 세션이 자동.
- **GUI 클릭이 불가피한 것**(serve 미지원 시 "앱을 서버로 광고" 버튼, 로그인 항목 추가) → 그 지점만 사용자에게 정확한 경로 통보.
- **성패 분기**: `orca serve`의 macOS 지원 여부(B-5). 되면 거의 완전 자동, 안 되면 클릭 1~2번.
- Windows·폰 연결은 페어링 URL "붙여넣기/스캔" 한 번씩 — 맥 세션이 그 URL을 만들어 준다.
