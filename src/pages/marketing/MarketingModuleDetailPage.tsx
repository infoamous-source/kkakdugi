import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, BookOpen, Search, Lightbulb, Palette, Share2, DollarSign, Sparkles,
  Clock, GraduationCap, Wrench, ChevronRight, CheckCircle,
} from 'lucide-react';
import { marketingModules, marketingTools, marketingStages } from '../../data/marketing/modules';
import { useVisibility } from '../../contexts/VisibilityContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Search, Lightbulb, Palette, Share2, DollarSign, Sparkles,
};

const toolIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, UserCircle: Search, Target: Lightbulb, Palette, Hash: Share2,
  Calculator: DollarSign, PenTool: Sparkles, Image: Sparkles,
};

export default function MarketingModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { isToolVisible } = useVisibility();

  const module = marketingModules.find((m) => m.id === moduleId);

  if (!module) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">{t('marketing.moduleDetail.notFound', 'Module not found.')}</p>
        <button
          onClick={() => navigate('/marketing')}
          className="mt-4 text-blue-600 hover:underline"
        >
          {t('marketing.moduleDetail.backToMarketing', 'Back to Marketing home')}
        </button>
      </div>
    );
  }

  const stage = marketingStages.find((s) => s.id === module.stage);
  const tools = marketingTools.filter(
    (tool) => module.toolIds.includes(tool.id) && isToolVisible('marketing', tool.id),
  );
  const Icon = iconMap[module.icon] || BookOpen;

  const stageColorMap: Record<string, string> = {
    foundation: 'from-blue-500 to-blue-600',
    practice: 'from-purple-500 to-purple-600',
    ai: 'from-red-500 to-red-600',
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/marketing')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('marketing.moduleDetail.back', '마케팅 홈으로')}</span>
      </button>

      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8 mb-6 md:mb-8">
        <div className="flex items-start gap-3 md:gap-5">
          <div
            className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${stageColorMap[module.stage] || stageColorMap.foundation} flex items-center justify-center text-white shadow-lg shrink-0`}
          >
            <Icon className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stage?.bgColor || 'bg-gray-100'} ${stage?.textColor || 'text-gray-600'}`}>
                {stage?.emoji} {t(stage?.nameKey || '', module.stage)}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              {t(module.titleKey, module.id)}
            </h1>
            <p className="text-gray-500 leading-relaxed">
              {t(module.descriptionKey, '')}
            </p>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-3 md:mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {module.duration}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> {t('marketing.landing.lessonsCount', { count: module.lessons })}
              </span>
              <span className="flex items-center gap-1">
                <Wrench className="w-4 h-4" /> {t('marketing.landing.practiceToolsCount', { count: module.toolIds.length })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Items */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {t('marketing.moduleDetail.learningTitle', '학습 내용')}
        </h2>
        <div className="space-y-3">
          {module.learningItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 flex items-start gap-3 md:gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {t(item.titleKey, 'Step ' + String(item.order))}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(item.descriptionKey, '')}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-gray-200 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {t('marketing.moduleDetail.toolsTitle', '실무 도구')}
        </h2>
        <div className="space-y-3">
          {tools.map((tool) => {
            const ToolIcon = toolIconMap[tool.icon] || Wrench;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className="w-full bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-200 p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:shadow-md hover:border-blue-300 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                  <ToolIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {t(tool.nameKey, tool.id)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t(tool.descriptionKey, '')}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-blue-500 text-sm font-medium">
                  {t('marketing.moduleDetail.tryTool', '사용하기')}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
