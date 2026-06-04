import Link from "next/link";
import { COMPANY } from "@/lib/site";

export default function Footer() {
  return (
    <footer style={{ background: "#1E22B2" }} className="text-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden>
                <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
                  <path d="M6 4 H14 A6 6 0 0 1 14 16 H10 V24 H6 Z" fill="white" />
                  <path d="M14 4 L20 10 V24 H22 V8 L16 2 H14 Z" fill="white" opacity="0.55" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="font-bold text-white text-lg block">PE Studio</span>
                <span className="text-blue-300 text-xs">Paper Engineering Studio</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-blue-200" style={{ wordBreak: "keep-all" }}>
              국내 유일의 페이퍼 엔지니어링 스튜디오.
              <br />
              움직이는 종이로 브랜드를 살아 숨쉬게 합니다.
            </p>
            {COMPANY.representative && (
              <p className="text-xs mt-3 text-blue-300/70">
                대표 {COMPANY.representative}
              </p>
            )}
            {COMPANY.businessNumber && (
              <p className="text-xs mt-1 text-blue-300/70">
                통신판매업신고 {COMPANY.businessNumber}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "회사소개" },
                { href: "/products", label: "제품 종류" },
                { href: "/portfolio", label: "제작 사례" },
                { href: "/quote", label: "제작 문의" },
                { href: "/blog", label: "블로그" },
                { href: "/faq", label: "자주 묻는 질문" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">연락처</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-white transition-colors"
                >
                  {COMPANY.email}
                </a>
              </li>
              {COMPANY.phone && (
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a
                    href={`tel:${COMPANY.phone.replace(/-/g, "")}`}
                    className="hover:text-white transition-colors"
                  >
                    {COMPANY.phone}
                  </a>
                </li>
              )}
              {COMPANY.kakaoChannel && (
                <li className="flex items-center gap-2">
                  <span>💬</span>
                  <a
                    href={COMPANY.kakaoChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    카카오톡 채널 문의
                  </a>
                </li>
              )}
              {COMPANY.social.community && (
                <li className="flex items-center gap-2">
                  <span>🌐</span>
                  <a
                    href={COMPANY.social.community}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    커뮤니티 (finalpaper.net)
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>
                  {COMPANY.address.streetAddress
                    ? `${COMPANY.address.region} ${COMPANY.address.streetAddress}`
                    : COMPANY.address.region}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-blue-300">
          <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
