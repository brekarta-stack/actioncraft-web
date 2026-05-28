/**
 * Supabase Admin Client (서버 전용)
 *
 * Service Role Key를 사용하므로 RLS를 우회합니다.
 * API Routes / Server Actions 등 서버 사이드 작업에만 사용하세요.
 * 클라이언트 컴포넌트에서 절대 import하지 마세요.
 */
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("[supabase-admin] SUPABASE_URL environment variable is required");
  }
  if (!key) {
    throw new Error(
      "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY environment variable is required. " +
        "Set it in your Vercel environment variables (never use the anon key here)."
    );
  }

  return createClient(url, key, {
    auth: {
      // 서비스 롤 키는 세션 관리 불필요
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// 모듈 초기화 시가 아닌 첫 사용 시 검증 (빌드 타임 static 생성 오류 방지)
let _client: ReturnType<typeof createAdminClient> | null = null;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createAdminClient>, {
  get(_target, prop) {
    if (!_client) _client = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
