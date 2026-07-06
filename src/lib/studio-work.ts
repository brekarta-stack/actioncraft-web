/**
 * 업로드 전개(웹 M3) 서버 헬퍼 — Supabase Storage 를 잡 큐로 쓴다.
 *
 * 설계(로드맵 §5-3): 실계산은 mini 워커가 하되, 가정망에 아무 포트도 열지
 * 않는다. 워커는 아웃바운드로 /api/studio/worker/* 만 폴링하고, 파일은
 * 서명 URL 로 직접 오간다(요청 4.5MB 한도 우회). 버킷은 비공개이며 브라우저
 * 는 항상 이 서버의 프록시 라우트를 거친다.
 *
 * 레이아웃(버킷 studio-work):
 *   queue/<id>.json      대기 잡 (업로드 라우트가 생성)
 *   running/<id>.json    워커가 클레임한 잡 (+claimed_at)
 *   uploads/<id>/<file>  업로드 원본 (완료 시 삭제)
 *   results/<id>/…       status.json + 산출물 (7일 보관)
 *   cache/<sha>-<d>-<p>.json  동일 입력 재사용 포인터
 *   ratelimit/<날짜>/<iphash>.json  IP별 일일 카운터
 */

import { createHash, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabase-admin";

export const BUCKET = "studio-work";

export interface StudioJob {
  id: string;
  file: string;
  detail: number;
  paper: string;
  size: number;
  hash: string;
  ip: string;
  created_at: string;
  claimed_at?: string;
}

let bucketReady = false;
export async function ensureBucket() {
  if (bucketReady) return;
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    // 존재하지 않을 때만 생성 — 비공개(모든 접근은 service role 경유)
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, { public: false });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketReady = true;
}

export const store = () => supabaseAdmin.storage.from(BUCKET);

export async function getJson<T>(path: string): Promise<T | null> {
  const { data, error } = await store().download(path);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return null;
  }
}

export async function putJson(path: string, value: unknown) {
  const body = Buffer.from(JSON.stringify(value));
  const { error } = await store().upload(path, body, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) throw new Error(`storage put ${path}: ${error.message}`);
}

/** 워커 인증 — 전용 시크릿이 없으면 기존 블로그 발행 시크릿을 재사용(둘 다 mini·Vercel 에 존재). */
export function workerSecretOk(header: string | null): boolean {
  const secret = process.env.STUDIO_WORKER_SECRET || process.env.BLOG_PUBLISH_SECRET || "";
  if (!secret || !header) return false;
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

/** 개인정보를 남기지 않도록 IP 는 시크릿 솔트로 해시한 앞 16자만 저장. */
export function ipHash(req: Request): string {
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const salt = process.env.STUDIO_WORKER_SECRET || process.env.BLOG_PUBLISH_SECRET || "pc";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

export function cacheKey(hash: string, detail: number, paper: string) {
  return `cache/${hash}-${detail}-${paper}.json`;
}

/** queue/ 목록 (오래된 순). Storage list 는 폴더 단위라 한 번이면 된다. */
export async function listQueue(limit = 100) {
  const { data, error } = await store().list("queue", {
    limit,
    sortBy: { column: "created_at", order: "asc" },
  });
  if (error) return [];
  return (data ?? []).filter((e) => e.name.endsWith(".json"));
}
