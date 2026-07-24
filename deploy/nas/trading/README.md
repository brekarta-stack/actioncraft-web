# 매매 엔진 스켈레톤 (D7) — C-5 구조의 결정적 실행부

```
[LLM 분석가]                     [이 엔진 (NAS 격리 컨테이너, GD-1)]
 trade_proposals INSERT만   ──→   가드레일 검증 → 멱등성 게이트(GD-2) → 브로커 → 상태머신 기록
 (주문권한 0)                      킬스위치·일손실한도·토큰버킷 20/s
```

## 지금 되는 것 (스켈레톤)
- 상태머신: VALIDATED→SUBMITTED→FILLED/REJECTED (+불법 전이 차단)
- 가드레일: 1회 주문 명목가 상한 · 일손실한도 · 시장 화이트리스트 · **킬스위치**(`/data/KILL` 파일)
- 멱등성: 공용 `idempotency_keys` check-then-act — 같은 제안 재처리 시 주문 재발사 0
- 레이트리밋: 토큰버킷 20/s
- `MockBroker` 즉시체결로 **모의 1왕복 셀프테스트**(정상/중복/한도초과/킬스위치 4케이스)

## 실행 (NAS)
```sh
cd ~/agent-backbone
sudo docker compose --profile trading run --rm trading   # 셀프테스트 1회
sudo docker compose exec -T postgres psql -U $PG_USER -d $PG_DB -c "TABLE trade_orders"
```
킬스위치(운영 중 전면 정지): `sudo docker compose exec trading touch /data/KILL` (해제=rm)

## KIS 연결 단계 (D10+, 사용자 개입 필수)
1. **자격증명은 사용자가 직접**: KIS Developers에서 모의투자 appkey/secret 발급 → NAS `.env`에
   `KIS_APPKEY=` `KIS_APPSECRET=` `KIS_ACCOUNT=` 추가(600 유지). *미니의 `~/agents/config/kis_token*.json`은
   토큰 캐시일 뿐 — 재사용하지 말고 새로 발급 권장. 자동화 세션은 증권 자격증명을 다루지 않는다.*
2. `requirements.txt`에 python-kis 버전핀 추가 → `KISBroker` 구현(토큰 세션앵커 갱신 08:30/22:00 KST,
   웹소켓 재접속, 세션·휴장 캘린더, 미국 지정가 전용 — broker.py TODO 목록).
3. 모의계좌 레이트리밋이 실전보다 훨씬 낮음 — bucket 파라미터 하향.
4. 성공 기준: **KIS 모의투자에서 지정가 1건 왕복**(§4 2주차). 실전 전환은 소액+킬스위치 리허설 후.

## 설계 불변 (위반 금지)
- LLM에 주문권한·이 컨테이너 셸 접근 부여 금지. 분석가는 `trade_proposals` INSERT까지만.
- 시그널 판매·타인계좌 불법(§3-5). 본인 계좌만.
