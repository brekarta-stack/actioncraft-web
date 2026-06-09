"use client";

import type { QuoteAcquisition } from "./quote-types";

/**
 * 광고 유입정보(gclid·UTM)를 견적 제출에 첨부하기 위한 클라이언트 헬퍼.
 *
 * instrumentation-client.ts 가 세션 첫 진입 때 sessionStorage(키: "pc_acq")에
 * { referrer, utmSource, utmMedium, utmCampaign, gclid, adHint } 형태로 저장해 둔다.
 * 여기서는 그 값을 그대로 읽어 /api/quote 제출 본문에 실어 보낸다.
 *
 * ⚠️ 키 "pc_acq" 는 instrumentation-client.ts 의 ACQ_KEY 와 반드시 동일해야 한다.
 */
const ACQ_KEY = "pc_acq";

export function getStoredAcquisition(): QuoteAcquisition | null {
  try {
    const cached = sessionStorage.getItem(ACQ_KEY);
    if (!cached) return null;
    const a = JSON.parse(cached) as Partial<QuoteAcquisition>;
    const acq: QuoteAcquisition = {
      referrer: a.referrer ?? "",
      utmSource: a.utmSource ?? "",
      utmMedium: a.utmMedium ?? "",
      utmCampaign: a.utmCampaign ?? "",
      gclid: a.gclid ?? "",
      adHint: a.adHint ?? "",
    };
    // 유입정보가 전혀 없으면(순수 직접 유입) null — 불필요한 빈 객체 전송 방지
    return Object.values(acq).some((v) => v !== "") ? acq : null;
  } catch {
    return null;
  }
}
