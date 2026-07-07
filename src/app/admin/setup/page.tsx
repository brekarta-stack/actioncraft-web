"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";

const TABLES = ["portfolio_items", "posts", "quotes", "analytics_events", "studio_reviews"] as const;

// studio_reviews 는 id 컬럼이 없고 skey 가 PK → 테이블별 존재 확인용 컬럼 매핑
const PROBE_COL: Record<string, string> = { studio_reviews: "skey" };

async function checkTable(name: string): Promise<"ok" | "missing" | "error"> {
  try {
    const { error } = await supabaseAdmin.from(name).select(PROBE_COL[name] ?? "id").limit(1);
    if (!error) return "ok";
    // PostgREST "relation does not exist" 류 오류
    if (
      error.message.includes("does not exist") ||
      error.message.includes("schema cache") ||
      error.code === "PGRST204" ||
      error.code === "42P01"
    )
      return "missing";
    return "error";
  } catch {
    return "error";
  }
}

export default async function SetupPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const results = await Promise.all(
    TABLES.map(async (t) => ({ name: t, status: await checkTable(t) }))
  );

  const allOk = results.every((r) => r.status === "ok");

  // schema.sql 내용 읽기
  let sql = "";
  try {
    sql = readFileSync(
      path.join(process.cwd(), "supabase", "schema.sql"),
      "utf-8"
    );
  } catch {
    sql = "-- schema.sql 파일을 읽을 수 없습니다.";
  }

  const statusLabel = (s: string) => {
    if (s === "ok")      return { text: "✅ 정상", cls: "text-green-600 bg-green-50 border-green-200" };
    if (s === "missing") return { text: "❌ 없음", cls: "text-red-600 bg-red-50 border-red-200" };
    return               { text: "⚠️ 오류",  cls: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">DB 셋업</h1>
        <p className="text-slate-500 text-sm mt-0.5">Supabase 테이블 상태 확인</p>
      </div>

      {/* 테이블 상태 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">테이블 상태</h2>
        <div className="space-y-3">
          {results.map(({ name, status }) => {
            const lbl = statusLabel(status);
            return (
              <div key={name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <code className="text-sm font-mono text-slate-700">{name}</code>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${lbl.cls}`}>
                  {lbl.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {allOk ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-green-800">모든 테이블이 정상입니다!</p>
          <Link href="/admin" className="inline-block mt-4 text-sm text-green-700 underline">
            어드민으로 돌아가기
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <p className="font-bold text-amber-800 mb-1">❌ 없음 표시된 테이블을 생성해야 합니다</p>
            <p className="text-sm text-amber-700">
              아래 SQL을 복사해서{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Supabase 대시보드
              </a>
              {" "}→ <strong>SQL Editor</strong> → <strong>New Query</strong>에 붙여넣고 <strong>Run</strong>을 클릭하세요.
            </p>
          </div>

          {/* SQL 코드 블록 */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">supabase/schema.sql</span>
              <span className="text-xs text-slate-500">복사하여 Supabase SQL Editor에 붙여넣기</span>
            </div>
            <pre className="p-4 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {sql}
            </pre>
          </div>

          {/* Supabase 링크 */}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #3ECF8E, #1B7F4F)" }}
          >
            Supabase SQL Editor 열기 →
          </a>

          <p className="text-xs text-slate-400 text-center mt-4">
            실행 후 이 페이지를 새로고침하면 상태가 업데이트됩니다.
          </p>
        </>
      )}
    </div>
  );
}
