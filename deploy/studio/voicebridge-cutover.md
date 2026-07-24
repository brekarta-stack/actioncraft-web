# voicebridge Studio 커트오버 (D8) — 이식 완료, 물리 단계만 남음

## 2026-07-24 완료된 것 (자동)
- 미니 `~/voicebridge` → Studio `~/voicebridge` 이식(코드+모델 350M, venv 제외). 시크릿 없음 확인.
- `uv sync`로 venv 재구축(uv 0.11.32 신규 설치). 의존성 로드·설정 파싱·모듈 초기화 체인 검증됨
  (기동이 "입력 장치 탐색"까지 도달 — **Studio에 입력 장치 0개**라 그 지점에서 정상적 실패).
- plist 경로 수정본을 `~/Library/LaunchAgents/com.voicebridge.plist`에 설치(**bootstrap 안 함** — 마이크 없이는 크래시루프).
- 미니의 voicebridge는 **그대로 가동 중**(대체 검증 전 중단 금지 원칙).

## 남은 커트오버 (사용자, ~10분)
1. **USB 마이크를 미니에서 뽑아 Studio에 연결** (Mac Studio는 내장 마이크 없음).
2. 장치 확인: `cd ~/voicebridge && .venv/bin/python scripts/list_mics.py`
   - 이름이 `USB MIC`와 다르면 `config.yaml`의 `audio.input_device`를 그 이름으로.
3. **터미널에서 1회 수동 실행**(TCC 마이크 권한 팝업 승인용): `cd ~/voicebridge && .venv/bin/voicebridge`
   - "미니"라고 불러 응답 확인 → Ctrl+C.
4. 상시 가동: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.voicebridge.plist`
5. 대시보드 확인: http://localhost:8765
6. **그 다음에야** 미니 쪽 중단: `ssh agent@100.67.146.83 'launchctl bootout gui/$(id -u)/com.voicebridge'`

## 참고
- 두뇌=Claude Agent SDK — Studio의 claude 인증을 그대로 사용(추가 키 불필요).
- 웨이크워드 "미니"는 config.yaml `wake.word`에서 변경 가능(기기 이름과 혼동 시 "스튜디오" 등).
- 일본어 TTS 보강(Style-Bert-VITS2/VOICEVOX)은 설계상 후속(§3-8) — 커트오버와 무관.
