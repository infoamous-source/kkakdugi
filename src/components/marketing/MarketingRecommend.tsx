import { useTranslation } from 'react-i18next';
import { GraduationCap, Briefcase, Rocket, Globe, CheckCircle } from 'lucide-react';
import { recommendTargets } from '../../data/marketing/modules';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap, Briefcase, Rocket, Globe,
};

export default function MarketingRecommend() {
  const { t } = useTranslation('common');

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
        {t('marketing.recommend.title', '이런 분에게 추천해요!')}
      </h2>
      <p className="text-gray-500 mb-6">
        {t('marketing.recommend.subtitle', '아래에 해당되면 이 과정이 딱이에요')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendTargets.map((target, index) => {
          const Icon = iconMap[target.icon] || CheckCircle;
          return (
            <div
              key={index}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-700 font-medium">
                {t(target.textKey, 'Target ' + String(index + 1))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
