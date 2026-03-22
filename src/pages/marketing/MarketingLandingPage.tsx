import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MarketingHero from '../../components/marketing/MarketingHero';
import AIAssistantConnect from '../../components/marketing/AIAssistantConnect';
import MarketingRoadmap from '../../components/marketing/MarketingRoadmap';
import MarketingModuleCard from '../../components/marketing/MarketingModuleCard';
import MarketingRecommend from '../../components/marketing/MarketingRecommend';
import InstructorProfile from '../../components/marketing/InstructorProfile';
import { marketingModules, marketingStages } from '../../data/marketing/modules';
import { useVisibility } from '../../contexts/VisibilityContext';

export default function MarketingLandingPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { isModuleVisible } = useVisibility();

  // 보이는 모듈만 필터링
  const visibleModules = marketingModules.filter((m) =>
    isModuleVisible('marketing', m.id),
  );

  const totalHours = visibleModules.reduce((acc, m) => {
    const h = parseFloat(m.duration);
    return acc + (isNaN(h) ? 0 : h);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <MarketingHero totalModules={visibleModules.length} totalHours={totalHours} />

      {/* AI 비서 연결 섹션 */}
      <section className="mt-8">
        <AIAssistantConnect />
      </section>

      <section id="marketing-modules" className="mt-12 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t('marketing.landing.roadmapTitle', '학습 로드맵')}
        </h2>
        <MarketingRoadmap />
      </section>

      {marketingStages.map((stage) => {
        const stageModules = visibleModules.filter((m) => m.stage === stage.id);
        if (stageModules.length === 0) return null;
        return (
          <section key={stage.id} className="mt-12 px-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{stage.emoji}</span>
              <h2 className="text-xl font-bold text-gray-800">
                {t(stage.nameKey, stage.id)}
              </h2>
              <span className={`text-sm px-3 py-1 rounded-full ${stage.bgColor} ${stage.textColor}`}>
                {t('marketing.landing.moduleCount', { count: stageModules.length })}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stageModules.map((module, index) => (
                <MarketingModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  stageColor={stage.color}
                  onClick={() => navigate(`/marketing/modules/${module.id}`)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-16 px-4">
        <MarketingRecommend />
      </section>

      <section className="mt-16 px-4">
        <InstructorProfile />
      </section>
    </div>
  );
}
