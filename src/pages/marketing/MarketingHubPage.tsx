import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedList from '../../components/common/AnimatedList';
import { useSchoolProgress } from '../../hooks/useSchoolProgress';
import { isGeminiConnected } from '../../services/gemini/geminiClient';
import CountdownBadge from '../../components/school/CountdownBadge';
import KkakdugiCharacter from '../../components/brand/KkakdugiCharacter';
import KkakdugiMascot from '../../components/brand/KkakdugiMascot';
import { MarketingDeptIcon, ChalkboardIcon, DiplomaIcon, SchoolPatternBg } from '../../components/brand/SchoolIllustrations';
import { useSEO } from '../../hooks/useSEO';

export default function MarketingHubPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isGraduated: graduated, isProAccessValid: proValid, proRemainingDays: remainingDays } = useSchoolProgress();
  useSEO({
    title: '마케팅 학과',
    description: '마케팅 기초 이론부터 AI 실습까지. 한국에서 비즈니스를 시작하거나 마케팅 역량을 키우고 싶은 분을 위한 무료 교육 과정입니다.',
    path: '/marketing/hub',
  });

  const handleSchoolClick = () => {
    // AI 연결 여부와 무관하게 바로 학교로 이동 (AI는 선택 사항)
    navigate('/marketing/school/attendance');
  };

  const handleProClick = () => {
    if (!graduated) {
      alert(t('school.hub.proLocked'));
      return;
    }
    if (!proValid) {
      alert(t('school.hub.proExpired'));
      return;
    }
    navigate('/marketing/pro');
  };

  return (
    <div className="min-h-screen bg-kk-bg relative overflow-hidden">
      <SchoolPatternBg className="opacity-30" />

      {/* 헤더 */}
      <header className="relative py-4 px-4 sm:py-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kk-brown/60 hover:text-kk-brown transition-colors mb-6 py-2 -ml-2 pl-2 pr-4 min-h-[44px] rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <KkakdugiMascot size={20} />
            <span className="text-sm font-medium">깍두기 학교로 돌아가기</span>
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <KkakdugiCharacter size="icon" animated={false} />
              <MarketingDeptIcon size={40} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold mb-4 border border-purple-100">
              <Sparkles className="w-4 h-4" />
              <span>{t('school.hub.badge', '마케팅 학과')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-kk-brown mb-3">
              {t('school.hub.title', '마케팅 학과')}
            </h1>
            <p className="text-kk-brown/60 max-w-xl mx-auto">
              {t('school.hub.description')}
            </p>
          </div>
        </div>
      </header>

      {/* 교실 카드 그리드 */}
      <section className="relative pb-24 px-4 sm:px-8">
        <AnimatedList className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 카드 A: 예비 마케터 교실 */}
          <div className="animate-on-scroll">
          <button
            onClick={handleSchoolClick}
            className="group relative w-full rounded-2xl border-2 border-purple-200 hover:border-purple-400 bg-white overflow-hidden
              transition-all duration-300 ease-out cursor-pointer text-left
              hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-200/30"
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />

            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ChalkboardIcon size={28} />
                </div>
                {graduated && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                    {t('school.hub.graduated', '졸업 완료')}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-kk-brown mb-2 flex items-center gap-2">
                {t('school.hub.schoolTitle', '예비 마케터 교실')}
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-kk-brown/40" />
              </h2>

              <p className="text-kk-brown/60 text-sm leading-relaxed mb-5">
                {t('school.hub.schoolDescription')}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold border border-purple-100">
                <span>📚</span>
                <span>{t('school.hub.schoolBadge', '기초부터 차근차근')}</span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/[0.03] group-hover:to-pink-500/[0.03] transition-all duration-300 pointer-events-none" />
          </button>
          </div>

          {/* 카드 B: 프로 마케터 교실 */}
          <div className="animate-on-scroll" style={{ transitionDelay: '80ms' }}>
          <button
            onClick={handleProClick}
            className={`group relative w-full rounded-2xl border-2 bg-white overflow-hidden
              transition-all duration-300 ease-out cursor-pointer text-left
              ${graduated && proValid
                ? 'border-amber-300 hover:border-amber-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-200/30'
                : 'border-gray-200 opacity-80'
              }`}
          >
            <div className={`h-2 ${graduated && proValid ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gray-200'}`} />

            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  graduated && proValid ? 'bg-amber-50' : 'bg-gray-100'
                }`}>
                  {graduated && proValid ? (
                    <DiplomaIcon size={28} />
                  ) : (
                    <Lock className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-kk-brown mb-2 flex items-center gap-2">
                {t('school.hub.proTitle', '프로 마케터 교실')}
                {graduated && proValid && (
                  <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-kk-brown/40" />
                )}
              </h2>

              <p className="text-kk-brown/60 text-sm leading-relaxed mb-5">
                {graduated && proValid
                  ? t('school.hub.proDescriptionUnlocked')
                  : t('school.hub.proDescriptionLocked')
                }
              </p>

              {graduated && proValid ? (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold border border-amber-100">
                    <span>🏆</span>
                    <span>{t('school.hub.proBadge')}</span>
                  </div>
                  <CountdownBadge days={remainingDays} />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>{t('school.hub.proLockedBadge', '졸업 후 이용 가능')}</span>
                </div>
              )}
            </div>

            {graduated && proValid && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 group-hover:from-amber-500/[0.03] group-hover:to-yellow-500/[0.03] transition-all duration-300 pointer-events-none" />
            )}
          </button>
          </div>
        </AnimatedList>
      </section>
    </div>
  );
}
