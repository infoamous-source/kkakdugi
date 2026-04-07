import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 환경변수가 없으면 더미 클라이언트 생성 (오프라인 모드)
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] 환경변수가 설정되지 않았습니다. 오프라인 모드로 동작합니다.\n' +
    '로그인/회원가입 등 서버 기능은 사용할 수 없습니다.\n' +
    'VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env.local에 설정하세요.'
  );
}

// NOTE: placeholder URL은 실제 요청을 보내지 않도록 localhost 사용
// 사용처에서 isSupabaseConfigured 체크 필수
export const supabase = createClient(
  supabaseUrl || 'http://localhost:0',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
