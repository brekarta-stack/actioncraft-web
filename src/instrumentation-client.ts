/**
 * 클라이언트 계측 — 유입·클릭 분석 수집 (Next.js 16 instrumentation-client)
 *
 * 실행 시점: HTML 로드 후 · React 하이드레이션 전.
 *   · 최초 1회 + SPA 페이지 이동마다(onRouterTransitionStart) 페이지뷰 기록
 *   · 클릭: a / button / [data-track] 등 실제 클릭 대상만 라벨과 함께 기록
 *
 * 개인정보 보호:
 *   · 쿠키 미사용 — 세션 식별자는 sessionStorage 의 익명 난수(브라우저 닫으면 소멸)
 *   · IP·원본 User-Agent 미수집 (device 는 mobile/desktop 만)
 *   · 최초 진입의 referrer/UTM 을 세션에 저장해 모든 이벤트에 동일 유입정보 첨부
 *
 * 전송: navigator.sendBeacon('/api/track'). 실패해도 사이트 동작엔 영향 없음.
 * (어드민 /admin, 내부 /api 경로는 수집하지 않음)
 */

const ENDPOINT = "/api/track";
const SESSION_KEY = "pc_sid";
const ACQ_KEY = "pc_acq";
/** 이 브라우저의 방문을 집계에서 제외 (운영자 본인용) */
const NOTRACK_KEY = "pc_notrack";

type Acq = {
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  gclid: string;
  adHint: string;
};

/** 집계 제외 여부 (localStorage 플래그) */
function isOptedOut(): boolean {
  try {
    return localStorage.getItem(NOTRACK_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * 집계 제외 플래그 동기화:
 *  · ?notrack=1 → 제외 설정 / ?notrack=0 → 해제
 *  · /admin 진입 시 자동 제외 (운영자 브라우저는 본인 방문이므로 카운트 제외)
 */
function syncOptOut(path: string): void {
  try {
    const q = new URLSearchParams(location.search).get("notrack");
    if (q === "1") localStorage.setItem(NOTRACK_KEY, "1");
    else if (q === "0") localStorage.removeItem(NOTRACK_KEY);
    if (path.startsWith("/admin")) localStorage.setItem(NOTRACK_KEY, "1");
  } catch {
    /* noop */
  }
}

function uid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isTracked(path: string): boolean {
  return !(path.startsWith("/admin") || path.startsWith("/api"));
}

function detectDevice(): "mobile" | "desktop" {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
}

function getSessionId(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = uid();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "no-storage";
  }
}

/** 세션 첫 진입의 유입정보를 한 번만 저장하고 이후 재사용 */
function getAcquisition(): Acq {
  try {
    const cached = sessionStorage.getItem(ACQ_KEY);
    if (cached) return JSON.parse(cached) as Acq;
  } catch {
    /* noop */
  }
  const params = new URLSearchParams(location.search);
  const gclid = params.get("gclid") || "";
  // UTM 미설정 광고 클릭 식별 (구글애즈 gclid/gbraid / 네이버 자동추적 파라미터)
  let adHint = "";
  if (gclid || params.get("gad_source") || params.get("gbraid") || params.get("wbraid")) {
    adHint = "google";
  } else if (params.get("n_media") || params.get("NaPm") || params.get("n_ad")) {
    adHint = "naver";
  }
  const acq: Acq = {
    referrer: document.referrer || "",
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    gclid,
    adHint,
  };
  try {
    sessionStorage.setItem(ACQ_KEY, JSON.stringify(acq));
  } catch {
    /* noop */
  }
  return acq;
}

const DEVICE = detectDevice();

function send(payload: Record<string, unknown>): void {
  if (isOptedOut()) return; // 운영자 등 제외 대상 브라우저는 수집 안 함
  try {
    const body = JSON.stringify({
      ...payload,
      ...getAcquisition(),
      sessionId: getSessionId(),
      device: DEVICE,
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    /* 수집 실패는 무시 */
  }
}

let lastPath = "";
let lastAt = 0;

/* ── 체류 시간(dwell) 측정 ── */
let dwellPath = ""; // 현재 체류 측정 중인 경로
let dwellStart = 0; // 진입 시각(ms)
let dwellSent = false; // 이 페이지의 dwell 전송 여부

/** 현재 페이지의 체류 시간을 한 번 전송 (이탈 시 호출). */
function flushDwell(): void {
  if (!dwellPath || dwellSent || !dwellStart) return;
  dwellSent = true;
  const ms = Date.now() - dwellStart;
  // 0 초과 ~ 30분 미만만 (백그라운드 방치 등 비정상값 제외)
  if (ms > 0 && ms < 30 * 60 * 1000) {
    send({ type: "dwell", path: dwellPath, durationMs: ms });
  }
}

function trackPageview(path: string): void {
  if (!isTracked(path)) return;
  const now = Date.now();
  // 프리패치/Strict Mode 중복 호출 방지
  if (path === lastPath && now - lastAt < 800) return;
  // 직전 페이지의 체류 시간 먼저 전송
  flushDwell();
  lastPath = path;
  lastAt = now;
  // 새 페이지 체류 측정 시작
  dwellPath = path;
  dwellStart = now;
  dwellSent = false;
  send({ type: "pageview", path });
}

function clickLabel(el: Element): string {
  const dt = el.getAttribute("data-track");
  if (dt) return dt.trim().slice(0, 120);
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.trim().slice(0, 120);
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);
  const title = el.getAttribute("title");
  if (title) return title.trim().slice(0, 120);
  if (el instanceof HTMLAnchorElement && el.getAttribute("href")) {
    return el.getAttribute("href")!.slice(0, 120);
  }
  return el.tagName.toLowerCase();
}

function onClick(ev: MouseEvent): void {
  try {
    const target = ev.target as Element | null;
    if (!target || typeof target.closest !== "function") return;
    const el = target.closest(
      '[data-track], a, button, [role="button"], input[type="submit"]'
    );
    if (!el) return;
    const path = location.pathname;
    if (!isTracked(path)) return;
    const href = el instanceof HTMLAnchorElement ? el.href || "" : "";
    send({ type: "click", path, label: clickLabel(el), href });
  } catch {
    /* 무시 */
  }
}

/* ── 초기화: 최초 페이지뷰 + 전역 클릭 리스너 + 이탈 시 체류 전송 ── */
try {
  syncOptOut(location.pathname); // 첫 전송 전에 제외 플래그 동기화
  trackPageview(location.pathname);
  document.addEventListener("click", onClick, { capture: true, passive: true });
  // 탭 닫기 / 전체 새로고침 / 외부 이동 시 마지막 페이지 체류 전송
  window.addEventListener("pagehide", flushDwell);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushDwell();
  });
} catch {
  /* 무시 */
}

/* ── SPA 클라이언트 이동마다 페이지뷰 (Next 16 라우터 훅) ── */
export function onRouterTransitionStart(url: string): void {
  try {
    const path = new URL(url, location.origin).pathname;
    syncOptOut(path);
    trackPageview(path);
  } catch {
    /* 무시 */
  }
}
