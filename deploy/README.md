# D2 배포 런북 — NAS 백본 + Studio 24/7 (금요일, RAM 32GB 도착 후)

> 목표: 하루 안에 백본 컨테이너 4종 기동 + Studio 로컬 티어 상시화 + Tailscale 연결.
> ⚠️ 모든 image 태그는 설치 시점 현재 안정판으로 핀(§compose 주석). 지식 컷오프 이후 버전 재확인.

## 0. 선행 (RAM 증설)
- NAS 전원 OFF → 8GB + 32GB(또는 16+16=32) 장착 → 부팅 → UGOS에서 메모리 인식 확인.
- UGOS: 텔레메트리 OFF(제어판) + **자동 업데이트 OFF**(월례 수동). SSH 활성(제어판>터미널).

## 1. Tailscale (기기 이름 고정 = IP 안정화)
- NAS·Studio에 Tailscale 로그인(같은 계정). MagicDNS ON.
- 각 기기 이름 확인: `tailscale status`. 이 이름을 config의 `N8N_HOST`/`STUDIO_HOST`에 사용(IP 금지).
- 공유기: NAS·Studio DHCP 예약(고정 IP). **포트포워딩은 하지 않음.**

## 2. Studio 하드닝 (로컬 티어)
```bash
bash deploy/studio/harden-studio.sh   # pmset·ollama 0.0.0.0·모델 pull
# macOS 방화벽 ON. 출력의 Tailscale 이름을 기록(STUDIO_HOST).
```

## 3. NAS 백본 기동
```bash
# NAS SSH 접속 후, 데이터 볼륨에 배포 파일 배치(/volume1/...). 레포에서 deploy/nas/ 복사.
cp deploy/nas/.env.example deploy/nas/.env    # .env 실제 값 채우기(패스워드매니저에도)
#  - N8N_ENCRYPTION_KEY: openssl rand -hex 16
#  - PG_PASSWORD/LITELLM_MASTER_KEY: openssl rand -hex 24
#  - N8N_HOST=nas.<tailnet>.ts.net
# litellm-config.yaml: STUDIO_HOST + 모델ID를 현재값으로 교체. image 태그 핀.
cd deploy/nas
docker compose up -d
docker compose ps          # 4개 up + postgres healthy 확인
docker compose logs -f litellm   # 라우터 로드 확인
```

## 4. 스모크 테스트
```bash
# LiteLLM 라우팅(로컬) — Tailscale 내부에서
curl -s http://nas.<tailnet>.ts.net:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H "Content-Type: application/json" \
  -d '{"model":"classify-fast","messages":[{"role":"user","content":"분류 테스트: 안녕"}],"stream":false}'
# → Studio ollama로 응답 오면 로컬 티어 OK.
# 폴백 시연: Studio에서 ollama 잠깐 중지 → 같은 요청 → kimi-cheap로 폴백되면 무중단 OK.
```

## 5. 접속 확인 (전부 Tailscale 내부)
- n8n:    http://nas.<tailnet>.ts.net:5678
- LiteLLM: http://nas.<tailnet>.ts.net:4000  (Admin UI에서 가상 키+예산 설정)
- Kuma:   http://nas.<tailnet>.ts.net:3001

## 6. D2 완료 기준
- [ ] 컨테이너 4종 up, postgres healthy
- [ ] classify-fast(로컬) 응답 + ollama 중지 시 kimi 폴백
- [ ] 관리 UI 3종이 Tailscale로만 접근(공인망 불가)
- [ ] Studio 재부팅해도 ollama 자동 기동(pmset/서비스)

## 다음 (D3~)
- D3: LiteLLM 가상 키·예산캡·80%경고 웹훅(#ops), spec/codegen/review 별칭 확정.
- D4: Kuma에 컨테이너·플로우 등록 + 외부 클라우드 모니터(NAS 감시) + Slack Socket Mode 4채널 + **미니 하드코딩 감사**.
- D5: 백업(pg_dump+encryption key+B2) + 복원 리허설 + 공용 골격(파트 정의 테이블).
