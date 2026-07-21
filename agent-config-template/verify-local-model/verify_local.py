#!/usr/bin/env python3
"""로컬 모델 96GB 검증 키트 — 단일 파일, 표준 라이브러리만.

스튜디오에서 ollama로 실제 업무형 과제를 돌려:
  - 속도 (tok/s)
  - 도구호출 신뢰성 (자동 채점)
  - 구조화 JSON 출력 정확도 (자동 채점)
  - 품질 과제 출력 (사람 판정용 캡처)
를 측정하고 results.md 로 뽑는다.

사용:
  MODEL=qwen3.6:35b-a3b python3 verify_local.py
  MODEL=gpt-oss:120b   python3 verify_local.py   # 다른 모델로 다시 돌려 비교

두 번 이상 돌리면 각각 results-<model>.md 로 저장된다. 그 파일들을 Claude에게 붙여넣으면 종합 판정.
"""
import json, os, sys, time, re
import urllib.request, urllib.error

HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
MODEL = os.environ.get("MODEL", "qwen3.6:35b-a3b")
TEMP = float(os.environ.get("TEMP", "0.3"))
TIMEOUT = int(os.environ.get("TIMEOUT", "600"))

# ── 도구 정의 (도구호출 과제용) ──────────────────────────────
TOOLS = [
    {"type": "function", "function": {
        "name": "create_notion_record",
        "description": "견적/문의 내용을 Notion 데이터베이스에 기록한다",
        "parameters": {"type": "object", "properties": {
            "title": {"type": "string"}, "customer": {"type": "string"},
            "product": {"type": "string"}, "quantity": {"type": "integer"},
            "due_date": {"type": "string", "description": "YYYY-MM-DD"},
        }, "required": ["title", "customer", "product"]}}},
    {"type": "function", "function": {
        "name": "send_slack",
        "description": "지정 채널에 Slack 메시지를 보낸다",
        "parameters": {"type": "object", "properties": {
            "channel": {"type": "string"}, "text": {"type": "string"},
        }, "required": ["channel", "text"]}}},
    {"type": "function", "function": {
        "name": "schedule_calendar",
        "description": "구글 캘린더에 일정을 만든다",
        "parameters": {"type": "object", "properties": {
            "title": {"type": "string"}, "date": {"type": "string"},
            "time": {"type": "string"},
        }, "required": ["title", "date"]}}},
]

# ── 과제 (biz-a 액션크래프트/페이퍼크래프트 + 일반 운영) ──────
# type: quality(사람판정) | json(자동:유효JSON+필수키) | tool(자동:도구+인자) | clarify(자동:도구호출 안함)
TASKS = [
    {"id": "Q1-견적응대", "type": "quality",
     "prompt": "다음 고객 문의에 정중한 한국어로 견적 답변 초안을 써줘. 문의: '안녕하세요, 회사 창립 10주년 기념품으로 페이퍼크래프트 트로피 300개를 제작하고 싶습니다. 로고 각인 가능한가요? 예산은 개당 8천원 내외, 납기는 3주 정도 생각합니다. 견적 부탁드려요.'"},

    {"id": "Q2-스레드요약", "type": "quality",
     "prompt": "다음 고객 대화를 내부 공유용으로 3줄 이내로 요약해줘.\n고객: 지난번 샘플 잘 받았습니다. 색감이 생각보다 어둡네요.\n담당: 아 네, 팬톤 몇 번으로 맞춰드릴까요?\n고객: 밝은 파랑 계열이면 좋겠고, 표면은 무광으로요.\n담당: 확인했습니다. 무광 밝은 파랑으로 재샘플 진행하겠습니다. 3일 걸립니다.\n고객: 좋아요. 그리고 수량을 500개에서 700개로 늘릴게요."},

    {"id": "Q3-다단계판단", "type": "quality",
     "prompt": "우리 재고: 무광 코팅지 A2 400장, B2 200장. 1개 제작에 A2 1장 필요. 고객이 트로피 500개를 2주 내 납기로 요청. 제작 가능 여부를 판단하고, 부족하면 어떻게 해결할지(대체/발주/분할납기) 다음 액션을 3가지로 제시해줘."},

    {"id": "J1-필드추출", "type": "json", "require": ["product", "quantity", "due", "budget"],
     "system": "너는 문의에서 정보를 추출해 JSON만 출력한다. 설명 없이 JSON 객체 하나만.",
     "prompt": "다음에서 product, quantity(정수), due(납기, 문자열), budget(개당 예산 숫자)를 추출해 JSON으로만: '페이퍼크래프트 트로피 300개, 개당 8천원 내외, 3주 납기 희망'"},

    {"id": "J2-분류", "type": "json", "require": ["category", "urgency"],
     "system": "너는 들어온 메시지를 분류해 JSON만 출력한다.",
     "prompt": "다음 메시지를 category(견적문의|AS|협업제안|스팸), urgency(상|중|하), reason 으로 분류해 JSON으로만 출력: '납품받은 제품 100개 중 12개 각인이 번졌습니다. 재제작 언제 가능한가요? 급합니다.'"},

    {"id": "T1-도구_기록", "type": "tool", "expect": "create_notion_record",
     "prompt": "이 견적 문의를 Notion에 기록해줘: 고객 '대한상사', 제품 '페이퍼 트로피', 수량 300개, 납기 2026-08-15."},

    {"id": "T2-도구_선택", "type": "tool", "expect_any": ["schedule_calendar", "send_slack"],
     "prompt": "내일 오후 3시에 대한상사와 견적 미팅 잡고, 담당 채널 #biz-a 에 미팅 잡혔다고 알려줘."},

    {"id": "T3-과잉호출억제", "type": "clarify",
     "prompt": "그거 좀 처리해줘."},

    {"id": "R-일관성", "type": "json_repeat", "n": 3, "require": ["category", "urgency"],
     "system": "너는 메시지를 분류해 JSON만 출력한다.",
     "prompt": "category(견적문의|AS|협업|스팸)와 urgency(상|중|하)로 분류, JSON만: '견적서 언제 주시나요? 다음주 결재 올려야 해서요.'"},
]


def chat(messages, tools=None):
    body = {"model": MODEL, "messages": messages, "stream": False,
            "options": {"temperature": TEMP}}
    if tools:
        body["tools"] = tools
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(HOST + "/api/chat", data=data,
                                 headers={"Content-Type": "application/json"})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        resp = json.loads(r.read().decode("utf-8"))
    wall = time.time() - t0
    ec = resp.get("eval_count", 0)
    ed = resp.get("eval_duration", 0) or 0
    tps = (ec / (ed / 1e9)) if ed > 0 else (ec / wall if wall > 0 else 0)
    msg = resp.get("message", {})
    return {"content": msg.get("content", ""), "tool_calls": msg.get("tool_calls", []),
            "tps": tps, "wall": wall, "eval_count": ec}


def try_json(text):
    """본문에서 JSON 객체를 최대한 추출해 파싱."""
    text = text.strip()
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None


def run():
    print(f"모델={MODEL}  호스트={HOST}")
    # 연결 확인
    try:
        with urllib.request.urlopen(HOST + "/api/tags", timeout=10) as r:
            tags = json.loads(r.read().decode("utf-8"))
        names = [m.get("name", "") for m in tags.get("models", [])]
        if not any(MODEL.split(":")[0] in n for n in names):
            print(f"\n⚠️  '{MODEL}' 이(가) ollama에 없습니다. 먼저: ollama pull {MODEL}")
            print(f"   설치된 모델: {', '.join(names) or '(없음)'}")
            print("   MODEL 환경변수로 다른 태그를 지정할 수 있습니다.")
            sys.exit(1)
    except urllib.error.URLError:
        print("\n✗ ollama에 연결 못 함. 'ollama serve'가 떠 있는지 확인하세요.")
        sys.exit(1)

    rows, tps_list = [], []
    tool_ok = tool_total = 0
    json_ok = json_total = 0

    for t in TASKS:
        tid, ttype = t["id"], t["type"]
        print(f"  ▶ {tid} ({ttype}) ...", flush=True)
        try:
            if ttype in ("tool", "clarify"):
                r = chat([{"role": "user", "content": t["prompt"]}], tools=TOOLS)
            elif ttype == "json_repeat":
                reps = []
                for i in range(t.get("n", 3)):
                    rr = chat([{"role": "system", "content": t.get("system", "")},
                               {"role": "user", "content": t["prompt"]}])
                    reps.append(rr)
                r = reps[0]; r["_reps"] = reps
            else:
                msgs = []
                if t.get("system"):
                    msgs.append({"role": "system", "content": t["system"]})
                msgs.append({"role": "user", "content": t["prompt"]})
                r = chat(msgs, tools=None)
        except Exception as e:
            rows.append((tid, ttype, "ERROR", 0, str(e)[:200]))
            continue

        tps_list.append(r["tps"])
        verdict, detail = "사람판정", ""

        if ttype == "json":
            json_total += 1
            obj = try_json(r["content"])
            miss = [k for k in t.get("require", []) if not (obj and k in obj)]
            if obj is not None and not miss:
                verdict = "PASS"; json_ok += 1
            else:
                verdict = "FAIL"; detail = ("JSON 파싱 실패" if obj is None else f"누락키:{miss}")
            detail += " | " + (json.dumps(obj, ensure_ascii=False) if obj else r["content"][:150])

        elif ttype == "json_repeat":
            oks = 0
            for rr in r["_reps"]:
                obj = try_json(rr["content"])
                if obj is not None and all(k in obj for k in t.get("require", [])):
                    oks += 1
            json_total += 1
            verdict = "PASS" if oks == len(r["_reps"]) else "FAIL"
            if verdict == "PASS":
                json_ok += 1
            detail = f"{oks}/{len(r['_reps'])}회 유효 (형식 일관성)"

        elif ttype == "tool":
            tool_total += 1
            names = [tc.get("function", {}).get("name") for tc in r["tool_calls"]]
            want = t.get("expect")
            want_any = t.get("expect_any", [want] if want else [])
            if any(n in want_any for n in names):
                verdict = "PASS"; tool_ok += 1
            else:
                verdict = "FAIL"
            detail = f"호출:{names or '없음'} | 기대:{want_any}"

        elif ttype == "clarify":
            tool_total += 1
            if not r["tool_calls"]:
                verdict = "PASS"; tool_ok += 1  # 애매한 요청엔 도구 호출 대신 되물어야 정상
            else:
                verdict = "FAIL"
            detail = f"도구호출:{[tc.get('function',{}).get('name') for tc in r['tool_calls']] or '없음(정상)'} | 응답:{r['content'][:120]}"

        else:  # quality
            detail = r["content"]

        rows.append((tid, ttype, verdict, r["tps"], detail))

    # ── 결과 파일 ──
    avg_tps = sum(tps_list) / len(tps_list) if tps_list else 0
    safe = MODEL.replace(":", "_").replace("/", "_")
    out = f"results-{safe}.md"
    with open(out, "w", encoding="utf-8") as f:
        f.write(f"# 로컬 모델 검증 결과\n\n")
        f.write(f"- 모델: **{MODEL}**\n- 평균 속도: **{avg_tps:.1f} tok/s**\n")
        f.write(f"- 도구호출 자동채점: **{tool_ok}/{tool_total}**\n")
        f.write(f"- JSON 구조화 자동채점: **{json_ok}/{json_total}**\n\n")
        f.write("> 자동채점(PASS/FAIL)은 도구·JSON 과제만. 'quality'는 아래 출력을 사람이 판정.\n\n")
        f.write("| 과제 | 유형 | 판정 | tok/s |\n|---|---|---|---|\n")
        for tid, ttype, verdict, tps, _ in rows:
            f.write(f"| {tid} | {ttype} | {verdict} | {tps:.1f} |\n")
        f.write("\n---\n\n## 과제별 출력\n\n")
        for tid, ttype, verdict, tps, detail in rows:
            f.write(f"### {tid} · {ttype} · {verdict} · {tps:.1f} tok/s\n\n")
            f.write("```\n" + (detail or "").strip()[:2000] + "\n```\n\n")
        f.write("\n---\n이 파일 전체를 Claude에게 붙여넣으면 '96GB로 충분/부족'을 함께 판정합니다.\n")

    print(f"\n✓ 완료 → {out}")
    print(f"  평균 {avg_tps:.1f} tok/s · 도구 {tool_ok}/{tool_total} · JSON {json_ok}/{json_total}")
    print(f"  이 파일을 Claude에게 붙여넣으세요: {os.path.abspath(out)}")


if __name__ == "__main__":
    run()
