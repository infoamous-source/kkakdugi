import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import KkakdugiCharacter from '../brand/KkakdugiCharacter';

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
  const { login, user } = useAuth();

  const isInstructorMode = searchParams.get('role') === 'instructor';
  const redirectTo = (location.state as LocationState)?.redirectTo || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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

            {/* 자동 로그인 체크박스 */}
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

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-white ${
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
