import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Target, ArrowRight, Copy, CheckCircle, RotateCcw, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../../hooks/usePortfolio';

interface USPData {
  productName: string;
  competitors: string;
  strengths: string;
  targetNeeds: string;
}

const initialData: USPData = {
  productName: '',
  competitors: '',
  strengths: '',
  targetNeeds: '',
};

export default function USPFinderTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logActivity } = usePortfolio();

  const steps = [
    t('marketing.tools.uspFinder.step1'),
    t('marketing.tools.uspFinder.step2'),
    t('marketing.tools.uspFinder.step3'),
    t('marketing.tools.uspFinder.step4')
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<USPData>(initialData);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const updateField = (field: keyof USPData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.productName.trim().length > 0;
      case 1: return data.competitors.trim().length > 0;
      case 2: return data.strengths.trim().length > 0 && data.targetNeeds.trim().length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === 2) {
        logActivity(
          'usp-finder', 'mk-03', 'USP Finder',
          { ...data },
          { generated: true },
          true
        );
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const generateClassicUSP = () => {
    return `"${data.productName}"는 ${data.competitors}와 달리, ${data.strengths}합니다. ${data.targetNeeds}을(를) 원하는 고객에게 최고의 선택입니다.`;
  };

  const generateBenefitUSP = () => {
    return `${data.targetNeeds}을(를) 원하신다면, "${data.productName}"를 선택하세요. ${data.competitors}와 달리 ${data.strengths}하니까요.`;
  };

  const generateEmotionalUSP = () => {
    return `${data.strengths}. "${data.productName}", 당신의 ${data.targetNeeds}을(를) 위한 유일한 선택.`;
  };

  const handleCopy = async (idx: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setData(initialData);
    setCurrentStep(0);
    setCopiedIdx(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('marketing.tools.back', '뒤로 가기')}</span>
      </button>

      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-4 md:p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 md:w-8 md:h-8" />
          <h1 className="text-xl md:text-2xl font-bold">{t('marketing.tools.uspFinder.title', 'USP 파인더')}</h1>
        </div>
        <p className="text-blue-100">{t('marketing.tools.uspFinder.description', '나만의 특별한 장점을 찾아보세요')}</p>
      </div>

      {/* Wizard Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : index + 1}
                </div>
                <span className={`text-xs mt-1.5 whitespace-nowrap ${isCurrent ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mb-5 transition-colors duration-300 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
        {currentStep === 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('marketing.tools.uspFinder.step1Title')}</h2>
            <p className="text-gray-500 text-sm mb-4">{t('marketing.tools.uspFinder.step1Description')}</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-800">
                {t('marketing.tools.uspFinder.step1Tip', '💡 구체적인 이름이 좋아요! 예: \'수제 쿠키 전문점 달콤이\'')}
              </p>
            </div>

            <input
              type="text"
              value={data.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              placeholder={t('marketing.tools.uspFinder.step1Placeholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
            />
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('marketing.tools.uspFinder.step2Title')}</h2>
            <p className="text-gray-500 text-sm mb-4">{t('marketing.tools.uspFinder.step2Description')}</p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-800">
                {t('marketing.tools.uspFinder.step2Tip', '💡 직접 경쟁하는 곳을 적어보세요. 예: \'동네 빵집, 대형 카페\'')}
              </p>
            </div>

            <textarea
              value={data.competitors}
              onChange={(e) => updateField('competitors', e.target.value)}
              placeholder={t('marketing.tools.uspFinder.step2Placeholder')}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{t('marketing.tools.uspFinder.step3Title')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('marketing.tools.uspFinder.step3Description')}</p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  {t('marketing.tools.uspFinder.step3Tip', '💡 경쟁자가 못 하는 것을 적으세요. 예: \'100% 유기농 재료만 사용\'')}
                </p>
              </div>

              <textarea
                value={data.strengths}
                onChange={(e) => updateField('strengths', e.target.value)}
                placeholder={t('marketing.tools.uspFinder.step3Placeholder')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{t('marketing.tools.uspFinder.step3Subtitle')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('marketing.tools.uspFinder.step3SubDescription')}</p>
              <textarea
                value={data.targetNeeds}
                onChange={(e) => updateField('targetNeeds', e.target.value)}
                placeholder={t('marketing.tools.uspFinder.step3SubPlaceholder')}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('marketing.tools.uspFinder.resultTitle')}</h2>

            {/* Classic Template */}
            <div className="bg-white border-2 border-blue-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  🏷️ {t('marketing.tools.uspFinder.templateClassic', '클래식')}
                </span>
                <button
                  onClick={() => handleCopy(0, generateClassicUSP())}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {copiedIdx === 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('marketing.tools.uspFinder.copySuccess')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('marketing.tools.uspFinder.copyButton')}
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <p className="text-base text-gray-800 leading-relaxed font-medium">
                  {generateClassicUSP()}
                </p>
              </div>
            </div>

            {/* Benefit Template */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  🎯 {t('marketing.tools.uspFinder.templateBenefit', '베네핏')}
                </span>
                <button
                  onClick={() => handleCopy(1, generateBenefitUSP())}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  {copiedIdx === 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('marketing.tools.uspFinder.copySuccess')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('marketing.tools.uspFinder.copyButton')}
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <p className="text-base text-gray-800 leading-relaxed font-medium">
                  {generateBenefitUSP()}
                </p>
              </div>
            </div>

            {/* Emotional Template */}
            <div className="bg-white border-2 border-pink-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 text-pink-700 text-sm font-semibold rounded-full">
                  💖 {t('marketing.tools.uspFinder.templateEmotional', '감성')}
                </span>
                <button
                  onClick={() => handleCopy(2, generateEmotionalUSP())}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white text-sm rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  {copiedIdx === 2 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('marketing.tools.uspFinder.copySuccess')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('marketing.tools.uspFinder.copyButton')}
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4">
                <p className="text-base text-gray-800 leading-relaxed font-medium">
                  {generateEmotionalUSP()}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                {t('marketing.tools.uspFinder.tipMessage')}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                {t('marketing.tools.uspFinder.resetButton')}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                {t('marketing.tools.uspFinder.prevButton')}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {currentStep === 2 ? t('marketing.tools.uspFinder.createButton') : t('marketing.tools.uspFinder.nextButton')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
