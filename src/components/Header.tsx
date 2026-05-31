"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/about", label: "회사소개" },
  { href: "/products", label: "제품" },
  { href: "/portfolio", label: "제작 사례" },
  { href: "/blog", label: "블로그" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Paper Engineering Studio 홈으로 이동">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: "#1E22B2" }}
              aria-hidden
            >
              {/* PE 모노그램 — 종이 접힘 형태 */}
              <svg viewBox="0 0 28 28" className="w-5 h-5" fill="none">
                <path d="M6 4 H14 A6 6 0 0 1 14 16 H10 V24 H6 Z" fill="white" />
                <path d="M14 4 L20 10 V24 H22 V8 L16 2 H14 Z" fill="white" opacity="0.55" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              PE Studio
              <span className="hidden lg:inline text-slate-400 font-medium text-sm ml-1.5">
                · Paper Engineering
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                style={pathname === link.href ? { background: "#1E22B2" } : {}}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center px-4 py-2 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #06C6C8, #1E22B2)" }}
            >
              견적 문의
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                style={pathname === link.href ? { background: "#1E22B2" } : {}}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 text-center mt-2"
              style={{ background: "linear-gradient(135deg, #06C6C8, #1E22B2)" }}
            >
              견적 문의
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
