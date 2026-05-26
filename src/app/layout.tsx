import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXTAUTH_URL ?? "https://actioncraft.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Craft Engineering Studio | 페이퍼 모델 엔지니어링 전문 스튜디오",
    template: "%s | Craft Engineering Studio",
  },
  description:
    "창의적인 페이퍼토이, 팝업카드, 교구를 주문 제작합니다. 기업 굿즈, 이벤트 소품, 오토마타 전문 크리에이티브 스튜디오.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Craft Engineering Studio",
    title: "Craft Engineering Studio | 페이퍼 모델 엔지니어링 전문 스튜디오",
    description:
      "창의적인 페이퍼토이, 팝업카드, 교구를 주문 제작합니다. 기업 굿즈, 이벤트 소품, 오토마타 전문 크리에이티브 스튜디오.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craft Engineering Studio",
    description: "창의적인 페이퍼토이, 팝업카드, 교구를 주문 제작합니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
