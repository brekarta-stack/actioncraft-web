/**
 * /studio 산출물 무결성 테스트 (node --test) — M1 릴리스 게이트.
 *   node --test tests/studio.test.mjs
 *
 * 검증: index.json 항목마다 공개 자산(thumb/glb/meta/preview SVG)이 실재하고,
 * 미리보기 SVG 에 워터마크가 구워져 있으며, PDF 는 public 이 아닌 비공개 폴더에만 있다.
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "..");
const idx = JSON.parse(
  readFileSync(path.join(ROOT, "public", "studio", "v2.15.0", "index.json"), "utf-8"),
);
const VER = idx.engine;
const pub = (skey, f) => path.join(ROOT, "public", "studio", VER, skey, f);
const prv = (skey, f) => path.join(ROOT, "content-private", "studio", VER, skey, f);

test("index.json: 항목 수(큐레이션 20 이상)와 필수 필드", () => {
  assert.ok(idx.items.length >= 20, `items ${idx.items.length} < 20`);
  for (const it of idx.items) {
    for (const field of ["key", "skey", "name_ko", "category", "pieces", "pages",
                         "finished_mm", "stars", "est_minutes", "svg_sheets"]) {
      assert.ok(field in it, `${it.key ?? "?"}: ${field} 누락`);
    }
    assert.match(it.skey, /^[a-z0-9_]+$/, `skey 형식: ${it.skey}`);
  }
});

test("공개 자산 실재: thumb·glb·meta·preview SVG 전 장", () => {
  for (const it of idx.items) {
    for (const f of ["thumb.png", "model.glb", "meta.json"]) {
      assert.ok(existsSync(pub(it.skey, f)), `${it.skey}/${f} 없음`);
    }
    for (let n = 1; n <= it.svg_sheets; n++) {
      assert.ok(existsSync(pub(it.skey, `preview_p${n}.svg`)),
        `${it.skey}/preview_p${n}.svg 없음`);
    }
  }
});

test("미리보기 SVG 워터마크가 파일에 구워져 있음", () => {
  for (const it of idx.items) {
    const svg = readFileSync(pub(it.skey, "preview_p1.svg"), "utf-8");
    assert.ok(svg.includes("papercraft.kr 미리보기"), `${it.skey}: 워터마크 없음`);
  }
});

test("PDF 는 비공개 폴더에만 (public 유출 금지)", () => {
  for (const it of idx.items) {
    assert.ok(existsSync(prv(it.skey, "print.pdf")), `${it.skey}: 비공개 PDF 없음`);
    assert.ok(!existsSync(pub(it.skey, "print.pdf")),
      `${it.skey}: PDF 가 public 에 유출됨!`);
  }
});
