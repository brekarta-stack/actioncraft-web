import { ImageResponse } from "next/og";

/**
 * 사이트 공통 OG 이미지 (1200×630).
 * app/opengraph-image 파일은 Next가 자동으로 모든 하위 라우트의
 * og:image / twitter:image 메타로 연결한다 (개별 페이지가 재정의하지 않는 한).
 *
 * Satori 기본 폰트(라틴)만 사용하므로 별도 폰트 임베드 불필요 →
 * 브랜드 영문 표기로 구성. (한글 임베드는 woff2 미지원으로 회피)
 */
export const alt = "PE Studio — Paper Engineering Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1E22B2 0%, #171AB0 60%, #0F1280 100%)",
          color: "white",
          position: "relative",
        }}
      >
        {/* 우상단 종이접기 모티프 */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-40px",
            width: "420px",
            height: "420px",
            display: "flex",
          }}
        >
          <svg width="420" height="420" viewBox="0 0 200 200" fill="none">
            <path d="M40 60 L100 20 L160 60 L160 140 L100 180 L40 140 Z" fill="#06C6C8" opacity="0.18" />
            <path d="M100 20 L160 60 L100 100 L40 60 Z" fill="#F5C518" opacity="0.22" />
            <path d="M100 100 L160 60 L160 140 L100 180 Z" fill="#E91E8C" opacity="0.16" />
          </svg>
        </div>

        {/* 작은 라벨 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "26px",
            fontWeight: 600,
            color: "#9CA3FF",
            marginBottom: "28px",
          }}
        >
          <div style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#F5C518", display: "flex" }} />
          papercraft.kr
        </div>

        {/* 메인 타이틀 */}
        <div style={{ display: "flex", fontSize: "104px", fontWeight: 800, letterSpacing: "-3px", lineHeight: 1 }}>
          PE Studio
        </div>

        {/* 서브 타이틀 */}
        <div style={{ display: "flex", fontSize: "44px", fontWeight: 700, marginTop: "16px", color: "#E8EAFF" }}>
          Paper Engineering Studio
        </div>

        {/* 태그라인 */}
        <div style={{ display: "flex", fontSize: "30px", marginTop: "28px", color: "#9CA3FF" }}>
          Korea&apos;s Only Paper Engineering Studio
        </div>
      </div>
    ),
    { ...size }
  );
}
