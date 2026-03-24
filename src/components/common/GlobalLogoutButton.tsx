import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Home, Settings, Backpack, Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';

/**
 * 모든 페이지에 표시되는 플로팅 로그아웃 버튼.
 * - 로그인 상태에서만 렌더링
 * - 로그인/회원가입/MainLayout 하위 페이지에서는 숨김 (TopHeader에 이미 로그아웃 있음)
 * - 오른쪽 상단 고정 위치
 * - 학생 모드 전환 지원 (instructor/ceo → student 모드)
 */

// MainLayout이 적용되는 경로 (TopHeader에 이미 로그아웃 있음)
const MAIN_LAYOUT_PATHS = ['/track', '/profile', '/resources', '/help', '/settings'];
const LEGACY_MARKETING_PATHS = ['/marketing/modules', '/marketing/tools'];
// 숨겨야 할 인증 관련 경로
const AUTH_PATHS = ['/login', '/register', '/register-complete', '/congrats', '/ai-welcome'];

const STUDENT_MODE_KEY = 'kkakdugi_original_role';

function shouldHideButton(pathname: string): boolean {
  // 인증 페이지
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return true;
  // MainLayout 하위 (TopHeader가 있음)
  if (MAIN_LAYOUT_PATHS.some((p) => pathname.startsWith(p))) return true;
  // 레거시 마케팅 (MainLayout 내부)
  if (LEGACY_MARKETING_PATHS.some((p) => pathname.startsWith(p))) return true;
  // /marketing 정확히 (리다이렉트)
  if (pathname === '/marketing') return true;
  return false;
}

export default function GlobalLogoutButton() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, setUser } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if currently in student mode
  const isStudentMode = !!sessionStorage.getItem(STUDENT_MODE_KEY);

  // 클릭 외부 감지
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // 비로그인 또는 숨겨야 할 경로
  if (!isAuthenticated || !user) return null;
  if (shouldHideButton(location.pathname)) return null;

  const handleLogout = async () => {
    // Clean up student mode on logout
    sessionStorage.removeItem(STUDENT_MODE_KEY);
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleHome = () => {
    setMenuOpen(false);
    navigate('/');
  };

  const handleDashboard = () => {
    setMenuOpen(false);
    if (user.role === 'ceo') {
      navigate('/ceo');
    } else {
      navigate('/admin');
    }
  };

  // Switch to student mode
  const handleStudentMode = () => {
    if (!user) return;
    // Store original role in sessionStorage
    sessionStorage.setItem(STUDENT_MODE_KEY, user.role);
    // Temporarily set role to student in context
    setUser({ ...user, role: 'student' });
    setMenuOpen(false);
    navigate('/');
  };

  // Return to original admin/ceo role
  const handleReturnToAdmin = () => {
    const originalRole = sessionStorage.getItem(STUDENT_MODE_KEY) as UserRole | null;
    if (!originalRole || !user) return;
    sessionStorage.removeItem(STUDENT_MODE_KEY);
    setUser({ ...user, role: originalRole });
    if (originalRole === 'ceo') {
      navigate('/ceo');
    } else {
      navigate('/admin');
    }
  };

  const getRoleBadge = () => {
    if (isStudentMode) return { label: '학생 모드 (체험중)', className: 'bg-amber-100 text-amber-700' };
    if (user.role === 'ceo') return { label: 'CEO', className: 'bg-purple-100 text-purple-700' };
    if (user.role === 'instructor') return { label: t('header.instructor'), className: 'bg-kk-red/10 text-kk-red-deep' };
    return { label: t('header.student'), className: 'bg-kk-cream text-kk-brown' };
  };

  const badge = getRoleBadge();

  return (
    <>
      <div ref={menuRef} className="fixed top-4 right-4 z-[9999]">
        {/* 아바타 버튼 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md hover:shadow-lg transition-shadow ${
            isStudentMode
              ? 'bg-gradient-to-br from-amber-200 to-amber-400 border-amber-500'
              : 'bg-gradient-to-br from-kk-cream to-kk-peach border-kk-warm'
          }`}
          aria-label="User menu"
        >
          <Backpack className={`w-5 h-5 ${isStudentMode ? 'text-amber-800' : 'text-kk-brown'}`} />
        </button>

        {/* 드롭다운 메뉴 */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-kk-warm py-2 min-w-[200px]">
            {/* 사용자 정보 */}
            <div className="px-4 py-2.5 border-b border-kk-warm/50">
              <p className="text-sm font-semibold text-kk-brown truncate">{user.name}</p>
              <p className="text-xs text-kk-brown/40 truncate">{user.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            {/* 홈으로 */}
            <button
              onClick={handleHome}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-kk-brown/70 hover:bg-kk-cream/40 transition-colors"
            >
              <Home className="w-4 h-4" />
              {t('nav.home', '홈으로')}
            </button>

            {/* 강사/CEO 대시보드 (학생 모드가 아닐 때) */}
            {!isStudentMode && (user.role === 'instructor' || user.role === 'ceo') && (
              <button
                onClick={handleDashboard}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-kk-brown/70 hover:bg-kk-cream/40 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('header.dashboard')}
              </button>
            )}

            {/* 학생 모드 전환 (강사/CEO만, 학생 모드가 아닐 때) */}
            {!isStudentMode && (user.role === 'instructor' || user.role === 'ceo') && (
              <button
                onClick={handleStudentMode}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                학생 모드
              </button>
            )}

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-kk-red hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('header.logout')}
            </button>
          </div>
        )}
      </div>

      {/* 학생 모드 복귀 버튼 (항상 표시, 고정 위치) */}
      {isStudentMode && (
        <button
          onClick={handleReturnToAdmin}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all animate-pulse"
        >
          <ArrowLeft className="w-4 h-4" />
          관리자로 돌아가기
        </button>
      )}
    </>
  );
}
