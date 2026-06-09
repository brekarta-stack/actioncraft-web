/** 광고 유입정보 — 세션 첫 진입의 gclid/UTM (instrumentation-client.ts 가 수집). 견적 제출에 첨부 */
export interface QuoteAcquisition {
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  /** Google Ads 클릭 ID — 구글 오프라인 전환 임포트의 키 */
  gclid: string;
  /** UTM 미설정 광고 클릭 힌트 'google' | 'naver' | '' */
  adHint: string;
}

export interface QuoteSubmission {
  id: string;
  product: string;
  quantity: string;
  deliveryDate: string;
  purpose: string;
  customDesign: string;
  /** 디자인 스타일 — 리얼리즘 / 캐릭터라이즈 / 전문가 위임 */
  styleType: string;
  /** 제품에 삽입할 문구 (회사명·슬로건 등) */
  productText: string;
  colorRequest: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  fileName: string;
  /** 회사 로고 파일명 (선택) */
  logoFileName: string;
  /** 샘플링 희망 — B2B 기업 주문 시 필수 */
  sampling: boolean;
  /** 최대한 빠르게 제작 (납품 희망일 대체) */
  rushed: boolean;
  /** 포장 방식 — paper-box / opp / bulk */
  packaging: string;
  /** 광고 유입정보 (gclid·UTM) — 전환 측정/오프라인 임포트용. 마이그레이션 적용 전이면 저장 생략 */
  acquisition?: QuoteAcquisition | null;
  createdAt: string;
}
