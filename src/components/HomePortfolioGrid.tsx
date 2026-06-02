/**
 * 홈 페이지 "이런 걸 만듭니다" 섹션 — Server Component
 *
 * portfolio_items 에서 published = true 인 항목을 최신순으로 9개까지 표시.
 * 항목이 0개이면 기존 일러스트 fallback 으로 그라데이션 자리 유지.
 * 각 카드는 /portfolio/{slug} 상세 페이지로 연결.
 */

import Link from "next/link";
import { getItems } from "@/lib/portfolio";
import { deriveSlug, getImageAlt } from "@/lib/portfolio-meta";
import { PortfolioPlaceholder } from "@/components/paper-art";

// ISR — 새 사례 발행 시 5분 내 메인에도 반영
export const revalidate = 300;

interface PlaceholderClient {
  name: string;
  work: string;
  variant: "department" | "university" | "museum" | "city" | "character" | "generic";
}

const PLACEHOLDER_CLIENTS: PlaceholderClient[] = [
  { name: "현대백화점", work: "스마일리 페이퍼토이", variant: "department" },
  { name: "KAIST",       work: "캐릭터 납육이",       variant: "university" },
  { name: "경주박물관",  work: "캐릭터 도토리",       variant: "museum" },
  { name: "수원시",      work: "캐릭터 수원이",       variant: "city" },
  { name: "공주시",      work: "고마곰과 공주",       variant: "character" },
  { name: "국립기관",    work: "다수 관공서 납품",     variant: "generic" },
];

export default async function HomePortfolioGrid() {
  // 빌드 시 Supabase env 없거나 일시 에러면 빈 배열로 fallback
  const items = (await getItems().catch(() => []))
    .filter((i) => i.published)
    .slice(0, 9);

  // 실제 사례가 하나도 없으면 일러스트로 자리 유지 (현재 모양)
  if (items.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PLACEHOLDER_CLIENTS.map((c) => (
          <Link
            key={c.name}
            href="/portfolio"
            className="pe-paper-lift block aspect-[4/3]"
          >
            <PortfolioPlaceholder
              variant={c.variant}
              label={`${c.name} · ${c.work}`}
              className="w-full h-full"
            />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => {
        const slug = deriveSlug(item);
        const hero = item.images?.[0];
        const label = item.client
          ? `${item.client} · ${item.title}`
          : item.title;
        return (
          <Link
            key={item.id}
            href={`/portfolio/${slug}`}
            className="pe-paper-lift group block aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow relative"
            aria-label={`${label} — 상세 보기`}
          >
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero}
                alt={getImageAlt(item, 0)}
                loading="lazy"
                width={800}
                height={600}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <PortfolioPlaceholder
                variant="generic"
                label={label}
                className="w-full h-full"
              />
            )}
            {/* 카드 하단 라벨 (이미지 위 어두운 그라데이션) */}
            {hero && (
              <div
                className="absolute inset-x-0 bottom-0 p-3 text-white text-sm font-semibold"
                style={{
                  background:
                    "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)",
                }}
              >
                <span style={{ wordBreak: "keep-all" }}>{label}</span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
