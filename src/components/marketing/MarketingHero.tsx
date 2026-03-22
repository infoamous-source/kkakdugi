import { useTranslation } from 'react-i18next';
import { Rocket, Clock, BookOpen } from 'lucide-react';

interface MarketingHeroProps {
  totalModules: number;
  totalHours: number;
}

export default function MarketingHero({ totalModules, totalHours }: MarketingHeroProps) {
  const { t } = useTranslation('common');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#3b82f6] text-white p-8 md:p-12 mx-4 mt-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
          <Rocket className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('marketing.landing.badge', '마케팅 실무 과정')}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight whitespace-pre-line">
          {t('marketing.landing.heroTitle', '한국에서 마케터가\n되고 싶어요?')}
        </h1>

        <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8 max-w-xl leading-relaxed">
          {t('marketing.landing.heroDescription', '기초부터 AI 활용까지, 이 과정을 마치면 나만의 마케팅 포트폴리오가 완성됩니다!')}
        </p>

        <div className="flex flex-wrap gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{totalModules}</p>
              <p className="text-blue-200 text-sm">{t('marketing.landing.modulesUnit', '개 모듈')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{totalHours}</p>
              <p className="text-blue-200 text-sm">{t('marketing.landing.hoursUnit', '시간')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">8</p>
              <p className="text-blue-200 text-sm">{t('marketing.landing.toolsUnit', '개 실무 툴')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
