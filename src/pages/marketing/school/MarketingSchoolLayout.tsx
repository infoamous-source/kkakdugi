import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import SchoolBottomNav from '../../../components/school/SchoolBottomNav';
import KkakdugiMascot from '../../../components/brand/KkakdugiMascot';
import { MarketingDeptIcon } from '../../../components/brand/SchoolIllustrations';

export default function MarketingSchoolLayout() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-kk-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kk-red" />
      </div>
    );
  }

  // 미로그인 시 로그인 안내
  if (!user) {
    return (
      <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center p-6">
        <KkakdugiMascot size={48} />
        <p className="mt-4 text-kk-brown font-semibold text-lg">로그인이 필요합니다</p>
        <p className="text-kk-brown/60 text-sm mt-1 mb-6">마케팅 학교는 학생 등록 후 이용할 수 있어요</p>
        <button
          onClick={() => navigate('/login', { state: { redirectTo: '/marketing/hub' } })}
          className="px-6 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kk-bg pb-20">
      {/* 상단 헤더 */}
      <header className="bg-kk-bg border-b border-kk-warm sticky top-0 z-40">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/marketing/hub')}
            className="p-1.5 hover:bg-kk-cream rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-kk-brown/60" />
          </button>
          <div className="flex items-center gap-2">
            <KkakdugiMascot size={20} />
            <MarketingDeptIcon size={20} />
            <h1 className="font-bold text-kk-brown">{t('school.layout.title')}</h1>
          </div>
        </div>
      </header>

      {/* 탭 콘텐츠 */}
      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* 하단 탭 네비게이션 */}
      <SchoolBottomNav />
    </div>
  );
}
