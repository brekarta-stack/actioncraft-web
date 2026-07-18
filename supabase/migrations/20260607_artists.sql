-- ============================================================
-- artists 테이블 신설 (2026-06-07)
--
-- 회사소개 아티스트 섹션을 어드민에서 편집 가능하게 DB 화.
-- 아티스트 ↔ 작품 연결은 portfolio_items.tags 에 portfolio_tag 를
-- 붙이는 방식 (갤러리 /portfolio?tag= 필터 재사용).
--
-- 이 SQL 을 Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
-- ============================================================

CREATE TABLE IF NOT EXISTS artists (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  english_name  TEXT,
  role          TEXT NOT NULL DEFAULT '',
  photo         TEXT,
  bio           TEXT NOT NULL DEFAULT '',
  specialties   JSONB NOT NULL DEFAULT '[]'::jsonb,
  style_tags    JSONB NOT NULL DEFAULT '[]'::jsonb,
  career        JSONB NOT NULL DEFAULT '[]'::jsonb,
  portfolio_tag TEXT NOT NULL,
  links         JSONB NOT NULL DEFAULT '[]'::jsonb,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: 서비스 키(supabaseAdmin)로만 접근하므로 켜두고 정책 없음 = 외부 차단
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- 초기 시드 — 코드의 SEED_ARTISTS 와 동일 (이미 있으면 건너뜀)
INSERT INTO artists (id, name, english_name, role, bio, specialties, style_tags, career, portfolio_tag, published, sort_order) VALUES
  (
    'artist-01', '아티스트 01', 'Paper Engineer', '페이퍼 엔지니어 · 지기구조 설계',
    '지기구조 설계 특허를 기반으로 움직이는 종이 구조를 설계합니다. 탄성력·기어·크랭크 등 메커니즘을 활용한 액션 페이퍼 토이가 주 분야입니다.',
    '["지기구조 설계","액션 메커니즘","전개도 최적화"]'::jsonb,
    '["리얼리즘","구조 중심"]'::jsonb,
    '["지기구조 설계 특허 참여","관공서·기업 납품 다수"]'::jsonb,
    '아티스트 01', TRUE, 1
  ),
  (
    'artist-02', '아티스트 02', 'Character Designer', '일러스트레이터 · 캐릭터 디자인',
    '기관·기업의 캐릭터 IP 를 입체로 옮기는 캐릭터라이즈 작업을 담당합니다. 원안의 인상을 최대한 살리는 면 분할과 색 설계가 강점입니다.',
    '["캐릭터라이즈","면 분할 디자인","브랜드 컬러 설계"]'::jsonb,
    '["캐릭터라이즈","키즈 친화"]'::jsonb,
    '["지자체 캐릭터 페이퍼토이 다수","박물관 체험존 교구 디자인"]'::jsonb,
    '아티스트 02', TRUE, 2
  ),
  (
    'artist-03', '아티스트 03', 'Popup Structure Designer', '팝업 스트럭처 디자이너',
    '펼치는 순간 완성되는 다층 팝업 구조를 설계합니다. 카드·북·전시 연출물까지 종이가 만드는 극적인 순간을 디자인합니다.',
    '["다층 팝업 구조","팝업북 제본 설계","전시 연출물"]'::jsonb,
    '["팝업","정교한 구조"]'::jsonb,
    '["기업 프로모션 팝업북 다수","백화점 전시 연출물 제작"]'::jsonb,
    '아티스트 03', TRUE, 3
  )
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE 'artists 테이블 생성 + 시드 3명 완료 — 어드민 > 아티스트에서 편집하세요';
END $$;
