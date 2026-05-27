import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, COMPANY, PAGE_META } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // default 는 root 페이지에서 metadata 미지정 시 fallback
    default: `${SITE_NAME} | ${PAGE_META.home.title}`,
    // 하위 페이지 metadata.title (string) 에 자동으로 ` | CES` suffix 부여
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "페이퍼 엔지니어링",
    "페이퍼 엔지니어링 스튜디오",
    "Paper Engineering",
    "Paper Engineering Studio",
    "PE Studio",
    "페이퍼토이 제작",
    "페이퍼토이 외주",
    "페이퍼토이 업체",
    "페이퍼토이 주문제작",
    "기업 굿즈 종이",
    "지자체 캐릭터 굿즈",
    "STEAM 교구",
    "팝업카드 제작",
    "오토마타 제작",
    "현대백화점 페이퍼토이",
    "KAIST 페이퍼토이",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${PAGE_META.home.title}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${PAGE_META.home.title}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    // TODO: Google Search Console / Naver Webmaster Tools 인증 코드 (사용자 입력 필요)
    // google: "google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    // other: { "naver-site-verification": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  },
};

/**
 * 사이트 전체 공통 Organization JSON-LD.
 * Schema.org Organization 으로 회사의 정체성을 검색엔진에 직접 알림.
 */
function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    alternateName: COMPANY.shortName,
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    description: SITE_DESCRIPTION,
    foundingDate: COMPANY.foundingYear,
    email: COMPANY.email,
    ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      addressCountry: COMPANY.address.country,
      ...(COMPANY.address.streetAddress
        ? { streetAddress: COMPANY.address.streetAddress }
        : {}),
    },
    sameAs: [
      COMPANY.social.instagram,
      COMPANY.social.youtube,
      COMPANY.social.community,
    ].filter(Boolean),
    knowsAbout: [
      "페이퍼토이",
      "페이퍼 모델 엔지니어링",
      "오토마타",
      "팝업카드",
      "STEAM 교육",
      "캐릭터 굿즈",
      "BI/CI 디자인",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * WebSite JSON-LD (사이트 검색 sitelink 노출용).
 */
function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ko-KR",
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable}`}>
      <head>
        {/* Pretendard — 한글 가독성 최상위 폰트
            preconnect 로 CDN 핸드셰이크 미리 시작 + 비동기 로드 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
