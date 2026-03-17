import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Monitor, Globe, ChevronRight, Loader2 } from 'lucide-react';
import { kkakdugiRegistry } from '../../../components/digital/KkakdugiSimulator/registry';
import type { KkakdugiType } from '../../../components/digital/KkakdugiSimulator/core/types';

const kkakdugiTypes: KkakdugiType[] = ['cafe', 'fastfood', 'cinema', 'convenience', 'hospital', 'bank', 'government', 'airport'];

export default function DigitalLabTab() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (!user || isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-kk-red/40" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            {t('digitalSchool.lab.title', '실습실')}
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          {t('digitalSchool.lab.subtitle', '키오스크 시뮬레이터와 한국 생활 앱')}
        </p>
      </div>

      {/* 키오스크 시뮬레이터 섹션 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          🖥️ {t('digitalSchool.lab.kkakdugiSection', '키오스크 시뮬레이터')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {t('digitalSchool.lab.kkakdugiDesc', '8종 키오스크를 실제처럼 연습해보세요')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kkakdugiTypes.map((type) => {
            const entry = kkakdugiRegistry[type];
            if (!entry) return null;
            const config = entry.config;

            return (
              <button
                key={type}
                onClick={() => navigate('/track/digital-basics/kkakdugi-practice')}
                className="group p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center"
              >
                <div className="text-3xl mb-2">{config.icon}</div>
                <p className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {t(config.nameKey, config.id)}
                </p>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {Array.from({ length: config.difficulty }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  ))}
                  {Array.from({ length: 4 - config.difficulty }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 한국 생활 앱 섹션 */}
      <button
        onClick={() => navigate('/track/digital-basics/korea-apps')}
        className="w-full bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-300 transition-all text-left group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              {t('digitalSchool.lab.appsSection', '한국 생활 필수 앱')}
            </h3>
            <p className="text-xs text-gray-500">
              {t('digitalSchool.lab.appsDesc', '한국 생활에 필요한 앱을 설치하고 사용법을 배워요')}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </div>
      </button>
    </div>
  );
}
