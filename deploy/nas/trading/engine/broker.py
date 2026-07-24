"""브로커 어댑터 (C-5: 결정적 엔진만 이 모듈을 통해 주문. LLM은 여기 접근 불가)."""
from dataclasses import dataclass
import itertools


@dataclass
class OrderResult:
    ok: bool
    broker_order_id: str | None = None
    filled_qty: float = 0.0
    avg_price: float | None = None
    reason: str | None = None


class Broker:
    name = "base"

    def submit_limit_order(self, market: str, symbol: str, side: str, qty: float, limit_price: float) -> OrderResult:
        raise NotImplementedError


class MockBroker(Broker):
    """모의 왕복용: 지정가 즉시 전량 체결. 네트워크·계좌 없음. (시퀀스는 프로세스 로컬 — B13)"""
    name = "mock"
    _seq = itertools.count(1)

    def submit_limit_order(self, market, symbol, side, qty, limit_price) -> OrderResult:
        oid = f"MOCK-{next(self._seq):06d}"
        return OrderResult(ok=True, broker_order_id=oid, filled_qty=qty, avg_price=limit_price)


class RejectingMockBroker(Broker):
    """셀프테스트용: 항상 거절(SUBMITTED→REJECTED 분기 검증, C17c)."""
    name = "mock-reject"

    def submit_limit_order(self, market, symbol, side, qty, limit_price) -> OrderResult:
        return OrderResult(ok=False, reason="mock broker reject (test)")


class ExplodingMockBroker(Broker):
    """셀프테스트용: 예외 발생(SUBMITTED→FAILED 분기 검증, B11)."""
    name = "mock-explode"

    def submit_limit_order(self, market, symbol, side, qty, limit_price) -> OrderResult:
        raise TimeoutError("mock broker timeout (test)")


class KISBroker(Broker):
    """KIS OpenAPI (python-kis) 어댑터 — D10~13에서 구현.
    필수 구현 목록(§3-5 + 리뷰 B10/B13/B14):
      - 토큰 세션앵커 갱신(자정 크론 금지 — 08:30/22:00 KST 앵커), 갱신+웹소켓 재구독 한 트랜잭션
      - 웹소켓 자동 재접속 · KRX/미국 세션·휴장 캘린더 · 미국 지정가 전용
      - ★ 기동 시 대사(reconciliation): DB의 미결 SUBMITTED ↔ KIS 주문조회를 종목/수량/시각으로 매칭
        (KIS는 클라이언트 멱등키를 안 받으므로 이것이 "나갔는지 불명" 주문의 유일한 판별 수단)
      - 단일 인스턴스 강제(PG advisory lock) — 레이트리밋·대사 정합성 전제
      - 수량/가격은 Decimal 그대로 전달(US 소수 수량), KR은 정수 수량 검증
    자격증명은 컨테이너 env(KIS_APPKEY 등)로만 주입 — 코드/레포 저장 금지. 참고 구현: reference/kis-*"""
    name = "kis-paper"

    def submit_limit_order(self, market, symbol, side, qty, limit_price) -> OrderResult:
        raise NotImplementedError(
            "KISBroker는 스켈레톤 단계에서 비활성. deploy/nas/trading/README.md의 키 이관 절차 후 구현.")


def make_broker(name: str) -> Broker:
    return {
        "mock": MockBroker, "mock-reject": RejectingMockBroker, "mock-explode": ExplodingMockBroker,
        "kis-paper": KISBroker, "kis-live": KISBroker,
    }[name]()
