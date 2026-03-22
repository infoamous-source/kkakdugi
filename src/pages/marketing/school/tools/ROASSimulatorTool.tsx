import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, Loader2, Sparkles, Copy, Check,
  RefreshCw, ChevronDown, ChevronUp, Gem, Key,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { simulateROAS } from '../../../../services/gemini/roasSimulatorService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import type { ROASSimulationInput, ROASSimulationOutput } from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { SimpleMarkdown } from '@/components/common/SimpleMarkdown';

type Phase = 'input' | 'loading' | 'result';

const CHANNEL_OPTIONS: { value: ROASSimulationInput['adChannel']; emoji: string; labelKey: string; descKey: string }[] = [
  { value: 'instagram', emoji: '\uD83D\uDCF8', labelKey: 'school.roasSimulator.channel.instagram', descKey: 'school.roasSimulator.channel.instagramDesc' },
  { value: 'naver', emoji: '\uD83D\uDFE2', labelKey: 'school.roasSimulator.channel.naver', descKey: 'school.roasSimulator.channel.naverDesc' },
  { value: 'kakao', emoji: '\uD83D\uDCAC', labelKey: 'school.roasSimulator.channel.kakao', descKey: 'school.roasSimulator.channel.kakaoDesc' },
  { value: 'youtube', emoji: '\u25B6\uFE0F', labelKey: 'school.roasSimulator.channel.youtube', descKey: 'school.roasSimulator.channel.youtubeDesc' },
];

const BUDGET_PRESETS = [100000, 300000, 500000, 1000000];
const DURATION_OPTIONS: (7 | 14 | 30)[] = [7, 14, 30];

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  excellent: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  good: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  average: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  poor: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}${'\uB9CC'}`;
  return n.toLocaleString();
}

function formatWon(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}\uC5B5\uC6D0`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}\uB9CC\uC6D0`;
  return `${n.toLocaleString()}\uC6D0`;
}

export default function ROASSimulatorTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    hasStamp, autoStamp, progress,
    marketScannerResult: savedScannerResult,
    edgeMakerResult: savedEdgeResult,
    saveSimulationResult,
  } = useSchoolProgress();
  const completed = hasStamp('roas-simulator');

  // Phase
  const [phase, setPhase] = useState<Phase>('input');

  // Input
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [adBudget, setAdBudget] = useState(300000);
  const [adChannel, setAdChannel] = useState<ROASSimulationInput['adChannel']>('instagram');
  const [targetAge, setTargetAge] = useState('20s');
  const [duration, setDuration] = useState<7 | 14 | 30>(14);
  const [showEducation, setShowEducation] = useState(false);
  const [prevDataLoaded, setPrevDataLoaded] = useState(false);

  // Loading
  const [loadingStep, setLoadingStep] = useState(0);

  // Result
  const [result, setResult] = useState<ROASSimulationOutput | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [animatedROAS, setAnimatedROAS] = useState(0);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [savedToTeamBox, setSavedToTeamBox] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiEnabled = isGeminiEnabled();

  // Load team info
  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then(info => {
      if (info) setMyTeamId(info.team.id);
    });
  }, [user]);

  // Load previous data
  useEffect(() => {
    if (!user) return;

    // Check for previous simulation result
    if (progress?.simulationResult?.output) {
      setResult(progress.simulationResult.output);
      if (progress.simulationResult.input) {
        setProductName(progress.simulationResult.input.productName);
        setProductPrice(String(progress.simulationResult.input.productPrice));
        setAdBudget(progress.simulationResult.input.adBudget);
        setAdChannel(progress.simulationResult.input.adChannel);
        setTargetAge(progress.simulationResult.input.targetAge);
        setDuration(progress.simulationResult.input.duration);
      }
      setPhase('result');
      return;
    }

    // Load data from previous periods
    if (savedEdgeResult) {
      const brandName = savedEdgeResult.output.brandNames?.[0]?.name || '';
      if (brandName) setProductName(brandName);
      setPrevDataLoaded(true);
    }

    if (savedScannerResult?.input?.targetAge) {
      setTargetAge(savedScannerResult.input.targetAge);
    }
  }, [user, progress, savedEdgeResult, savedScannerResult]);

  // ROAS animation
  useEffect(() => {
    if (!result) return;
    setAnimatedROAS(0);
    const target = result.estimatedROAS;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedROAS(target);
        clearInterval(timer);
      } else {
        setAnimatedROAS(Number(current.toFixed(1)));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [result]);

  // Copy helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* noop */ }
  };

  // Generate
  const handleSimulate = async () => {
    const price = Number(productPrice);
    if (!productName.trim() || !price || price <= 0) return;

    setPhase('loading');
    setLoadingStep(0);
    setAiError(null);

    const steps = [{ delay: 0 }, { delay: 1200 }, { delay: 2400 }];
    steps.forEach(({ delay }, i) => {
      if (i > 0) setTimeout(() => setLoadingStep(i), delay);
    });

    try {
      const input: ROASSimulationInput = {
        productName: productName.trim(),
        productPrice: price,
        adBudget,
        adChannel,
        targetAge,
        duration,
      };

      // Get context from previous periods
      const { result: simResult, isMock: mock } = await simulateROAS(input, {
        usp: savedEdgeResult?.output.usp,
        brandMood: savedEdgeResult?.output.brandMood?.tone,
      });

      await new Promise((r) => setTimeout(r, 3500));

      setResult(simResult);
      setIsMock(mock);
      setPhase('result');

      if (mock && aiEnabled) {
        setAiError('AI 응답을 처리하지 못했어요. 예시 데이터를 보여드릴게요.');
      }

      if (user) {
        saveSimulationResult({
          completedAt: new Date().toISOString(),
          input,
          output: simResult,
          roas: simResult.estimatedROAS,
          budget: adBudget,
          revenue: simResult.estimatedRevenue,
        });
        autoStamp('roas-simulator');
      }
    } catch (err) {
      console.error('[ROASSimulator] Simulation failed:', err);
      setPhase('input');
      setAiError('ROAS 시뮬레이션에 실패했어요. 다시 시도해주세요.');
    }
  };

  // Copy all results
  const handleCopyAll = () => {
    if (!result) return;
    const text = [
      `=== ROAS ${t('school.roasSimulator.simulationResult')} ===`,
      '',
      `ROAS: ${result.estimatedROAS}x (${t(`school.roasSimulator.grade.${result.roasGrade}`)})`,
      `${t('school.roasSimulator.metrics.budget')}: ${formatWon(adBudget)}`,
      `${t('school.roasSimulator.metrics.revenue')}: ${formatWon(result.estimatedRevenue)}`,
      '',
      `${t('school.roasSimulator.metrics.impressions')}: ${result.estimatedImpressions.toLocaleString()}`,
      `${t('school.roasSimulator.metrics.clicks')}: ${result.estimatedClicks.toLocaleString()} (CTR ${result.estimatedCTR}%)`,
      `${t('school.roasSimulator.metrics.conversions')}: ${result.estimatedConversions.toLocaleString()} (CVR ${result.estimatedCVR}%)`,
      `CPC: ${formatWon(result.costPerClick)}`,
      `CPA: ${formatWon(result.costPerConversion)}`,
      '',
      `[${t('school.roasSimulator.advice')}]`,
      ...result.advice.map((a, i) => `${i + 1}. ${a}`),
      '',
      `[${t('school.roasSimulator.channelTip')}]`,
      result.channelTip,
    ].join('\n');
    copyToClipboard(text, 'all');
  };

  const handleSaveToTeamBox = async () => {
    if (!user || !result || !myTeamId) return;
    const title = `📊 ${productName} ROAS ${result.estimatedROAS}x`;
    const content = [
      `ROAS: ${result.estimatedROAS}x (${t(`school.roasSimulator.grade.${result.roasGrade}`)})`,
      `예산: ${formatWon(adBudget)} → 매출: ${formatWon(result.estimatedRevenue)}`,
      `조언: ${result.advice[0] || ''}`,
    ].join('\n');
    await addTeamIdea(myTeamId, user.id, user.name, '📊', 'roas-simulator', title, content);
    setSavedToTeamBox(true);
    setTimeout(() => setSavedToTeamBox(false), 2000);
  };

  const isInputValid = productName.trim().length > 0 && Number(productPrice) > 0;

  const loadingSteps = [
    t('school.roasSimulator.loading.step1'),
    t('school.roasSimulator.loading.step2'),
    t('school.roasSimulator.loading.step3'),
  ];

  // Funnel chart data
  const funnelData = result ? [
    { name: t('school.roasSimulator.funnel.impressions'), value: result.estimatedImpressions, fill: '#818CF8' },
    { name: t('school.roasSimulator.funnel.clicks'), value: result.estimatedClicks, fill: '#60A5FA' },
    { name: t('school.roasSimulator.funnel.conversions'), value: result.estimatedConversions, fill: '#34D399' },
  ] : [];

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-kk-red bg-kk-cream px-2 py-0.5 rounded">6{t('school.curriculum.period')}</span>
            <h1 className="font-bold text-kk-brown">{t('school.periods.roasSimulator.name')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* ─── AI 미연결 안내 ─── */}
        {!aiEnabled && phase !== 'loading' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">AI 비서가 연결되지 않았어요</h3>
                <p className="text-xs text-amber-700 mb-3">API 키를 연결하면 AI가 나만의 ROAS 시뮬레이션을 해줘요. 지금은 예시 데이터로 체험할 수 있어요.</p>
                <button onClick={() => navigate('/ai-welcome')} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
                  <Key className="w-3.5 h-3.5" /> API 키 연결하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ INPUT PHASE ══════ */}
        {phase === 'input' && (
          <>
            {/* Hero */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-kk-cream rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-kk-red" />
              </div>
              <h2 className="text-lg font-bold text-kk-brown mb-1">{t('school.roasSimulator.title')}</h2>
              <p className="text-sm text-gray-500">{t('school.roasSimulator.subtitle')}</p>
            </div>

            {/* ROAS Education */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowEducation(!showEducation)}
                className="w-full px-5 py-3 flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-kk-brown">{t('school.roasSimulator.educationTitle')}</span>
                {showEducation ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showEducation && (
                <div className="px-5 pb-4 space-y-3">
                  <p className="text-sm text-gray-600">{t('school.roasSimulator.education.whatIsROAS')}</p>
                  <div className="bg-kk-cream rounded-xl p-3 text-sm">
                    <p className="font-bold text-kk-brown mb-1">{t('school.roasSimulator.education.example')}</p>
                    <p className="text-kk-brown">{t('school.roasSimulator.education.exampleText')}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 text-right font-bold text-green-600">3.0+</span>
                      <span className="flex-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{t('school.roasSimulator.grade.excellent')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 text-right font-bold text-blue-600">2.0+</span>
                      <span className="flex-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{t('school.roasSimulator.grade.good')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 text-right font-bold text-yellow-600">1.0+</span>
                      <span className="flex-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">{t('school.roasSimulator.grade.average')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-20 text-right font-bold text-red-600">&lt;1.0</span>
                      <span className="flex-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{t('school.roasSimulator.grade.poor')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prev Data Badge */}
            {prevDataLoaded && (
              <div className="bg-kk-cream border border-kk-warm rounded-xl px-4 py-2 text-xs text-kk-brown font-medium">
                {t('school.roasSimulator.prevDataLoaded')}
              </div>
            )}

            {/* Input Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('school.roasSimulator.input.productName')}</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value.slice(0, 30))}
                  placeholder={t('school.roasSimulator.input.productNamePlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('school.roasSimulator.input.productPrice')}</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="15000"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                />
              </div>
            </div>

            {/* Budget Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('school.roasSimulator.input.adBudget')}</label>
              <p className="text-xs text-gray-400 mb-3">{t('school.roasSimulator.input.adBudgetHint', '광고에 사용할 예산을 원 단위로 입력하세요')}</p>
              <input
                type="number"
                value={adBudget || ''}
                onChange={(e) => setAdBudget(Number(e.target.value))}
                placeholder="300000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red mb-2"
              />
              <div className="flex gap-1.5 flex-wrap">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAdBudget(preset)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      adBudget === preset
                        ? 'bg-kk-red text-white'
                        : 'bg-kk-cream text-kk-brown hover:bg-kk-warm'
                    }`}
                  >
                    {formatWon(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('school.roasSimulator.input.duration')}</label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      duration === d
                        ? 'bg-kk-red text-white'
                        : 'bg-kk-cream text-kk-brown hover:bg-kk-warm'
                    }`}
                  >
                    {d}{t('school.roasSimulator.days')}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('school.roasSimulator.input.adChannel')}</label>
              <div className="grid grid-cols-2 gap-2">
                {CHANNEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAdChannel(opt.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      adChannel === opt.value
                        ? 'border-kk-red bg-kk-cream'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{opt.emoji}</div>
                    <div className="text-xs font-bold text-gray-700">{t(opt.labelKey)}</div>
                    <div className="text-[10px] text-gray-500">{t(opt.descKey)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulate Button */}
            <button
              onClick={handleSimulate}
              disabled={!isInputValid}
              className="w-full py-3.5 bg-kk-red hover:bg-kk-red-deep text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              {t('school.roasSimulator.simulateButton')}
            </button>
          </>
        )}

        {/* ══════ LOADING PHASE ══════ */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-kk-cream rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-kk-red animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-600">{loadingSteps[loadingStep]}</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= loadingStep ? 'bg-kk-red' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        )}

        {/* ══════ RESULT PHASE ══════ */}
        {phase === 'result' && result && (
          <>
            {/* AI/Mock Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isMock ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              <Sparkles className="w-3 h-3" />
              {isMock ? t('school.roasSimulator.mockBadge') : t('school.roasSimulator.aiBadge')}
            </div>

            {/* AI 실패 안내 + 재시도 */}
            {isMock && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-700 mb-2">
                  {aiError || (aiEnabled ? 'AI 응답을 가져오지 못해서 예시 데이터를 보여드리고 있어요.' : 'API 키가 연결되지 않아 예시 데이터를 보여드리고 있어요.')}
                </p>
                <div className="flex gap-2">
                  {aiEnabled ? (
                    <button onClick={() => { setResult(null); setPhase('input'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                      <RefreshCw className="w-3 h-3" /> AI로 다시 시뮬레이션하기
                    </button>
                  ) : (
                    <button onClick={() => navigate('/ai-welcome')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                      <Key className="w-3 h-3" /> API 키 연결하기
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ROAS Score */}
            {(() => {
              const gc = GRADE_COLORS[result.roasGrade];
              return (
                <div className={`${gc.bg} border ${gc.border} rounded-2xl p-6 text-center`}>
                  <p className="text-sm text-gray-500 mb-1">{t('school.roasSimulator.expectedROAS')}</p>
                  <p className={`text-5xl font-black ${gc.text}`}>{animatedROAS.toFixed(1)}x</p>
                  <p className={`text-sm font-bold mt-1 ${gc.text}`}>
                    {t(`school.roasSimulator.grade.${result.roasGrade}`)}
                  </p>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">{t('school.roasSimulator.metrics.budget')}</p>
                      <p className="font-bold text-gray-700">{formatWon(adBudget)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">{t('school.roasSimulator.metrics.revenue')}</p>
                      <p className="font-bold text-gray-700">{formatWon(result.estimatedRevenue)}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t('school.roasSimulator.metrics.impressions'), value: formatNumber(result.estimatedImpressions), emoji: '\uD83D\uDC40' },
                { label: t('school.roasSimulator.metrics.clicks'), value: `${formatNumber(result.estimatedClicks)} (CTR ${result.estimatedCTR}%)`, emoji: '\uD83D\uDC46' },
                { label: t('school.roasSimulator.metrics.conversions'), value: `${result.estimatedConversions}${t('school.roasSimulator.count')} (CVR ${result.estimatedCVR}%)`, emoji: '\uD83D\uDED2' },
                { label: 'CPC / CPA', value: `${formatWon(result.costPerClick)} / ${formatWon(result.costPerConversion)}`, emoji: '\uD83D\uDCB0' },
              ].map((metric, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{metric.emoji}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{metric.label}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Funnel Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">{t('school.roasSimulator.funnelTitle')}</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={funnelData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => typeof value === 'number' ? value.toLocaleString() : String(value)}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Funnel text */}
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
                <span>{formatNumber(result.estimatedImpressions)}</span>
                <span>&rarr;</span>
                <span>{formatNumber(result.estimatedClicks)}</span>
                <span>&rarr;</span>
                <span>{result.estimatedConversions}</span>
              </div>
            </div>

            {/* AI Advice */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">{t('school.roasSimulator.advice')}</h3>
              <div className="space-y-2">
                {result.advice.map((advice, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-kk-cream p-3 rounded-xl">
                    <span className="text-kk-red font-bold">{i + 1}</span>
                    <span className="text-gray-700">{advice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel Tip */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-2">{t('school.roasSimulator.channelTip')}</h3>
              <SimpleMarkdown content={result.channelTip} className="text-sm text-gray-600" />
            </div>

            {/* Action Bar */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyAll}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-kk-cream text-kk-brown font-bold rounded-xl hover:bg-kk-warm transition-colors"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedField === 'all' ? t('school.roasSimulator.copied') : t('school.roasSimulator.copyAll')}
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setPhase('input');
                }}
                aria-label="다시 시뮬레이션"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* 보석함에 넣기 */}
            {myTeamId && (
              <button
                onClick={handleSaveToTeamBox}
                className="w-full py-3 bg-kk-cream hover:bg-kk-warm text-kk-brown font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Gem className="w-4 h-4" />
                {savedToTeamBox ? '보석함에 저장 완료!' : '💎 보석함에 넣기'}
              </button>
            )}

            {/* Completion + Graduation Project */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {completed && (
                <div className="py-3 bg-green-50 text-green-600 font-bold rounded-xl text-center mb-3">
                  {t('school.tools.alreadyCompleted')}
                </div>
              )}
              <button
                onClick={() => navigate('/marketing/school/graduation-project')}
                className="w-full py-3 bg-kk-red hover:bg-kk-red-deep text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {t('school.roasSimulator.goToGraduation')}
              </button>
              <button
                onClick={() => navigate('/marketing/school/curriculum')}
                className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                {t('school.tools.goToAttendance')}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
