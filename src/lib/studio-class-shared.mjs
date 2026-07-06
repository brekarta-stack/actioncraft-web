/**
 * 학급 세트(교육 패키지, 웹 M4) 순수 헬퍼 — 빌더·API·테스트 공유.
 * 세트는 서버 저장 없이 URL 파라미터(items=skey:수량,…)로만 표현한다
 * (교사가 링크를 나눠 주면 학생은 로그인 없이 그대로 연다).
 */

export const CLASS_MAX_ITEMS = 12;   // 세트에 담는 모형 종류
export const CLASS_MAX_QTY = 40;     // 모형당 수량(학생 수)
export const CLASS_MAX_SHEETS = 400; // 묶음 PDF 총 장수 상한 (남용·메모리 가드)

const SKEY_RE = /^[a-z0-9_]{1,40}$/;

/** [{skey, qty}] → "d_car:5,d_dog:7" (공유 링크·URL 상태) */
export function encodeClassItems(rows) {
  return rows
    .filter((r) => SKEY_RE.test(r.skey) && Number.isFinite(r.qty) && r.qty >= 1)
    .map((r) => `${r.skey}:${Math.min(CLASS_MAX_QTY, Math.floor(r.qty))}`)
    .join(",");
}

/** "d_car:5,d_dog:7" → [{skey, qty}] — 쓰레기 토큰은 버리고 중복은 합산한다. */
export function decodeClassItems(param) {
  const out = new Map();
  for (const tok of String(param ?? "").split(",")) {
    const m = tok.trim().match(/^([a-z0-9_]{1,40}):(\d{1,3})$/);
    if (!m) continue;
    const qty = Math.min(CLASS_MAX_QTY, Math.max(1, Number(m[2])));
    out.set(m[1], Math.min(CLASS_MAX_QTY, (out.get(m[1]) ?? 0) + qty));
    if (out.size >= CLASS_MAX_ITEMS) break;
  }
  return [...out.entries()].map(([skey, qty]) => ({ skey, qty }));
}

/** 묶음 PDF 총 장수 — 상한 검사와 UI 합계가 같은 식을 쓰게 한다. */
export function totalSheets(rows, pagesBySkey) {
  return rows.reduce((s, r) => s + (pagesBySkey[r.skey] ?? 0) * r.qty, 0);
}
