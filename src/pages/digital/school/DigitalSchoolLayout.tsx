import { Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import DigitalBottomNav from '../../../components/digital/school/DigitalBottomNav';
import KkakdugiMascot from '../../../components/brand/KkakdugiMascot';
import { DigitalDeptIcon } from '../../../components/brand/SchoolIllustrations';

export default function DigitalSchoolLayout() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kk-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kk-red" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center p-6">
        <KkakdugiMascot size={48} />
        <p className="mt-4 text-kk-brown font-semibold text-lg">로그인이 필요합니다</p>
        <p className="text-kk-brown/60 text-sm mt-1 mb-6">디지털 교실은 학생 등록 후 이용할 수 있어요</p>
        <button
          onClick={() => navigate('/login', { state: { redirectTo: '/digital/hub' } })}
          className="px-6 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kk-bg pb-24">
      <header className="bg-kk-bg border-b border-kk-warm sticky top-0 z-40">
        <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/digital/hub')}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-kk-cream rounded-lg transition-colors -ml-1"
          >
            <ArrowLeft className="w-5 h-5 text-kk-brown/60" />
          </button>
          <div className="flex items-center gap-2">
            <KkakdugiMascot size={20} />
            <DigitalDeptIcon size={20} />
            <h1 className="font-bold text-kk-brown">{t('digitalSchool.layout.title', '디지털 교실')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-4">
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-kk-red/40" /></div>}>
          <Outlet />
        </Suspense>
      </main>

      <DigitalBottomNav />
    </div>
  );
}
