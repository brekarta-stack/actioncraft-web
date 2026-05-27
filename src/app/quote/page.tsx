import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import { PAGE_META } from "@/lib/site";

export const metadata: Metadata = {
  title: PAGE_META.quote.title,
  description: PAGE_META.quote.description,
  alternates: { canonical: "/quote" },
  openGraph: {
    title: PAGE_META.quote.title,
    description: PAGE_META.quote.description,
    url: "/quote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_META.quote.title,
    description: PAGE_META.quote.description,
  },
};

export default function QuotePage() {
  return <QuoteForm />;
}
