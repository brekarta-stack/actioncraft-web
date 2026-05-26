import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#1E22B2" }} className="text-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs tracking-tight">CES</span>
              </div>
              <span className="font-bold text-white text-lg">Craft Engineering Studio</span>
            </div>
            <p className="text-sm leading-relaxed text-blue-200">
              창의적 발상으로 종이가 줄 수 있는
              <br />
              최고의 가치를 만들어냅니다.
            </p>
            <p className="text-xs mt-4 text-blue-300">
              크리에이티브 페이퍼토이 전문 스튜디오
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/about", label: "회사소개" },
                { href: "/products", label: "제품 종류" },
                { href: "/portfolio", label: "제작 사례" },
                { href: "/quote", label: "자동 견적" },
                { href: "/blog", label: "블로그" },
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
                <span>hello@actioncraft.co.kr</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>02-000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>서울특별시</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-blue-300">
          <p>© 2024 Craft Engineering Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="#" className="hover:text-white transition-colors">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
