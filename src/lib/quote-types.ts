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
  createdAt: string;
}
