"""결정적 매매 엔진 코어 (D7 스켈레톤).

흐름(상태머신): proposal(pending) → [가드레일] VALIDATED → [멱등성 획득] SUBMITTED
             → broker 응답 → FILLED | REJECTED | FAILED
멱등성(GD-2): idempotency_keys 에 check-then-act. 같은 제안 재처리 시 주문 재발사 없음.
"""
import datetime as dt
import os

import psycopg
from psycopg.rows import dict_row

from .broker import make_broker
from .guardrails import Limits, GuardrailViolation, check_proposal
from .ratelimit import TokenBucket

VALID_TRANSITIONS = {
    None: {"VALIDATED"},
    "VALIDATED": {"SUBMITTED", "REJECTED"},
    "SUBMITTED": {"FILLED", "REJECTED", "CANCELLED", "FAILED"},
}


def _env(name: str, default: str | None = None) -> str:
    v = os.environ.get(name, default)
    if v is None:
        raise RuntimeError(f"env {name} required")
    return v


def db_connect():
    return psycopg.connect(
        host=_env("PG_HOST", "postgres"), port=int(_env("PG_PORT", "5432")),
        user=_env("PG_USER"), password=_env("PG_PASSWORD"), dbname=_env("PG_DB"),
        row_factory=dict_row,
    )


def load_limits() -> Limits:
    return Limits(
        max_order_krw=float(_env("TRADE_MAX_ORDER_KRW", "500000")),
        daily_loss_limit_krw=float(_env("TRADE_DAILY_LOSS_LIMIT_KRW", "200000")),
        allowed_markets=tuple(_env("TRADE_ALLOWED_MARKETS", "KR").split(",")),
        kill_switch_path=_env("TRADE_KILL_SWITCH", "/data/KILL"),
    )


def today_realized_krw(cur) -> float:
    cur.execute("SELECT realized_krw FROM trade_daily_pnl WHERE trade_date = CURRENT_DATE")
    row = cur.fetchone()
    return float(row["realized_krw"]) if row else 0.0


def transition(cur, order_id: int, old: str | None, new: str, **fields):
    if new not in VALID_TRANSITIONS.get(old, set()):
        raise RuntimeError(f"illegal transition {old} -> {new}")
    sets = ", ".join(f"{k} = %({k})s" for k in fields)
    sql = f"UPDATE trade_orders SET state = %(new)s, updated_at = now(){', ' + sets if sets else ''} WHERE id = %(id)s AND state = %(old)s"
    cur.execute(sql, {"new": new, "old": old, "id": order_id, **fields})
    if cur.rowcount != 1:
        raise RuntimeError(f"transition race on order {order_id} ({old}->{new})")


def process_proposal(conn, prop: dict, broker_name: str, limits: Limits, bucket: TokenBucket) -> dict:
    """제안 1건 처리. 반환: {'outcome': 'filled|rejected|duplicate', 'order_id': ...}"""
    idem_key = f"trade:{prop['id']}:{prop['market']}:{prop['symbol']}:{prop['side']}:{prop['qty']}:{prop['limit_price']}"

    with conn.cursor() as cur:
        # ── 멱등성 게이트 (GD-2): 먼저 키를 심는다. 0행이면 이미 처리(중복 재발사 방지) ──
        cur.execute(
            "INSERT INTO idempotency_keys (key, kind, status) VALUES (%s, 'trade', 'pending') ON CONFLICT (key) DO NOTHING",
            (idem_key,))
        if cur.rowcount == 0:
            conn.commit()
            return {"outcome": "duplicate", "idem_key": idem_key}

        # ── 가드레일 (통과 못 하면 REJECTED로 종결) ──
        try:
            check_proposal(limits, prop["market"], prop["side"], float(prop["qty"]),
                           float(prop["limit_price"]), today_realized_krw(cur))
        except GuardrailViolation as e:
            cur.execute(
                "INSERT INTO trade_orders (proposal_id, idem_key, state, broker, reject_reason) "
                "VALUES (%s, %s, 'REJECTED', %s, %s) RETURNING id",
                (prop["id"], idem_key, broker_name, str(e)))
            oid = cur.fetchone()["id"]
            cur.execute("UPDATE idempotency_keys SET status='done', result=%s WHERE key=%s",
                        (psycopg.types.json.Json({"outcome": "rejected", "reason": str(e)}), idem_key))
            cur.execute("UPDATE trade_proposals SET status='rejected' WHERE id=%s", (prop["id"],))
            conn.commit()
            return {"outcome": "rejected", "order_id": oid, "reason": str(e)}

        # ── VALIDATED 주문 생성 ──
        cur.execute(
            "INSERT INTO trade_orders (proposal_id, idem_key, state, broker) VALUES (%s, %s, 'VALIDATED', %s) RETURNING id",
            (prop["id"], idem_key, broker_name))
        oid = cur.fetchone()["id"]
        conn.commit()

    # ── 제출 (레이트리밋 통과 후) ──
    bucket.acquire(1)
    broker = make_broker(broker_name)
    with conn.cursor() as cur:
        transition(cur, oid, "VALIDATED", "SUBMITTED")
        conn.commit()
    res = broker.submit_limit_order(prop["market"], prop["symbol"], prop["side"],
                                    float(prop["qty"]), float(prop["limit_price"]))
    with conn.cursor() as cur:
        if res.ok:
            transition(cur, oid, "SUBMITTED", "FILLED",
                       broker_order_id=res.broker_order_id, filled_qty=res.filled_qty, avg_price=res.avg_price)
            outcome = "filled"
        else:
            transition(cur, oid, "SUBMITTED", "REJECTED", reject_reason=res.reason or "broker reject")
            outcome = "rejected"
        cur.execute("UPDATE idempotency_keys SET status='done', result=%s WHERE key=%s",
                    (psycopg.types.json.Json({"outcome": outcome, "broker_order_id": res.broker_order_id}), idem_key))
        cur.execute("UPDATE trade_proposals SET status='done' WHERE id=%s", (prop["id"],))
        conn.commit()
    return {"outcome": outcome, "order_id": oid, "broker_order_id": res.broker_order_id}
