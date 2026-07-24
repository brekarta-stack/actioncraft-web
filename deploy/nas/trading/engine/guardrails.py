"""하드 가드레일 (C-5: LLM 제안은 이 검증을 통과해야만 주문이 된다 — 타협 불가).

리뷰 반영: NaN/Infinity 차단(A1) · 킬스위치 fail-closed(A5 — 상태를 못 읽으면 ON으로 간주).
"""
import math
import os
from dataclasses import dataclass


@dataclass
class Limits:
    max_order_krw: float
    daily_loss_limit_krw: float
    allowed_markets: tuple
    kill_switch_path: str


class GuardrailViolation(Exception):
    pass


def validate_kill_switch_dir(limits: Limits):
    """기동 시 1회: 킬스위치 디렉터리가 접근 가능해야 엔진 가동 허용(A5).
    볼륨 미마운트/권한 오류로 스위치가 '안 보이는' 채 주문하는 것 방지."""
    d = os.path.dirname(limits.kill_switch_path) or "/"
    try:
        os.stat(d)
    except OSError as e:
        raise GuardrailViolation(f"kill switch dir {d} inaccessible ({e}) — 엔진 기동 거부(fail-closed)")


def check_kill_switch(limits: Limits):
    try:
        if os.path.exists(limits.kill_switch_path):
            raise GuardrailViolation(f"KILL SWITCH ON ({limits.kill_switch_path}) — 신규 주문 전면 정지")
        # exists()는 EACCES에서 False를 주므로 부모 디렉터리 접근성으로 이중 확인(fail-closed)
        os.stat(os.path.dirname(limits.kill_switch_path) or "/")
    except GuardrailViolation:
        raise
    except OSError as e:
        raise GuardrailViolation(f"kill switch state unknown ({e}) — fail-closed, 주문 차단")


def check_proposal(limits: Limits, market: str, side: str, qty: float, limit_price: float,
                   today_realized_krw: float):
    check_kill_switch(limits)
    if market not in limits.allowed_markets:
        raise GuardrailViolation(f"market {market} not allowed {limits.allowed_markets}")
    if side not in ("buy", "sell"):
        raise GuardrailViolation(f"invalid side {side}")
    # A1: NaN은 모든 비교에 False라 부등호 검사를 전부 통과한다 — isfinite를 먼저.
    if not (math.isfinite(qty) and math.isfinite(limit_price)):
        raise GuardrailViolation(f"non-finite qty/limit_price (qty={qty}, price={limit_price})")
    if qty <= 0 or limit_price <= 0:
        raise GuardrailViolation("qty/limit_price must be positive")
    notional = qty * limit_price
    if not math.isfinite(notional) or notional > limits.max_order_krw:
        raise GuardrailViolation(f"notional {notional:,.0f} > max_order_krw {limits.max_order_krw:,.0f}")
    if today_realized_krw <= -limits.daily_loss_limit_krw:
        raise GuardrailViolation(
            f"daily loss limit hit ({today_realized_krw:,.0f} ≤ -{limits.daily_loss_limit_krw:,.0f}) — 오늘 신규 주문 차단")
    # TODO(D10+): 세션 캘린더(KRX/미국), 종목 화이트리스트, 포지션 합산 상한, KR 정수수량 검증(B14)
