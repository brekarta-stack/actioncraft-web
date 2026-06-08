/**
 * 유입·클릭 분석 — 공용 타입 / 유입출처 파싱 / 집계 헬퍼
 *
 * 이 파일은 서버에서만 의미가 있다 (브라우저 번들에는 포함 X):
 *   · parseAcquisition  → POST /api/track 에서 referrer/utm 을 source/medium 으로 변환
 *   · summarize…        → /admin/analytics 페이지에서 행 배열을 집계
 *
 * 외부 분석 도구(GA 등) 없이 자체 수집한다. 개인정보(IP·UA)는 저장하지 않는다.
 */

/* ───────────────────────── 타입 ───────────────────────── */

export type AnalyticsEventType = "pageview" | "click";

/** 브라우저가 /api/track 으로 보내는 페이로드 */
export interface TrackPayload {
  type: AnalyticsEventType;
  path: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  label?: string;
  href?: string;
  sessionId?: string;
  device?: "mobile" | "desktop";
}

/** analytics_events 테이블의 한 행 (snake_case, Supabase 반환 형태) */
export interface AnalyticsRow {
  type: string;
  path: string;
  referrer: string | null;
  source: string | null;
  medium: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  label: string | null;
  href: string | null;
  session_id: string | null;
  device: string | null;
  created_at: string;
}

export interface Acquisition {
  source: string;
  medium: string;
}

/* ─────────────────── 유입출처 파싱 ─────────────────── */

/** 검색엔진 — 호스트 라벨에 이 토큰이 있으면 organic 으로 분류 */
const SEARCH_TOKENS: Record<string, string> = {
  google: "google",
  naver: "naver",
  daum: "daum",
  bing: "bing",
  yahoo: "yahoo",
  duckduckgo: "duckduckgo",
  baidu: "baidu",
  yandex: "yandex",
  zum: "zum",
  ecosia: "ecosia",
};

/** 소셜/메신저 — 호스트 라벨에 이 토큰이 있으면 social 로 분류 */
const SOCIAL_TOKENS: Record<string, string> = {
  instagram: "instagram",
  facebook: "facebook",
  youtube: "youtube",
  twitter: "twitter",
  threads: "threads",
  linkedin: "linkedin",
  tiktok: "tiktok",
  pinterest: "pinterest",
  kakaostory: "kakaostory",
  band: "band",
};

/** 짧아서 라벨 매칭이 위험한 호스트는 정확히 일치로 처리 */
function matchSpecialHost(bare: string): Acquisition | null {
  if (bare === "x.com" || bare.endsWith(".x.com") || bare === "t.co")
    return { source: "twitter", medium: "social" };
  if (bare === "youtu.be") return { source: "youtube", medium: "social" };
  if (bare === "fb.com" || bare === "fb.me") return { source: "facebook", medium: "social" };
  return null;
}

/**
 * referrer + UTM → { source, medium }.
 * 우선순위: UTM > 직접유입(referrer 없음) > 내부이동 > 소셜 > 검색엔진 > 일반 referral.
 */
export function parseAcquisition(opts: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  siteHost?: string | null;
}): Acquisition {
  const { referrer, utmSource, utmMedium, siteHost } = opts;

  // 1) UTM 캠페인 태그가 있으면 최우선
  if (utmSource && utmSource.trim()) {
    return {
      source: utmSource.trim().toLowerCase().slice(0, 60),
      medium: (utmMedium?.trim() || "campaign").toLowerCase().slice(0, 60),
    };
  }

  // 2) referrer 가 없으면 직접 유입 (북마크/주소 직접입력/앱 등)
  if (!referrer || !referrer.trim()) return { source: "direct", medium: "direct" };

  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return { source: "direct", medium: "direct" };
  }
  if (!host) return { source: "direct", medium: "direct" };

  const bare = host.replace(/^www\./, "");

  // 3) 같은 사이트에서 온 이동 → 내부 이동
  if (siteHost) {
    const sh = siteHost.replace(/^www\./, "");
    if (bare === sh || bare.endsWith("." + sh)) {
      return { source: "direct", medium: "internal" };
    }
  }

  // 4) 짧은 특수 호스트 (x.com 등)
  const special = matchSpecialHost(bare);
  if (special) return special;

  const labels = bare.split(".");

  // 5) 소셜 (검색보다 먼저 — blog.naver 같은 케이스 회피)
  for (const token in SOCIAL_TOKENS) {
    if (labels.includes(token)) return { source: SOCIAL_TOKENS[token], medium: "social" };
  }

  // 6) 검색엔진
  for (const token in SEARCH_TOKENS) {
    if (labels.includes(token)) return { source: SEARCH_TOKENS[token], medium: "organic" };
  }

  // 7) 그 외 외부 사이트 → referral (호스트명 그대로)
  return { source: bare.slice(0, 60), medium: "referral" };
}

/* ─────────────────── 집계 헬퍼 (admin) ─────────────────── */

export interface Counted {
  key: string;
  count: number;
}

export interface SourceStat {
  source: string;
  medium: string;
  sessions: number;
}

export interface ClickStat {
  label: string;
  href: string | null;
  count: number;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  pageviews: number;
  sessions: number;
}

export interface AnalyticsSummary {
  totalPageviews: number;
  totalSessions: number;
  totalClicks: number;
  sources: SourceStat[];
  topPages: Counted[];
  topClicks: ClickStat[];
  daily: DailyStat[];
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** UTC ISO 문자열 → KST 기준 YYYY-MM-DD */
function kstDate(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function topN(map: Map<string, number>, n: number): Counted[] {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * analytics_events 행 배열 → 대시보드 집계.
 * @param rows  조회된 행 (기간 필터는 호출 측에서 적용)
 * @param days  일별 추이를 만들 일 수 (기본 14)
 */
export function summarize(rows: AnalyticsRow[], days = 14): AnalyticsSummary {
  const pageviews = rows.filter((r) => r.type === "pageview");
  const clicks = rows.filter((r) => r.type === "click");

  const sessionIds = new Set<string>();
  for (const r of pageviews) if (r.session_id) sessionIds.add(r.session_id);

  /* 유입 출처: 세션 단위로 집계 (세션의 대표 source/medium 1개) */
  const sessionAcq = new Map<string, { source: string; medium: string }>();
  for (const r of pageviews) {
    const sid = r.session_id ?? `anon-${r.created_at}`;
    if (!sessionAcq.has(sid)) {
      sessionAcq.set(sid, {
        source: r.source || "direct",
        medium: r.medium || "direct",
      });
    }
  }
  const sourceMap = new Map<string, SourceStat>();
  for (const { source, medium } of sessionAcq.values()) {
    const key = `${source}|${medium}`;
    const cur = sourceMap.get(key);
    if (cur) cur.sessions += 1;
    else sourceMap.set(key, { source, medium, sessions: 1 });
  }
  const sources = [...sourceMap.values()].sort((a, b) => b.sessions - a.sessions);

  /* 인기 페이지: pageview 경로별 카운트 */
  const pageMap = new Map<string, number>();
  for (const r of pageviews) {
    const p = r.path || "/";
    pageMap.set(p, (pageMap.get(p) ?? 0) + 1);
  }
  const topPages = topN(pageMap, 12);

  /* 클릭 순위: label 별 카운트 (+ 대표 href) */
  const clickMap = new Map<string, number>();
  const clickHref = new Map<string, string | null>();
  for (const r of clicks) {
    const label = (r.label || "(라벨 없음)").slice(0, 80);
    clickMap.set(label, (clickMap.get(label) ?? 0) + 1);
    if (!clickHref.has(label)) clickHref.set(label, r.href ?? null);
  }
  const topClicks: ClickStat[] = topN(clickMap, 15).map((c) => ({
    label: c.key,
    href: clickHref.get(c.key) ?? null,
    count: c.count,
  }));

  /* 일별 추이 (최근 days 일, KST) */
  const dayPV = new Map<string, number>();
  const daySessions = new Map<string, Set<string>>();
  for (const r of pageviews) {
    const d = kstDate(r.created_at);
    if (!d) continue;
    dayPV.set(d, (dayPV.get(d) ?? 0) + 1);
    if (r.session_id) {
      if (!daySessions.has(d)) daySessions.set(d, new Set());
      daySessions.get(d)!.add(r.session_id);
    }
  }
  // 최근 days 일의 날짜 축을 빈 날 포함해 생성 (KST 기준)
  const daily: DailyStat[] = [];
  const todayKst = new Date(Date.now() + KST_OFFSET_MS);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayKst.getTime() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    daily.push({
      date: d,
      pageviews: dayPV.get(d) ?? 0,
      sessions: daySessions.get(d)?.size ?? 0,
    });
  }

  return {
    totalPageviews: pageviews.length,
    totalSessions: sessionIds.size,
    totalClicks: clicks.length,
    sources,
    topPages,
    topClicks,
    daily,
  };
}

/** 유입 매체(medium) → 한글 라벨 + 색상 (admin 표시용) */
export const MEDIUM_META: Record<string, { label: string; color: string }> = {
  organic: { label: "검색", color: "#1E22B2" },
  social: { label: "소셜", color: "#E91E8C" },
  referral: { label: "추천 링크", color: "#0EA5E9" },
  direct: { label: "직접 유입", color: "#64748B" },
  internal: { label: "내부 이동", color: "#94A3B8" },
  campaign: { label: "캠페인", color: "#F59E0B" },
};

/** 유입 출처 코드 → 보기 좋은 이름 */
export function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    direct: "직접 유입",
    google: "Google",
    naver: "네이버",
    daum: "다음",
    bing: "Bing",
    instagram: "인스타그램",
    facebook: "페이스북",
    youtube: "유튜브",
    twitter: "X(트위터)",
    threads: "스레드",
    kakaostory: "카카오스토리",
    band: "밴드",
  };
  return map[source] ?? source;
}
