/**
 * 네이버 OAuth 유틸리티
 * Supabase에서 네이버를 네이티브 지원하지 않으므로 수동 OAuth 플로우 구현
 */

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';

/**
 * 네이버 OAuth 인증 페이지로 리다이렉트
 */
export function redirectToNaverLogin(): void {
  if (!NAVER_CLIENT_ID) {
    throw new Error('VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.');
  }

  const redirectUri = `${window.location.origin}/auth/callback`;

  // CSRF 방지용 state 토큰 생성
  const state = crypto.randomUUID();
  sessionStorage.setItem('naver_oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: NAVER_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
  });

  window.location.href = `${NAVER_AUTH_URL}?${params.toString()}`;
}

/**
 * 콜백 URL에서 네이버 OAuth 파라미터 감지
 */
export function detectNaverCallback(): { code: string; state: string } | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) return null;

  // Supabase 네이티브 OAuth 콜백과 구분: state가 sessionStorage에 저장된 값과 일치하면 네이버
  const savedState = sessionStorage.getItem('naver_oauth_state');
  if (savedState !== state) return null;

  // state 토큰 사용 후 삭제
  sessionStorage.removeItem('naver_oauth_state');
  return { code, state };
}

/**
 * Edge Function을 호출하여 네이버 코드를 세션으로 교환
 */
export async function exchangeNaverCode(code: string): Promise<{
  success: boolean;
  email?: string;
  token_hash?: string;
  is_new_user?: boolean;
  error?: string;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL이 설정되지 않았습니다.');
  }

  const redirectUri = `${window.location.origin}/auth/callback`;

  const res = await fetch(`${supabaseUrl}/functions/v1/naver-auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.error || '네이버 로그인 처리 실패' };
  }

  return data;
}
