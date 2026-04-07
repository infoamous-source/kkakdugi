import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { detectNaverCallback, exchangeNaverCode } from '../lib/naverOAuth';
import { Loader2 } from 'lucide-react';
import KkakdugiCharacter from '../components/brand/KkakdugiCharacter';

/**
 * OAuth 소셜 로그인 콜백 처리 페이지
 * /auth/callback 으로 리다이렉트되면:
 * - 카카오/구글: Supabase PKCE flow로 code → session 교환
 * - 네이버: Edge Function 호출 → OTP verifyOtp로 세션 생성
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          return;
        }

        // 네이버 OAuth 콜백 감지 (sessionStorage의 state 토큰으로 판별)
        const naverCallback = detectNaverCallback();
        if (naverCallback) {
          await handleNaverCallback(naverCallback.code);
          return;
        }

        // 카카오/구글: Supabase PKCE flow
        const code = url.searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError.message);
            setError(exchangeError.message);
            return;
          }
        }

        // 세션 확인 후 role별 리다이렉트
        await redirectByRole();
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    }

    async function handleNaverCallback(code: string) {
      // Edge Function으로 네이버 코드 교환
      const result = await exchangeNaverCode(code);

      if (!result.success || !result.email || !result.token_hash) {
        setError(result.error || '네이버 로그인에 실패했습니다.');
        return;
      }

      // OTP 토큰으로 Supabase 세션 생성
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: result.email,
        token_hash: result.token_hash,
        type: 'magiclink',
      });

      if (verifyError) {
        console.error('Naver OTP verify error:', verifyError.message);
        setError('네이버 로그인 세션 생성에 실패했습니다.');
        return;
      }

      await redirectByRole();
    }

    async function redirectByRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('세션을 생성할 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const role = profile?.role;
      if (role === 'ceo') {
        navigate('/ceo', { replace: true });
      } else if (role === 'instructor') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kk-bg to-kk-cream flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <KkakdugiCharacter size="half" />
          <div className="mt-4 bg-white rounded-2xl border-2 border-red-200 px-8 py-5 shadow-lg">
            <p className="text-lg font-bold text-red-600 mb-2">
              로그인 실패 (Login Failed)
            </p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-6 py-2 bg-kk-red text-white rounded-xl hover:bg-kk-red-deep transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-kk-bg to-kk-cream flex items-center justify-center px-4">
      <div className="text-center">
        <KkakdugiCharacter size="half" animated />
        <div className="mt-4 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-kk-red" />
          <p className="text-lg font-semibold text-kk-brown">
            로그인 처리 중... (Processing login...)
          </p>
        </div>
      </div>
    </div>
  );
}
