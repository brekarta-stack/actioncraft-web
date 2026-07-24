"""모의 1왕복 셀프테스트 (D7 성공 기준의 스켈레톤판).

검증 항목:
 1) 정상 왕복: 제안 → 가드레일 통과 → MockBroker 체결 → FILLED 기록
 2) 멱등성: 같은 제안 재처리 → duplicate (주문 재발사 0)
 3) 가드레일: 한도 초과 제안 → REJECTED (주문 미발사)
 4) 킬스위치: 파일 생성 → 정상 제안도 REJECTED → 파일 제거
종료코드 0=전부 통과, 1=실패.
"""
import os
import sys

from .core import db_connect, load_limits, process_proposal
from .ratelimit import TokenBucket


def insert_proposal(conn, symbol="005930", qty=1, price=70000):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO trade_proposals (source, market, symbol, side, qty, limit_price, rationale) "
            "VALUES ('selftest', 'KR', %s, 'buy', %s, %s, 'selftest round trip') RETURNING *",
            (symbol, qty, price))
        row = cur.fetchone()
        conn.commit()
        return row


def main() -> int:
    limits = load_limits()
    bucket = TokenBucket(20)
    fails = []
    with db_connect() as conn:
        # 1) 정상 왕복
        p = insert_proposal(conn)
        r1 = process_proposal(conn, p, "mock", limits, bucket)
        print(f"[1] round trip: {r1}")
        if r1["outcome"] != "filled":
            fails.append("round-trip not filled")

        # 2) 멱등성 재처리
        r2 = process_proposal(conn, p, "mock", limits, bucket)
        print(f"[2] idempotent replay: {r2}")
        if r2["outcome"] != "duplicate":
            fails.append("replay was not deduplicated")

        # 3) 한도 초과 (max_order_krw 넘는 명목가)
        big = insert_proposal(conn, qty=1000, price=int(limits.max_order_krw))
        r3 = process_proposal(conn, big, "mock", limits, bucket)
        print(f"[3] over-limit: {r3}")
        if r3["outcome"] != "rejected":
            fails.append("over-limit proposal was not rejected")

        # 4) 킬스위치
        ks = limits.kill_switch_path
        os.makedirs(os.path.dirname(ks), exist_ok=True)
        open(ks, "w").close()
        try:
            p4 = insert_proposal(conn)
            r4 = process_proposal(conn, p4, "mock", limits, bucket)
            print(f"[4] kill switch: {r4}")
            if r4["outcome"] != "rejected" or "KILL" not in (r4.get("reason") or ""):
                fails.append("kill switch did not block")
        finally:
            os.remove(ks)

    if fails:
        print("SELFTEST FAILED:", "; ".join(fails))
        return 1
    print("SELFTEST PASSED: round-trip / idempotency / guardrail / kill-switch")
    return 0


if __name__ == "__main__":
    sys.exit(main())
