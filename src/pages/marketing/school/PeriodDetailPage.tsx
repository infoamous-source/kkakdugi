import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import {
  ClipboardCheck,
  Radar,
  Zap,
  Share2,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';
import type { PeriodId } from '../../../types/school';
import { SCHOOL_CURRICULUM } from '../../../types/school';
import { useAuth } from '../../../contexts/AuthContext';
import SchoolBottomNav from '../../../components/school/SchoolBottomNav';
import KkakdugiMascot from '../../../components/brand/KkakdugiMascot';

const iconMap: Record<string, typeof ClipboardCheck> = {
  ClipboardCheck,
  Radar,
  Zap,
  Share2,
  CalendarCheck,
  TrendingUp,
};

const colorMap: Record<string, { gradient: string; bg: string; text: string }> = {
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
  },
};

/**
 * 교시(Period) 상세 페이지
 * - 수업 요약 정리
 * - AI 툴 버튼
 */
export default function PeriodDetailPage() {
  const { periodId } = useParams<{ periodId: PeriodId }>();
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

  const period = SCHOOL_CURRICULUM.find((p) => p.id === periodId);

  if (!period) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('school.periodDetail.notFound')}</p>
          <button
            onClick={() => navigate('/marketing/school/curriculum')}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
          >
            ← {t('school.periodDetail.backToCurriculum', '시간표로 돌아가기')}
          </button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[period.icon] || ClipboardCheck;
  const colors = colorMap[period.color] || colorMap.blue;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/marketing/school/curriculum')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <h1 className="font-bold text-gray-800">
              {period.period}{t('school.curriculum.period')} - {t(period.nameKey)}
            </h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 히어로 카드 */}
        <div className={`rounded-2xl bg-gradient-to-br ${colors.gradient} p-8 text-white shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">
                {period.period}{t('school.curriculum.period')}
              </p>
              <h2 className="text-2xl font-extrabold">{t(period.nameKey)}</h2>
            </div>
          </div>
          <p className="text-white/90 leading-relaxed text-sm">
            {t(period.descriptionKey)}
          </p>
        </div>

        {/* 수업 요약 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            📖 {t('school.periodDetail.summary')}
          </h3>
          <div className="text-sm text-gray-700 leading-relaxed space-y-2">
            {t(period.descriptionKey)}
          </div>
        </div>

        {/* AI 툴 섹션 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            {t('school.periodDetail.aiTools')}
          </h3>

          {/* 툴 버튼 */}
          <button
            onClick={() => navigate(period.toolRoute)}
            className={`w-full p-5 rounded-xl border-2 ${colors.bg} border-transparent
              hover:border-current ${colors.text} transition-all
              flex items-center justify-between group`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-800 group-hover:text-gray-900">
                  {t(period.nameKey)}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('school.periodDetail.clickToStart')}
                </p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 rotate-180 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        {/* 힌트 카드 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 {t('school.periodDetail.hint')}
          </p>
        </div>
      </main>

      {/* 하단 탭 네비게이션 */}
      <SchoolBottomNav />
    </div>
  );
}
