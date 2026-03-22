import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Image, ArrowRight, RotateCcw, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../../hooks/usePortfolio';
import type { AdImageStyle } from '../../../types/marketing';

const styleGradients: Record<AdImageStyle, string> = {
  realistic: 'from-gray-700 to-gray-900',
  illustration: 'from-pink-400 to-purple-500',
  '3d': 'from-cyan-400 to-blue-600',
  popart: 'from-yellow-400 via-red-400 to-pink-500',
};

type Platform = 'instagram' | 'youtube' | 'kakao';
type TextPosition = 'top' | 'center' | 'bottom';

export default function SNSAdMakerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logActivity } = usePortfolio();

  const styleOptions: { value: AdImageStyle; label: string; emoji: string }[] = [
    { value: 'realistic', label: t('marketing.tools.snsAdMaker.styleRealistic'), emoji: '📷' },
    { value: 'illustration', label: t('marketing.tools.snsAdMaker.styleIllustration'), emoji: '🎨' },
    { value: '3d', label: t('marketing.tools.snsAdMaker.style3d'), emoji: '🧊' },
    { value: 'popart', label: t('marketing.tools.snsAdMaker.stylePopart'), emoji: '🌈' },
  ];

  const stylePatterns: Record<AdImageStyle, string> = {
    realistic: t('marketing.tools.snsAdMaker.styleRealisticDesc'),
    illustration: t('marketing.tools.snsAdMaker.styleIllustrationDesc'),
    '3d': t('marketing.tools.snsAdMaker.style3dDesc'),
    popart: t('marketing.tools.snsAdMaker.stylePopartDesc'),
  };

  const ctaOptions = ['구매하기', '자세히 보기', '무료 체험', '지금 신청'];

  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState<AdImageStyle>('realistic');
  const [copyText, setCopyText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [textPosition, setTextPosition] = useState<TextPosition>('center');
  const [ctaText, setCtaText] = useState('구매하기');

  const canGenerate = subject.trim().length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setShowPreview(true);

    logActivity(
      'sns-ad-maker', 'mk-07', 'SNS Ad Maker',
      { subject, style, copyText, platform, textPosition, ctaText },
      { generated: true, isMockData: true },
      true
    );
  };

  const handleReset = () => {
    setShowPreview(false);
  };

  const getPositionClass = () => {
    switch (textPosition) {
      case 'top':
        return 'items-start justify-start pt-8';
      case 'bottom':
        return 'items-end justify-end pb-8';
      default:
        return 'items-center justify-center';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('marketing.tools.back', '뒤로 가기')}</span>
      </button>

      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-4 md:p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Image className="w-6 h-6 md:w-8 md:h-8" />
          <h1 className="text-xl md:text-2xl font-bold">{t('marketing.tools.snsAdMaker.title', 'SNS 광고 메이커')}</h1>
        </div>
        <p className="text-blue-100">{t('marketing.tools.snsAdMaker.description', '인스타그램 광고 이미지를 만들어보세요')}</p>
      </div>

      {/* Tip: Link to K-Copywriter */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          {t('marketing.tools.snsAdMaker.noCopyMessage')}{' '}
          <button
            onClick={() => navigate('/marketing/tools/k-copywriter')}
            className="text-blue-600 hover:underline font-semibold"
          >
            {t('marketing.tools.snsAdMaker.createCopyLink')}
          </button>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Settings Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
          <h2 className="font-bold text-gray-800 mb-4">{t('marketing.tools.snsAdMaker.settingsTitle')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('marketing.tools.snsAdMaker.subjectLabel')}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('marketing.tools.snsAdMaker.subjectPlaceholder')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('marketing.tools.snsAdMaker.styleLabel')}</label>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStyle(opt.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      style === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl block">{opt.emoji}</span>
                    <span className={`text-sm font-medium ${style === opt.value ? 'text-blue-600' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">텍스트 위치</label>
              <div className="grid grid-cols-3 gap-2">
                {(['top', 'center', 'bottom'] as TextPosition[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setTextPosition(pos)}
                    className={`py-2 px-3 rounded-xl border-2 text-center text-sm transition-all ${
                      textPosition === pos
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {pos === 'top' ? '상단' : pos === 'center' ? '중앙' : '하단'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CTA 버튼</label>
              <div className="grid grid-cols-2 gap-2">
                {ctaOptions.map((cta) => (
                  <button
                    key={cta}
                    onClick={() => setCtaText(cta)}
                    className={`py-2 px-3 rounded-xl border-2 text-center text-sm transition-all ${
                      ctaText === cta
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {cta}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('marketing.tools.snsAdMaker.copyLabel')}</label>
              <textarea
                value={copyText}
                onChange={(e) => setCopyText(e.target.value)}
                placeholder={t('marketing.tools.snsAdMaker.copyPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                canGenerate
                  ? 'bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {t('marketing.tools.snsAdMaker.generatePreview')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div>
          {/* Platform Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setPlatform('instagram')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                platform === 'instagram'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setPlatform('youtube')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                platform === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              YouTube
            </button>
            <button
              onClick={() => setPlatform('kakao')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                platform === 'kakao'
                  ? 'bg-yellow-400 text-gray-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              KakaoTalk
            </button>
          </div>

          {showPreview ? (
            <div>
              {/* Instagram Preview */}
              {platform === 'instagram' && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  {/* Instagram Header */}
                  <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t('marketing.tools.snsAdMaker.brandName')}</p>
                      <p className="text-xs text-gray-400">{t('marketing.tools.snsAdMaker.sponsored')}</p>
                    </div>
                  </div>

                  {/* Image Area */}
                  <div className={`relative aspect-square bg-gradient-to-br ${styleGradients[style]} flex flex-col ${getPositionClass()} p-4 md:p-8`}>
                    {/* Style indicator */}
                    <div className="absolute top-3 right-3 bg-black/30 px-2 py-1 rounded text-white text-xs">
                      {stylePatterns[style]}
                    </div>

                    {/* Main visual */}
                    <div className="text-center">
                      <div className="text-6xl mb-4">
                        {style === 'realistic' ? '📸' : style === 'illustration' ? '🎨' : style === '3d' ? '🧊' : '🎉'}
                      </div>
                      <p className="text-white font-bold text-xl mb-2">{subject}</p>
                      {copyText && (
                        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                          <p className="text-white font-medium text-sm leading-relaxed">{copyText}</p>
                        </div>
                      )}
                      {/* CTA Button */}
                      <button className="mt-4 px-6 py-2.5 bg-white text-gray-800 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg">
                        {ctaText}
                      </button>
                    </div>
                  </div>

                  {/* Instagram Actions */}
                  <div className="p-3">
                    <div className="flex gap-4 mb-2">
                      <span className="text-xl">❤️</span>
                      <span className="text-xl">💬</span>
                      <span className="text-xl">📤</span>
                    </div>
                    <p className="text-sm">
                      {t('marketing.tools.snsAdMaker.likes', { count: 123 })}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-semibold">{t('marketing.tools.snsAdMaker.brandName')}</span>{' '}
                      {copyText || subject}
                    </p>
                  </div>
                </div>
              )}

              {/* YouTube Preview */}
              {platform === 'youtube' && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className={`relative aspect-video bg-gradient-to-br ${styleGradients[style]} flex flex-col ${getPositionClass()} p-6`}>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:bg-red-700 transition-colors cursor-pointer">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-white text-xs font-semibold">
                      12:34
                    </div>

                    {/* Subject text */}
                    <div className="relative z-10 text-center">
                      <p className="text-white font-bold text-2xl md:text-3xl drop-shadow-lg">{subject}</p>
                      {copyText && (
                        <div className="mt-3 bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                          <p className="text-white font-medium text-sm">{copyText}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* YouTube Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-2">{subject} - {ctaText}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{t('marketing.tools.snsAdMaker.brandName')}</span>
                      <span>•</span>
                      <span>1.2만 조회수</span>
                      <span>•</span>
                      <span>1일 전</span>
                    </div>
                    <button className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors">
                      {ctaText}
                    </button>
                  </div>
                </div>
              )}

              {/* KakaoTalk Preview */}
              {platform === 'kakao' && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${styleGradients[style]} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-3xl">
                          {style === 'realistic' ? '📸' : style === 'illustration' ? '🎨' : style === '3d' ? '🧊' : '🎉'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{subject}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {copyText || '광고 카피를 입력해주세요'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{t('marketing.tools.snsAdMaker.brandName')}</span>
                          <button className="text-xs text-blue-600 font-semibold hover:underline">
                            {ctaText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="border-t border-gray-100 p-3">
                    <button className="w-full py-2.5 bg-yellow-400 text-gray-800 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors">
                      {ctaText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl aspect-square lg:aspect-auto lg:h-[500px] flex flex-col items-center justify-center text-gray-400">
              <Image className="w-16 h-16 mb-3 opacity-50" />
              <p className="font-medium text-center px-4">{t('marketing.tools.snsAdMaker.emptyMessage')}</p>
            </div>
          )}

          {showPreview && (
            <button
              onClick={handleReset}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              {t('marketing.tools.snsAdMaker.resetButton')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
