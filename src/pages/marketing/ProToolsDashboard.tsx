import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock, ExternalLink, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolProgress } from '../../hooks/useSchoolProgress';
import { marketingTools } from '../../data/marketing/modules';
import CountdownBadge from '../../components/school/CountdownBadge';

const proStudioTools = [
  { id: 'market-research', name: '시장 리서치 리포트', desc: '경쟁사 분석 + 시장 규모 추정 + PDF 리포트', icon: '\u{1F4CA}', route: '/marketing/pro/studio/market-research' },
  { id: 'brand-kit', name: '브랜드 키트', desc: '로고 컨셉 + 컬러 팔레트 + 브랜드 가이드라인', icon: '\u{1F3A8}', route: '/marketing/pro/studio/brand-kit' },
  { id: 'content-studio', name: '콘텐츠 스튜디오', desc: '사진 업로드 + 텍스트 편집 + 멀티 사이즈', icon: '\u{1F4F1}', route: '/marketing/pro/studio/content-studio' },
  { id: 'landing-builder', name: '랜딩페이지 빌더', desc: '섹션 편집 + 사진 업로드 + 포트폴리오 PDF', icon: '\u{1F6D2}', route: '/marketing/pro/studio/landing-builder' },
  { id: 'marketing-dashboard', name: '마케팅 대시보드', desc: '월별 ROAS + 채널별 비교 + 월간 리포트', icon: '\u{1F4C8}', route: '/marketing/pro/studio/marketing-dashboard' },
];

export default function ProToolsDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isGraduated: graduated, isProAccessValid: proValid, proRemainingDays: remainingDays } = useSchoolProgress();

  // CEO/강사는 모든 제한 우회 (졸업·기간 무관)
  const isStaff = user?.role === 'ceo' || user?.role === 'instructor';

  // 미졸업 -> 허브로 리다이렉트 (학생만)
  if (!isStaff && !graduated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('school.pro.notGraduated')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('school.pro.notGraduatedHint')}</p>
          <button
            onClick={() => navigate('/marketing/hub')}
            className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
          >
            {t('school.pro.goToSchool')}
          </button>
        </div>
      </div>
    );
  }

  // 기간 만료 (학생만)
  if (!isStaff && !proValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-4xl mb-4">{'\u23F0'}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('school.pro.expired')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('school.pro.expiredHint')}</p>
          <button
            onClick={() => navigate('/marketing/hub')}
            className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            {t('school.pro.backToHub')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/marketing/hub')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{t('school.pro.backToHub')}</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold">{t('school.pro.title')}</h1>
              <p className="text-gray-400 text-sm mt-1">{t('school.pro.subtitle')}</p>
            </div>
            <CountdownBadge days={remainingDays} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pro Studio Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Crown className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-extrabold text-gray-900">프로 스튜디오</h2>
            <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5">AI 기반 프리미엄 마케팅 도구 모음</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {proStudioTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className="relative bg-white rounded-2xl p-5 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group overflow-hidden"
                style={{
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                {/* PRO Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1 pr-8">
                    <h3 className="font-bold text-gray-800 mb-1">{tool.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{tool.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">기본 도구</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 기존 도구 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marketingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(tool.route)}
              className="bg-white rounded-2xl border border-gray-200 p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{t(tool.nameKey)}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{t(tool.descriptionKey)}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 ml-3" />
              </div>
              <div className="mt-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  tool.type === 'ai'
                    ? 'bg-red-50 text-red-600'
                    : tool.type === 'interactive'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  {tool.type === 'ai' ? '\u{1F916} AI' : tool.type === 'interactive' ? '\u{1F6E0}\uFE0F Interactive' : '\u{1F4D6} Static'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
