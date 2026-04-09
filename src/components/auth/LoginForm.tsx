import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { SocialProvider } from '../../contexts/AuthContext';
import KkakdugiCharacter from '../brand/KkakdugiCharacter';

// 소셜 로그인 활성화 플래그 — Supabase OAuth provider가 enable되어 있을 때만 true로
// VITE_ENABLE_SOCIAL_LOGIN=true 설정 시 카카오/구글 버튼 노출
// 2026-04-09: D-1 런칭 — Supabase OAuth 미설정 상태라 기본 false
const SOCIAL_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true';

interface LocationState {
  redirectTo?: string;
}

const ENCOURAGEMENTS = [
  '오늘도 파이팅!',
  '깍두기와 함께 성장하자!',
  '한 걸음씩 나아가요!',
  '멋진 하루 보내세요!',
  '배움의 즐거움을 함께!',
];

export default function LoginForm() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loginWithSocial, user } = useAuth();

  const isInstructorMode = searchParams.get('role') === 'instructor';
  const redirectTo = (location.state as LocationState)?.redirectTo || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // P0-5: 공용 기기 환경 기본값 — 학생은 자동 로그인 OFF, 선생님만 ON
  const [rememberMe, setRememberMe] = useState(isInstructorMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);

  // 응원문구 / 환영문구 팝업
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // 이미 로그인된 상태면 리다이렉트
  useEffect(() => {
    if (user) {
      if (user.role === 'instructor') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'ceo') {
        navigate('/ceo', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password, rememberMe);
      if (!success) {
        setError(t('auth.loginError'));
        setIsLoading(false);
        return;
      }

      // login 성공 후 user 정보 가져오기 (AuthContext에서 갱신)
      // 잠시 대기하여 AuthContext가 user를 업데이트할 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 300));

      // Supabase에서 role 확인
      const { data: { user: authUser } } = await (await import('../../lib/supabase')).supabase.auth.getUser();
      if (!authUser) {
        setError(t('auth.loginError'));
        setIsLoading(false);
        return;
      }

      // profile에서 role 확인
      const { data: profile } = await (await import('../../lib/supabase')).supabase
        .from('profiles')
        .select('role, name')
        .eq('id', authUser.id)
        .single();

      const role = profile?.role;
      const name = profile?.name || '';

      if (isInstructorMode) {
        // 선생님 모드에서 학생 계정 시도
        if (role !== 'instructor' && role !== 'ceo') {
          setError('선생님 계정이 아닙니다. 학생 로그인을 이용해주세요.');
          setIsLoading(false);
          return;
        }
        // 선생님/CEO 환영문구
        setWelcomeMessage(`${name} ${role === 'ceo' ? 'CEO' : '선생'}님 환영합니다!`);
        setShowWelcome(true);
        setTimeout(() => {
          navigate(role === 'ceo' ? '/ceo' : '/admin', { replace: true });
        }, 1800);
      } else {
        // 학생 모드에서 선생님/CEO 계정 시도
        if (role === 'instructor' || role === 'ceo') {
          setError('학생 로그인에서는 선생님/CEO 계정을 사용할 수 없습니다. 하단의 "선생님 로그인"을 이용해주세요.');
          setIsLoading(false);
          return;
        }
        // 학생 응원문구
        const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        setWelcomeMessage(msg);
        setShowWelcome(true);
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1800);
      }
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setError('');
    setSocialLoading(provider);
    try {
      await loginWithSocial(provider);
      // 브라우저가 OAuth 페이지로 리다이렉트되므로 여기서는 loading 상태 유지
    } catch {
      setError(
        provider === 'kakao'
          ? '카카오 로그인에 실패했습니다. 다시 시도해주세요.'
          : '구글 로그인에 실패했습니다. 다시 시도해주세요.',
      );
      setSocialLoading(null);
    }
  };

  // 응원문구 팝업 오버레이
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kk-bg to-kk-cream flex items-center justify-center px-4">
        <div className="text-center animate-[fadeIn_0.3s_ease-out]">
          <KkakdugiCharacter size="half" animated />
          <div className="mt-4 bg-white rounded-2xl border-2 border-kk-warm px-8 py-5 shadow-lg">
            <p className="text-xl font-bold text-kk-brown">{welcomeMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-kk-bg to-kk-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
            isInstructorMode
              ? 'bg-gradient-to-br from-kk-brown to-kk-brown/80'
              : 'bg-gradient-to-br from-kk-red to-kk-red-deep'
          }`}>
            {isInstructorMode ? (
              <GraduationCap className="w-8 h-8 text-white" />
            ) : (
              <LogIn className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isInstructorMode ? '선생님 로그인' : t('auth.loginTitle')}
          </h1>
          <p className="text-gray-500 mt-2">
            {isInstructorMode ? '선생님 전용 로그인입니다' : t('auth.loginSubtitle')}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* 자동 로그인 체크박스 — P0-5: 공용 기기 환경이라 학생 모드에서는 숨김 */}
            {isInstructorMode && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 text-kk-red border-gray-300 rounded focus:ring-kk-red cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                  {t('auth.rememberMe')}
                </label>
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 min-h-[48px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-white text-base ${
                isInstructorMode
                  ? 'bg-kk-brown hover:bg-kk-brown/90 disabled:bg-kk-brown/50'
                  : 'bg-kk-red hover:bg-kk-red-deep disabled:bg-kk-peach'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isInstructorMode ? <GraduationCap className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isInstructorMode ? '선생님 로그인' : t('auth.loginButton')}
                </>
              )}
            </button>
          </div>

          {/* 소셜 로그인 구분선 */}
          {!isInstructorMode && SOCIAL_LOGIN_ENABLED && (
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400">
                  {t('auth.orContinueWith', '또는 (or)')}
                </span>
              </div>
            </div>
          )}

          {/* 소셜 로그인 버튼 (학생 모드에서만) */}
          {!isInstructorMode && SOCIAL_LOGIN_ENABLED && (
            <div className="mt-4 flex flex-col gap-3">
              {/* 카카오 로그인 */}
              <button
                type="button"
                onClick={() => handleSocialLogin('kakao')}
                disabled={!!socialLoading || isLoading}
                className="w-full py-3.5 min-h-[48px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50 text-base"
                style={{ backgroundColor: '#FEE500', color: '#191919' }}
              >
                {socialLoading === 'kakao' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3C6.48 3 2 6.48 2 10.5c0 2.55 1.64 4.79 4.12 6.14-.18.63-.65 2.27-.74 2.62-.12.44.16.43.33.31.14-.09 2.19-1.47 3.07-2.06.39.06.8.09 1.22.09 5.52 0 10-3.48 10-7.5S17.52 3 12 3z"
                      fill="#191919"
                    />
                  </svg>
                )}
                {t('auth.kakaoLogin', '카카오 로그인 (Kakao Login)')}
              </button>

              {/* 구글 로그인 */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={!!socialLoading || isLoading}
                className="w-full py-3.5 min-h-[48px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-base"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {t('auth.googleLogin', '구글 로그인 (Google Login)')}
              </button>
            </div>
          )}

          {/* 회원가입 링크 (학생 모드에서만) */}
          {!isInstructorMode && (
            <p className="mt-6 text-center text-sm text-gray-500">
              {t('auth.noAccount')}{' '}
              <Link to="/register" state={{ redirectTo }} className="text-kk-red font-semibold hover:underline">
                {t('auth.registerLink')}
              </Link>
            </p>
          )}

          {/* 선생님 로그인 전환 (학생 모드에서만) */}
          {!isInstructorMode && (
            <p className="mt-3 text-center">
              <Link to="/login?role=instructor" className="text-xs text-gray-400 hover:text-kk-red transition-colors">
                선생님이신가요?
              </Link>
            </p>
          )}

          {/* 학생 로그인 전환 (선생님 모드에서만) */}
          {isInstructorMode && (
            <p className="mt-6 text-center">
              <Link to="/login" className="text-sm text-gray-400 hover:text-kk-red transition-colors">
                학생 로그인으로 돌아가기
              </Link>
            </p>
          )}
        </form>

        {/* 홈으로 */}
        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← {t('auth.backToHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}
