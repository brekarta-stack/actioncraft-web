export const CATEGORIES = ["팝업북", "페이퍼 크래프트", "액션 크래프트", "우드락", "기타"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface PortfolioItem {
  id: string;
  airtableId?: string;
  title: string;
  category: Category;
  description: string;
  client: string;
  images: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
