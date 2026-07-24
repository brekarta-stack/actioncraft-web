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
    """모의 왕복용: 지정가 즉시 전량 체결로 응답. 네트워크·계좌 없음."""
    name = "mock"
    _seq = itertools.count(1)

    def submit_limit_order(self, market, symbol, side, qty, limit_price) -> OrderResult:
        oid = f"MOCK-{next(self._seq):06d}"
        return OrderResult(ok=True, broker_order_id=oid, filled_qty=qty, avg_price=limit_price)


class KISBroker(Broker):
    """KIS OpenAPI (python-kis) 어댑터 — D10~13에서 구현.
    필수 구현 목록(§3-5): 토큰 세션앵커 갱신(자정 크론 금지, 08:30/22:00 KST 앵커),
    웹소켓 자동 재접속, KRX/미국 세션·휴장 캘린더, 미국 지정가 전용, 모의→실전 단계.
    자격증명은 컨테이너 env(KIS_APPKEY 등)로만 주입 — 코드/레포에 금지."""
    name = "kis-paper"

    def submit_limit_order(self, market, symbol, side, qty, limit_price) -> OrderResult:
        raise NotImplementedError(
            "KISBroker는 스켈레톤 단계에서 비활성. deploy/trading/README.md의 키 이관 절차 후 구현."
        )


def make_broker(name: str) -> Broker:
    if name == "mock":
        return MockBroker()
    if name in ("kis-paper", "kis-live"):
        return KISBroker()
    raise ValueError(f"unknown broker: {name}")
