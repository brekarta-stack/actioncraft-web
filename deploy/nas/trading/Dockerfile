# 매매 엔진 (D7 스켈레톤 v2) — 격리 컨테이너 (GD-1)
# digest 핀(C18): python:3.12-slim @ 2026-07 확인본
FROM python@sha256:57cd7c3a7a273101a6485ba99423ee568157882804b1124b4dd04266317710de
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
 && adduser --disabled-password --gecos "" trader \
 && mkdir -p /data && chown trader:trader /data
COPY engine ./engine
COPY init-trading.sql .
USER trader
# 기본은 셀프테스트(스키마 자동적용 포함). 상시 루프는 D10+에서 engine.main으로 교체.
CMD ["python", "-m", "engine.selftest"]
