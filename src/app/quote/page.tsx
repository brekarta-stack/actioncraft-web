import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "자동 견적 | Craft Engineering Studio",
  description: "페이퍼토이, 팝업카드, 교구 등 원하는 제품의 맞춤 견적을 받아보세요.",
};

export default function QuotePage() {
  return <QuoteForm />;
}
