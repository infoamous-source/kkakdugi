import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Plus, X, Copy, Check, AlertCircle, Gem, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { generateBrandingStrategy } from '../../../../services/gemini/marketCompassService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import type { EdgeMakerResult, CompetitorInfo } from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { SimpleMarkdown } from '@/components/common/SimpleMarkdown';

type Phase = 'input' | 'loading' | 'result';

export default function EdgeMakerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    hasStamp, autoStamp, isLoading,
    marketScannerResult: savedScannerResult,
    edgeMakerResult: savedEdgeResult,
    saveEdgeMakerResult,
  } = useSchoolProgress();
  const completed = hasStamp('edge-maker');

  const [phase, setPhase] = useState<Phase>('input');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorInfo[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [strengthInput, setStrengthInput] = useState('');
  const [result, setResult] = useState<EdgeMakerResult | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [noScannerData, setNoScannerData] = useState(false);
  const [activeNameTab, setActiveNameTab] = useState(0);
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

  // 마운트 시 MarketScanner 결과 로드
  useEffect(() => {
    if (!user || isLoading) return;

    // 이전 EdgeMaker 결과가 있으면 바로 표시
    if (savedEdgeResult) {
      setResult(savedEdgeResult);
      setPainPoints(savedEdgeResult.input.painPoints);
      setStrengths(savedEdgeResult.input.myStrengths);
      setCompetitors(savedEdgeResult.input.competitors || []);
      setPhase('result');
      setNoScannerData(false);
      return;
    }

    // MarketScanner 결과에서 painPoints + competitors 로드
    if (savedScannerResult) {
      setPainPoints(savedScannerResult.output.painPoints);
      setCompetitors(savedScannerResult.output.competitors || []);
      setNoScannerData(false);
    } else {
      setNoScannerData(true);
    }
  }, [user, isLoading, savedEdgeResult, savedScannerResult]);

  const addStrength = () => {
    const trimmed = strengthInput.trim();
    if (trimmed && strengths.length < 5 && !strengths.includes(trimmed)) {
      setStrengths([...strengths, trimmed]);
      setStrengthInput('');
    }
  };

  const removeStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setPhase('loading');
    setLoadingStep(0);
    setAiError(null);

    const timer1 = setTimeout(() => setLoadingStep(1), 1200);
    const timer2 = setTimeout(() => setLoadingStep(2), 2400);

    try {
      const { result: output, isMock: mock } = await generateBrandingStrategy(painPoints, strengths, competitors);

      await new Promise((resolve) => setTimeout(resolve, 3500));

      const edgeResult: EdgeMakerResult = {
        completedAt: new Date().toISOString(),
        input: { painPoints, myStrengths: strengths, competitors },
        output,
      };

      setResult(edgeResult);
      setIsMock(mock);

      if (mock && aiEnabled) {
        setAiError('AI 응답을 처리하지 못했어요. 예시 데이터를 보여드릴게요.');
      }

      if (user) {
        saveEdgeMakerResult(edgeResult);
        autoStamp('edge-maker');
      }

      setPhase('result');
    } catch {
      setPhase('input');
      setAiError('브랜딩 전략 생성에 실패했어요. 다시 시도해주세요.');
    }

    clearTimeout(timer1);
    clearTimeout(timer2);
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // 복사 실패 무시
    }
  };

  const handleSaveToTeamBox = async () => {
    if (!user || !result || !myTeamId) return;
    const brandName = result.output.brandNames?.[0]?.name || 'Brand';
    const title = `⚡ ${brandName}`;
    const content = [
      `USP: ${result.output.usp}`,
      `슬로건: "${result.output.slogan}"`,
      `브랜드: ${result.output.brandNames.map(b => `${b.name} (${b.type})`).join(', ')}`,
    ].join('\n');
    await addTeamIdea(myTeamId, user.id, user.name, '⚡', 'edge-maker', title, content);
    setSavedToTeamBox(true);
    setTimeout(() => setSavedToTeamBox(false), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-kk-red transition-colors"
    >
      {copiedField === field ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-500">{t('school.marketCompass.edgeMaker.result.copied')}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{t('school.marketCompass.edgeMaker.result.copy')}</span>
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-kk-brown bg-kk-cream px-2 py-0.5 rounded">
              {t('school.marketCompass.edgeMaker.headerBadge')}
            </span>
            <h1 className="font-bold text-kk-brown">{t('school.marketCompass.edgeMaker.title')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Hero */}
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-kk-cream rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-kk-gold" />
          </div>
          <h2 className="text-xl font-bold text-kk-brown">{t('school.marketCompass.edgeMaker.hero')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('school.marketCompass.edgeMaker.heroSub')}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-kk-cream text-kk-brown rounded-full text-xs font-bold">
            ✅ {t('school.marketCompass.edgeMaker.step1Done')}
          </div>
          <div className="w-6 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-kk-warm text-kk-brown rounded-full text-xs font-bold">
            🔥 {t('school.marketCompass.edgeMaker.step2Active')}
          </div>
        </div>

        {/* ─── NO SCANNER DATA ─── */}
        {noScannerData && (
          <div className="bg-kk-cream border border-kk-warm rounded-2xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-kk-gold mx-auto mb-3" />
            <p className="text-sm text-kk-brown font-medium mb-3">
              {t('school.marketCompass.edgeMaker.noScannerData')}
            </p>
            <button
              onClick={() => navigate('/marketing/school/tools/market-scanner')}
              className="px-6 py-2.5 bg-kk-navy text-white rounded-xl font-medium text-sm hover:bg-kk-navy-deep transition-colors"
            >
              {t('school.marketCompass.edgeMaker.goToScanner')}
            </button>
          </div>
        )}

        {/* ─── AI 미연결 안내 ─── */}
        {!aiEnabled && phase !== 'loading' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">
                  AI 비서가 연결되지 않았어요
                </h3>
                <p className="text-xs text-amber-700 mb-3">
                  API 키를 연결하면 AI가 나만의 브랜딩 전략을 만들어줘요.
                  지금은 예시 데이터로 체험할 수 있어요.
                </p>
                <button
                  onClick={() => navigate('/ai-welcome')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors"
                >
                  <Key className="w-3.5 h-3.5" />
                  API 키 연결하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── INPUT PHASE ─── */}
        {phase === 'input' && !noScannerData && (
          <div className="space-y-4">
            {/* 경쟁사 요약 카드 */}
            {competitors.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-kk-brown mb-1">
                  {t('school.marketCompass.edgeMaker.competitorSummaryTitle')}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {t('school.marketCompass.edgeMaker.competitorSummaryFrom')}
                </p>
                <div className="space-y-2">
                  {competitors.map((comp, i) => (
                    <div key={comp.name} className="flex items-start gap-3 bg-kk-cream rounded-xl px-4 py-3">
                      <span className="text-kk-navy text-sm mt-0.5">🏢</span>
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{comp.name}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{comp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pain Points (읽기 전용) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-kk-brown mb-1">
                {t('school.marketCompass.edgeMaker.painPointsTitle')}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {t('school.marketCompass.edgeMaker.painPointsFrom')}
              </p>
              <div className="space-y-2">
                {painPoints.map((pain, i) => (
                  <div key={pain} className="flex items-start gap-2 bg-kk-cream rounded-xl px-4 py-2.5">
                    <span className="text-kk-red text-sm">💬</span>
                    <p className="text-sm text-gray-700">"{pain}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 나의 강점 입력 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-kk-brown mb-1">
                {t('school.marketCompass.edgeMaker.strengthsTitle')}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {t('school.marketCompass.edgeMaker.strengthsHint')}
              </p>

              {/* 입력 필드 */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={strengthInput}
                  onChange={(e) => setStrengthInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStrength()}
                  placeholder={t('school.marketCompass.edgeMaker.strengthsPlaceholder')}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red focus:border-transparent"
                  maxLength={30}
                  disabled={strengths.length >= 5}
                />
                <button
                  onClick={addStrength}
                  disabled={!strengthInput.trim() || strengths.length >= 5}
                  className="px-4 py-2.5 bg-kk-red text-white rounded-xl font-medium text-sm hover:bg-kk-red-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* 강점 태그 목록 */}
              {strengths.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {strengths.map((s, i) => (
                    <div
                      key={s}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-kk-cream text-kk-brown rounded-full text-sm"
                    >
                      <span>🏷 {s}</span>
                      <button onClick={() => removeStrength(i)} className="hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 bg-kk-red hover:bg-kk-red-deep text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {t('school.marketCompass.edgeMaker.generateButton')}
            </button>
          </div>
        )}

        {/* ─── LOADING PHASE ─── */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <Zap className="w-16 h-16 text-kk-gold animate-pulse" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
                    loadingStep >= step ? 'bg-kk-cream text-kk-brown' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full transition-colors ${loadingStep >= step ? 'bg-kk-gold' : 'bg-gray-300'}`} />
                  <span className="text-sm font-medium">
                    {t(`school.marketCompass.edgeMaker.loading.step${step + 1}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RESULT PHASE ─── */}
        {phase === 'result' && result && (
          <div className="space-y-4">
            {/* 데이터 유형 배지 */}
            <div className="flex justify-center">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${isMock ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {isMock ? t('school.marketCompass.edgeMaker.result.mockBadge') : t('school.marketCompass.edgeMaker.result.aiBadge')}
              </span>
            </div>

            {/* AI 실패 안내 + 재시도 */}
            {isMock && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-700 mb-2">
                  {aiError || (aiEnabled
                    ? 'AI 응답을 가져오지 못해서 예시 데이터를 보여드리고 있어요.'
                    : 'API 키가 연결되지 않아 예시 데이터를 보여드리고 있어요.')}
                </p>
                <div className="flex gap-2">
                  {aiEnabled ? (
                    <button
                      onClick={() => { setResult(null); setIsMock(false); setPhase('input'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      AI로 다시 생성하기
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/ai-welcome')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                    >
                      <Key className="w-3 h-3" />
                      API 키 연결하기
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* USP */}
            <div className="bg-kk-cream rounded-2xl border border-kk-warm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  {t('school.marketCompass.edgeMaker.result.uspTitle')}
                </h3>
                <CopyButton text={result.output.usp} field="usp" />
              </div>
              <p className="text-base text-gray-800 leading-relaxed font-medium bg-white/60 rounded-xl p-4">
                "{result.output.usp}"
              </p>
            </div>

            {/* 브랜드 네이밍 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-kk-brown flex items-center gap-2 mb-3">
                <span className="text-lg">🏷</span>
                {t('school.marketCompass.edgeMaker.result.brandNamesTitle')}
              </h3>

              {/* 탭 버튼 */}
              <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                {result.output.brandNames.map((bn, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveNameTab(i)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      activeNameTab === i
                        ? 'bg-white text-kk-red shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t(`school.marketCompass.edgeMaker.result.nameTypes.${bn.type}`)}
                  </button>
                ))}
              </div>

              {/* 탭 내용 */}
              {result.output.brandNames[activeNameTab] && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-gray-800">
                      {result.output.brandNames[activeNameTab].name}
                    </span>
                    <CopyButton
                      text={result.output.brandNames[activeNameTab].name}
                      field={`brandName-${activeNameTab}`}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="text-xs font-bold text-gray-400">
                      {t('school.marketCompass.edgeMaker.result.reasoning')}:
                    </span>{' '}
                    {result.output.brandNames[activeNameTab].reasoning}
                  </p>
                </div>
              )}
            </div>

            {/* 슬로건 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  {t('school.marketCompass.edgeMaker.result.sloganTitle')}
                </h3>
                <CopyButton text={result.output.slogan} field="slogan" />
              </div>
              <p className="text-center text-lg font-bold text-gray-800 py-3">
                "{result.output.slogan}"
              </p>
            </div>

            {/* 브랜드 무드 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  {t('school.marketCompass.edgeMaker.result.brandMoodTitle')}
                </h3>
                <CopyButton
                  text={`${t('school.marketCompass.edgeMaker.result.primaryColor')}: ${result.output.brandMood.primaryColor}\n${t('school.marketCompass.edgeMaker.result.secondaryColor')}: ${result.output.brandMood.secondaryColor}\n${t('school.marketCompass.edgeMaker.result.tone')}: ${result.output.brandMood.tone}\n${t('school.marketCompass.edgeMaker.result.moodKeywords')}: ${result.output.brandMood.keywords.join(', ')}`}
                  field="mood"
                />
              </div>

              {/* 컬러 스와치 */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <div
                    className="w-full h-16 rounded-xl shadow-inner"
                    style={{ backgroundColor: result.output.brandMood.primaryColor }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-1.5">
                    {t('school.marketCompass.edgeMaker.result.primaryColor')}
                  </p>
                  <p className="text-xs text-gray-400 text-center">{result.output.brandMood.primaryColor}</p>
                </div>
                <div className="flex-1">
                  <div
                    className="w-full h-16 rounded-xl shadow-inner"
                    style={{ backgroundColor: result.output.brandMood.secondaryColor }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-1.5">
                    {t('school.marketCompass.edgeMaker.result.secondaryColor')}
                  </p>
                  <p className="text-xs text-gray-400 text-center">{result.output.brandMood.secondaryColor}</p>
                </div>
              </div>

              {/* 톤 & 키워드 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">{t('school.marketCompass.edgeMaker.result.tone')}:</span>
                  <span className="text-sm text-gray-700">{result.output.brandMood.tone}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.output.brandMood.keywords.map((kw, i) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 브랜딩 추천 레포트 */}
            {result.output.brandingReport && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    {t('school.marketCompass.edgeMaker.result.brandingReportTitle')}
                  </h3>
                  <CopyButton
                    text={result.output.brandingReport}
                    field="brandingReport"
                  />
                </div>
                <SimpleMarkdown content={result.output.brandingReport} className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4" />
              </div>
            )}

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

            {/* 완료 섹션 */}
            <div className="bg-kk-cream rounded-2xl border border-kk-warm p-5">
              <h3 className="font-semibold text-kk-brown text-center mb-3">
                {t('school.marketCompass.edgeMaker.complete.title')}
              </h3>
              <div className="space-y-2">
                {completed && (
                  <div className="py-3 bg-green-50 text-green-600 font-bold rounded-xl text-center">
                    {t('school.tools.alreadyCompleted')}
                  </div>
                )}
                <button
                  onClick={() => navigate('/marketing/school/curriculum')}
                  className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t('school.tools.goToAttendance')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
