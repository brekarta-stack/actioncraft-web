/**
 * Supabase Admin Client (서버 전용)
 *
 * Service Role Key를 사용하므로 RLS를 우회합니다.
 * API Routes / Server Actions 등 서버 사이드 쓰기 작업에만 사용하세요.
 * 클라이언트 컴포넌트에서 절대 import하지 마세요.
 */
import { createClient } from "@supabase/supabase-js";

// SUPABASE_SERVICE_ROLE_KEY가 없으면 anon key로 fallback (개발 환경 호환)
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  key,
  {
    auth: {
      // 서비스 롤 키는 세션 관리 불필요
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
