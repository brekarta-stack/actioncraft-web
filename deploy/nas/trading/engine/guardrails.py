"""하드 가드레일 (C-5: LLM 제안은 이 검증을 통과해야만 주문이 된다 — 타협 불가)."""
import os
from dataclasses import dataclass


@dataclass
class Limits:
    max_order_krw: float          # 1회 주문 명목가 상한
    daily_loss_limit_krw: float   # 일 실현손실 한도(도달 시 신규 주문 전면 차단)
    allowed_markets: tuple        # 허용 시장
    kill_switch_path: str         # 파일 존재=전면 정지


class GuardrailViolation(Exception):
    pass


def check_kill_switch(limits: Limits):
    if os.path.exists(limits.kill_switch_path):
        raise GuardrailViolation(f"KILL SWITCH ON ({limits.kill_switch_path}) — 신규 주문 전면 정지")


def check_proposal(limits: Limits, market: str, side: str, qty: float, limit_price: float,
                   today_realized_krw: float):
    check_kill_switch(limits)
    if market not in limits.allowed_markets:
        raise GuardrailViolation(f"market {market} not allowed {limits.allowed_markets}")
    if side not in ("buy", "sell"):
        raise GuardrailViolation(f"invalid side {side}")
    if qty <= 0 or limit_price <= 0:
        raise GuardrailViolation("qty/limit_price must be positive")
    notional = qty * limit_price   # KR 기준 명목가. US는 환율 반영을 실전 단계에서(스켈레톤은 보수적으로 동일 상한)
    if notional > limits.max_order_krw:
        raise GuardrailViolation(f"notional {notional:,.0f} > max_order_krw {limits.max_order_krw:,.0f}")
    if today_realized_krw <= -limits.daily_loss_limit_krw:
        raise GuardrailViolation(
            f"daily loss limit hit ({today_realized_krw:,.0f} ≤ -{limits.daily_loss_limit_krw:,.0f}) — 오늘 신규 주문 차단")
    # TODO(D10+): 세션 캘린더(KRX/미국 정규·주간, 휴장일) — 장외엔 큐잉/거부
    # TODO(D10+): 종목 화이트리스트/블랙리스트, 포지션 합산 상한, 최대 미체결 수
