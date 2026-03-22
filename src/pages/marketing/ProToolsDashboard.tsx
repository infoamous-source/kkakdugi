import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolProgress } from '../../hooks/useSchoolProgress';
import { marketingTools } from '../../data/marketing/modules';
import CountdownBadge from '../../components/school/CountdownBadge';

export default function ProToolsDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { isGraduated: graduated, isProAccessValid: proValid, proRemainingDays: remainingDays } = useSchoolProgress();

  // 미졸업 → 허브로 리다이렉트
  if (!graduated) {
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

  // 기간 만료
  if (!proValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⏰</div>
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

      {/* 도구 그리드 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
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
                  {tool.type === 'ai' ? '🤖 AI' : tool.type === 'interactive' ? '🛠️ Interactive' : '📖 Static'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
