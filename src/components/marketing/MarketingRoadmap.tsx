import { useTranslation } from 'react-i18next';
import { marketingStages } from '../../data/marketing/modules';

export default function MarketingRoadmap() {
  const { t } = useTranslation('common');

  const stageDescriptions: Record<string, string> = {
    foundation: '마케팅 기본기 완성',
    practice: 'SNS·광고 실전 연습',
    ai: 'AI로 광고 제작',
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-4">
      {marketingStages.map((stage, index) => (
        <div key={stage.id} className="flex-1 flex flex-col md:flex-row items-center gap-3">
          <div className={`w-full rounded-xl border-2 ${stage.borderColor} ${stage.bgColor} p-3 md:p-5 text-center transition-all hover:shadow-md`}>
            <span className="text-2xl md:text-3xl mb-2 block">{stage.emoji}</span>
            <h3 className={`font-bold text-lg ${stage.textColor}`}>
              {t(stage.nameKey, stage.id)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t(`marketing.stages.${stage.id}Desc`, stageDescriptions[stage.id])}
            </p>
          </div>
          {index < marketingStages.length - 1 && (
            <>
              <div className="hidden md:block text-gray-300 text-2xl font-bold shrink-0">→</div>
              <div className="md:hidden text-gray-300 text-2xl font-bold text-center">↓</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
