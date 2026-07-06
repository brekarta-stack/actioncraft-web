/**
 * 업로드 전개(M3) 헬퍼 계약 테스트 — node --test tests/studio-upload.test.mjs
 * 라우트가 공유하는 순수 규칙(파일명 화이트리스트·안전화·형식 제한)이
 * 보안 경계이므로 여기서 못 박는다.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  JOB_ID_RE,
  MAX_UPLOAD_BYTES,
  RESULT_NAME_RE,
  UPLOAD_EXTS,
  contentTypeFor,
  resultFileNames,
  sanitizeUploadName,
} from "../src/lib/studio-work-shared.mjs";

test("결과 파일명 화이트리스트 — 허용 목록만 통과", () => {
  for (const ok of ["meta.json", "net.json", "model.glb", "print.pdf",
                    "preview_p1.svg", "sheet_p12.svg"]) {
    assert.ok(RESULT_NAME_RE.test(ok), `${ok} 는 허용되어야 함`);
  }
  for (const bad of ["../secret", "status.json", "a.svg", "preview_p.svg",
                     "sheet_p123.svg", "print.pdf.exe", "queue/x.json",
                     "preview_p1.svg/../../x", "model.gltf"]) {
    assert.ok(!RESULT_NAME_RE.test(bad), `${bad} 는 거부되어야 함`);
  }
});

test("업로드 파일명 안전화 — 경로조작·특수문자 제거, 형식 제한", () => {
  assert.equal(sanitizeUploadName("내 강아지.stl"), "내 강아지.stl");
  assert.equal(sanitizeUploadName("../../etc/passwd.stl"), "etcpasswd.stl");
  assert.equal(sanitizeUploadName("model.STL"), "model.stl");
  assert.equal(sanitizeUploadName("<script>.glb"), "script.glb");
  assert.equal(sanitizeUploadName("...obj"), "model.obj");
  assert.equal(sanitizeUploadName("hack.exe"), null);
  assert.equal(sanitizeUploadName("no-extension"), null);
  assert.equal(sanitizeUploadName("a".repeat(99) + ".stl"), "a".repeat(40) + ".stl");
  for (const ext of UPLOAD_EXTS) {
    assert.ok(sanitizeUploadName(`x${ext}`), `${ext} 는 받아야 함`);
  }
});

test("잡 ID 형식 — UUID 만", () => {
  assert.ok(JOB_ID_RE.test("123e4567-e89b-42d3-a456-426614174000"));
  assert.ok(!JOB_ID_RE.test("../results"));
  assert.ok(!JOB_ID_RE.test("123E4567-E89B-42D3-A456-426614174000")); // 소문자만
  assert.ok(!JOB_ID_RE.test("short"));
});

test("콘텐츠 타입 매핑과 결과 목록 구성", () => {
  assert.equal(contentTypeFor("model.glb"), "model/gltf-binary");
  assert.equal(contentTypeFor("print.pdf"), "application/pdf");
  assert.equal(contentTypeFor("sheet_p1.svg"), "image/svg+xml");
  assert.equal(contentTypeFor("meta.json"), "application/json");
  const files = resultFileNames(2);
  assert.deepEqual(files, ["meta.json", "net.json", "model.glb", "print.pdf",
                           "preview_p1.svg", "sheet_p1.svg",
                           "preview_p2.svg", "sheet_p2.svg"]);
  for (const f of files) assert.ok(RESULT_NAME_RE.test(f), `${f} 화이트리스트 통과`);
  assert.ok(MAX_UPLOAD_BYTES <= 4.5 * 1024 * 1024, "Vercel 요청 한도 안쪽");
});
