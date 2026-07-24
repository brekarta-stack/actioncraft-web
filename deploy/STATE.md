# 배포 상태 체크포인트 (2026-07-23)

> 확정된 실측값 기록(비밀 아님). 금요일 `.env` 채울 때 그대로 사용.

## 확정 값 (금요일 `deploy/nas/.env`에)
```
NAS_TS_IP=100.86.100.119
STUDIO_OLLAMA_BASE=http://100.65.201.6:11434
N8N_HOST=nas.<tailnet>.ts.net        # MagicDNS 이름(admin에서 확인) 또는 100.86.100.119
```

## 기기 상태 (Tailscale)
| 기기 | 이름 | IP | 상태 |
|---|---|---|---|
| Mac Studio M3 Ultra 96GB | macstudio | 100.65.201.6 | ✅ 로컬 티어 완성 |
| NAS DXP4800+ (8GB→32GB 금) | nas | 100.86.100.119 | ✅ Tailscale on, 램 대기 |
| Mac mini M4 24GB | mini-dashboard | 100.67.146.83 | 이관 대상(추후 제거) |
| 삼성 노트북 | node | 100.104.71.7 | 접속용 |

## ✅ 완료
- Studio: Tailscale 연결 · ollama 4종 · Tailscale IP 바인딩+재부팅 생존 · 전원 상시 · curl 인수테스트 통과
- NAS: Tailscale Docker(host 모드) · 100.86.100.119 · **RAM 32GB 장착 확인(31Gi)**
- **NAS 백본 배포·검증 완료(2026-07-24)**: postgres(healthy, 스키마 로드) · litellm(4000) · n8n(5679) · uptime-kuma(3001) 4개 Up.
  **★ end-to-end 검증**: `curl litellm classify-fast` → Studio qwen2.5:7b → "안녕하세요." 응답. NAS↔Studio Tailscale 라우팅 실증.
- 배포 초안 전체 + 적대 검증·수정 + 버전핀 확정.

## ⚠️ 배포 중 발견
- **기존 독립 n8n 컨테이너**(name=`n8n`, `n8nio/n8n:latest`, 0.0.0.0:5678) 발견 → 5678 점유. 우리 백본 n8n은 5679로 이동.
  → 정체 확인(`docker logs n8n`) 후 결정: 잔재면 제거+우리 것 5678 복귀 / 필요하면 5679 유지.
- git 없음 → 부트스트랩 붙여넣기로 배포. docker는 `sudo` 필요(계정이 docker 그룹 아님).
- 재부팅 후 Tailscale 컨테이너 자동시작 확인 필요(UGOS Docker 전역 "컨테이너 자동시작" 켜기).

## ⬜ 남은 것 (오늘 마저 가능)
- NAS 웹: 자동 업데이트 OFF · 텔레메트리 옵트아웃 (업데이트·SSH는 완료)

## ⬜ 금요일 (램 32GB 후)
- 램 장착 → `deploy/README.md` 따라 백본 4종 `docker compose up`
- `.env`에 위 확정값 + 시크릿 채우기

## ⬜ 숙제(병렬, 언제든)
- 도메인 정의(biz-a/b/c) + 24채널 O/X → Track B 게이트
- 신청 5종(LinkedIn·YouTube·KIS·Kling·Supertone)
