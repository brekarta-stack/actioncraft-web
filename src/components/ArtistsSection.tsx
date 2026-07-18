/**
 * 회사소개 — 아티스트 섹션 (Server Component)
 *
 * 컨셉: PE Studio 로 수주된 프로젝트를 실제로 작업하는 아티스트들을 소개해
 * 서비스 제공자의 신뢰도를 높인다. 각 카드의 "작품 스타일 보기"는
 * /portfolio?tag={portfolioTag} 로 연결되어 해당 아티스트 태그가 붙은
 * 작품만 필터된 갤러리를 보여준다.
 */

import Link from "next/link";
import { getPublishedArtists, type Artist } from "@/lib/artists";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { CheckIcon, ArrowRightIcon } from "@/components/icons";

/** 이니셜 아바타 배경 — 아티스트별 브랜드 컬러 로테이션 */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #06C6C8, #1E22B2)",
  "linear-gradient(135deg, #E91E8C, #F5C518)",
  "linear-gradient(135deg, #1E22B2, #E91E8C)",
  "linear-gradient(135deg, #F5C518, #06C6C8)",
];

function ArtistCard({ artist, index }: { artist: Artist; index: number }) {
  const portfolioHref = `/portfolio?tag=${encodeURIComponent(artist.portfolioTag)}`;

  return (
    <div className="pe-paper-lift bg-white rounded-2xl border border-slate-100 pe-paper-shadow overflow-hidden flex flex-col">
      {/* ── 프로필 이미지 (중심 요소) ── */}
      <div className="aspect-square relative overflow-hidden bg-slate-50">
        {artist.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.photo}
            alt={`${artist.name} 프로필 사진`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          /* 사진 없을 때 — 이니셜 아바타 */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-white"
            style={{ background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] }}
            aria-hidden
          >
            <span className="text-6xl font-extrabold opacity-90">{artist.name.charAt(0)}</span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-widest opacity-70">
              {artist.englishName ?? "Artist"}
            </span>
          </div>
        )}
        {/* 스타일 태그 — 이미지 하단 오버레이 */}
        {artist.styleTags.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-3 flex flex-wrap gap-1.5 justify-center"
            style={{ background: "linear-gradient(to top, rgba(15,23,42,0.55), transparent)" }}
          >
            {artist.styleTags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/90 text-slate-800 font-semibold backdrop-blur-sm"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 정보 ── */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {artist.name}
            {artist.englishName && (
              <span className="ml-2 text-xs font-medium text-slate-400">{artist.englishName}</span>
            )}
          </h3>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#1E22B2", wordBreak: "keep-all" }}>
            {artist.role}
          </p>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4" style={{ wordBreak: "keep-all" }}>
          {artist.bio}
        </p>

        {/* 전문 영역 */}
        <ul className="space-y-1.5 mb-4">
          {artist.specialties.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckIcon size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#06C6C8" }} />
              <span style={{ wordBreak: "keep-all" }}>{s}</span>
            </li>
          ))}
        </ul>

        {/* 주요 이력 */}
        {artist.career && artist.career.length > 0 && (
          <div className="mb-4 pb-4 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-400 mb-1.5">주요 이력</div>
            <ul className="space-y-1">
              {artist.career.slice(0, 3).map((c) => (
                <li key={c} className="text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>
                  · {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 외부 링크 */}
        {artist.links && artist.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {artist.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-[#1E22B2] hover:text-[#1E22B2] transition-colors"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        {/* 작품 필터 링크 — 갤러리에서 이 아티스트 태그로 필터 */}
        <Link
          href={portfolioHref}
          className="group/btn mt-auto inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg border-2 transition-colors"
          style={{ borderColor: "#1E22B2", color: "#1E22B2" }}
        >
          이 아티스트 작품 보기
          <ArrowRightIcon size={15} className="transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

/** Schema.org Person JSON-LD — 아티스트 신뢰도 SEO */
function ArtistsJsonLd({ artists }: { artists: Artist[] }) {
  const data = artists.map((a) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: a.name,
    ...(a.englishName ? { alternateName: a.englishName } : {}),
    jobTitle: a.role,
    description: a.bio,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(a.photo ? { image: a.photo } : {}),
    knowsAbout: [...a.specialties, ...a.styleTags],
  }));
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ArtistsSection() {
  const artists = getPublishedArtists();
  if (artists.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <ArtistsJsonLd artists={artists} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#06C6C8" }}>
            Makers
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            작업을 맡는 아티스트
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto" style={{ wordBreak: "keep-all" }}>
            PE Studio 로 접수된 프로젝트는 각 분야 전문 아티스트가 직접 설계하고 만듭니다.
            카드의 &lsquo;작품 보기&rsquo;에서 아티스트별 작업 스타일을 확인해 보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
