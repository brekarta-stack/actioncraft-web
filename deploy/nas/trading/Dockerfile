# 매매 엔진 (D7 스켈레톤) — 격리 컨테이너 (GD-1)
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY engine ./engine
# 기본은 셀프테스트. 상시 루프는 D10+에서 engine.main으로 교체.
CMD ["python", "-m", "engine.selftest"]
