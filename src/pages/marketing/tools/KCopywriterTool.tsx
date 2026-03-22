import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, PenTool, Copy, CheckCircle, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateCopy } from '../../../services/gemini/copywriterService';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import type { CopywriterOutput } from '../../../types/marketing';

type Tone = 'emotional' | 'fun' | 'serious' | 'trendy' | 'storytelling';
type CopyLength = 'short' | 'medium' | 'long';

export default function KCopywriterTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logActivity } = usePortfolio();

  const toneOptions: { value: Tone; label: string; emoji: string; desc: string }[] = [
    { value: 'emotional', label: t('marketing.tools.kCopywriter.toneEmotional'), emoji: '💖', desc: t('marketing.tools.kCopywriter.toneEmotionalDesc') },
    { value: 'fun', label: t('marketing.tools.kCopywriter.toneFun'), emoji: '😄', desc: t('marketing.tools.kCopywriter.toneFunDesc') },
    { value: 'serious', label: t('marketing.tools.kCopywriter.toneProfessional'), emoji: '💼', desc: t('marketing.tools.kCopywriter.toneProfessionalDesc') },
    { value: 'trendy', label: '트렌디', emoji: '😎', desc: '최신 유행 감각' },
    { value: 'storytelling', label: '스토리텔링', emoji: '📖', desc: '이야기로 전달' },
  ];

  const [productName, setProductName] = useState('');
  const [target, setTarget] = useState('');
  const [tone, setTone] = useState<Tone>('emotional');
  const [copyLength, setCopyLength] = useState<CopyLength>('medium');
  const [result, setResult] = useState<CopywriterOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const canGenerate = productName.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setResult(null);

    try {
      const output = await generateCopy({ productName, target, tone, length: copyLength });
      setResult(output);

      logActivity(
        'k-copywriter', 'mk-07', 'K-Copywriter',
        { productName, target, tone, length: copyLength },
        { copies: output.copies, isMockData: output.isMockData },
        output.isMockData
      );
    } catch {
      // fallback handled in service
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setResult(null);
    setCopiedIdx(null);
  };

  const aiEnabled = isGeminiEnabled();

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
          <PenTool className="w-6 h-6 md:w-8 md:h-8" />
          <h1 className="text-xl md:text-2xl font-bold">{t('marketing.tools.kCopywriter.title', 'K-카피라이터')}</h1>
          {aiEnabled && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">✨ AI 연결됨</span>
          )}
        </div>
        <p className="text-blue-100">{t('marketing.tools.kCopywriter.description', 'AI가 한국형 광고 카피를 만들어드려요')}</p>
      </div>

      {!aiEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            {t('marketing.tools.kCopywriter.noAiMessage')}
            <button
              onClick={() => navigate('/marketing')}
              className="ml-1 text-blue-600 hover:underline font-medium"
            >
              {t('marketing.tools.kCopywriter.connectAi')}
            </button>
          </p>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('marketing.tools.kCopywriter.productLabel')}</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t('marketing.tools.kCopywriter.productPlaceholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('marketing.tools.kCopywriter.targetLabel')}</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={t('marketing.tools.kCopywriter.targetPlaceholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('marketing.tools.kCopywriter.toneLabel')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {toneOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    tone === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{opt.emoji}</span>
                  <span className={`text-sm font-semibold block ${tone === opt.value ? 'text-blue-600' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-400 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Length Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">카피 길이</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setCopyLength('short')}
                className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                  copyLength === 'short'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-sm font-semibold block">한줄</span>
                <span className="text-xs text-gray-400 block">짧고 임팩트</span>
              </button>
              <button
                onClick={() => setCopyLength('medium')}
                className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                  copyLength === 'medium'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-sm font-semibold block">2-3줄</span>
                <span className="text-xs text-gray-400 block">적당한 설명</span>
              </button>
              <button
                onClick={() => setCopyLength('long')}
                className={`py-3 px-4 rounded-xl border-2 text-center transition-all ${
                  copyLength === 'long'
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-sm font-semibold block">5줄+</span>
                <span className="text-xs text-gray-400 block">상세한 내용</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              canGenerate && !loading
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('marketing.tools.kCopywriter.generating')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t('marketing.tools.kCopywriter.generateButton')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {result.isMockData ? t('marketing.tools.kCopywriter.sampleLabel') : t('marketing.tools.kCopywriter.aiLabel')}
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              {t('marketing.tools.kCopywriter.resetButton')}
            </button>
          </div>

          <div className="space-y-3">
            {result.copies.map((copy, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <p className="text-gray-800 text-lg leading-relaxed mb-3">"{copy}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{t('marketing.tools.kCopywriter.optionPrefix')} {idx + 1}</span>
                    <span className="text-xs text-blue-500 font-medium">{copy.length}자</span>
                  </div>
                  <button
                    onClick={() => handleCopy(copy, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t('marketing.tools.kCopywriter.copySuccess')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('marketing.tools.kCopywriter.copyButton')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {result.isMockData && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                {t('marketing.tools.kCopywriter.sampleNote')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
