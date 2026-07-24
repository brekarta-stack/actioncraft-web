"""토큰 버킷 레이트리미터 (C-5: KIS 초당 20콜 제한 대비. 모의계좌는 더 낮음에 유의)."""
import time


class TokenBucket:
    def __init__(self, rate_per_sec: float = 20.0, capacity: float | None = None):
        self.rate = float(rate_per_sec)
        self.capacity = float(capacity if capacity is not None else rate_per_sec)
        self.tokens = self.capacity
        self.last = time.monotonic()

    def acquire(self, n: float = 1.0) -> float:
        """토큰 확보까지 블로킹. 기다린 시간(초)을 반환."""
        waited = 0.0
        while True:
            now = time.monotonic()
            self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
            self.last = now
            if self.tokens >= n:
                self.tokens -= n
                return waited
            need = (n - self.tokens) / self.rate
            time.sleep(need)
            waited += need
