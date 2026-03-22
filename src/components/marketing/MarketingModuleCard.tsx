import { useTranslation } from 'react-i18next';
import {
  BookOpen, Search, Lightbulb, Palette, Share2, DollarSign, Sparkles,
  Clock, GraduationCap, Wrench,
} from 'lucide-react';
import type { MarketingModule } from '../../types/marketing';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Search, Lightbulb, Palette, Share2, DollarSign, Sparkles,
};

const stageColors: Record<string, string> = {
  foundation: 'bg-blue-100 text-blue-700',
  practice: 'bg-purple-100 text-purple-700',
  ai: 'bg-red-100 text-red-700',
};

interface Props {
  module: MarketingModule;
  index: number;
  stageColor: string;
  onClick: () => void;
}

export default function MarketingModuleCard({ module, index, stageColor, onClick }: Props) {
  const { t } = useTranslation('common');
  const Icon = iconMap[module.icon] || BookOpen;
  const stageBadgeColor = stageColors[module.stage];

  const gradientMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  const gradient = gradientMap[stageColor] || gradientMap.blue;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${stageBadgeColor || 'bg-gray-100 text-gray-600'}`}
        >
          {t(`marketing.stages.${module.stage}_label`, module.stage)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
        {t(module.titleKey, 'Module ' + String(index + 1))}
      </h3>
      <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">
        {t(module.descriptionKey, '')}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {module.duration}
        </span>
        <span className="flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5" />
          {t('marketing.landing.lessonsCount', { count: module.lessons })}
        </span>
        <span className="flex items-center gap-1">
          <Wrench className="w-3.5 h-3.5" />
          {t('marketing.landing.toolsCount', { count: module.toolIds.length })}
        </span>
      </div>
    </button>
  );
}
