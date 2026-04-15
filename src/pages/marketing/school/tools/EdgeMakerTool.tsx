import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Copy, Check, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { generateBrandingStrategy } from '../../../../services/gemini/marketCompassService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import { useUserProfile } from '../../../../lib/userProfile';
import type { EdgeMakerResult, CompetitorInfo } from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { addIdeaBoxItem } from '../../../../services/ideaBoxService';
import { SimpleMarkdown } from '@/components/common/SimpleMarkdown';
import { PlusListInput } from './common/PlusListInput';
import { SaveToGemBoxButton } from './common/SaveToGemBoxButton';

type Phase = 'input' | 'loading' | 'result';

export default function EdgeMakerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
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
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [scannerLoaded, setScannerLoaded] = useState(false);
  const [result, setResult] = useState<EdgeMakerResult | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  // mockup 확정안: 자동 로드 → 수동 로드 버튼
  // 기존 EdgeMaker 결과가 있으면 그것만 복원
  useEffect(() => {
    if (!user || isLoading) return;
    if (savedEdgeResult) {
      setResult(savedEdgeResult);
      setPainPoints(savedEdgeResult.input.painPoints);
      setStrengths(
        savedEdgeResult.input.myStrengths.length > 0 ? savedEdgeResult.input.myStrengths : [''],
      );
      setCompetitors(savedEdgeResult.input.competitors || []);
      setPhase('result');
    }
  }, [user, isLoading, savedEdgeResult]);

  // 2교시 마켓스캐너 데이터 수동 불러오기
  const handleLoadScannerData = () => {
    if (!savedScannerResult) {
      alert('2교시 마켓스캐너 결과가 없어요. 먼저 2교시를 완료해주세요.');
      return;
    }
    setPainPoints(savedScannerResult.output.painPoints);
    setCompetitors(savedScannerResult.output.competitors || []);
    setScannerLoaded(true);
  };

  const handleGenerate = async () => {
    setPhase('loading');
    setLoadingStep(0);
    setAiError(null);

    const timer1 = setTimeout(() => setLoadingStep(1), 1200);
    const timer2 = setTimeout(() => setLoadingStep(2), 2400);

    const cleanStrengths = strengths.filter((s) => s.trim());

    try {
      const { result: output, isMock: mock } = await generateBrandingStrategy(painPoints, cleanStrengths, competitors, profile);

      await new Promise((resolve) => setTimeout(resolve, 3500));

      const edgeResult: EdgeMakerResult = {
        completedAt: new Date().toISOString(),
        input: { painPoints, myStrengths: cleanStrengths, competitors },
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
    if (!user || !result) return;
    const brandName = result.output.brandNames?.[0]?.name || 'Brand';
    const title = `⚡ ${brandName}`;
    const content = [
      `USP: ${result.output.usp}`,
      `슬로건: "${result.output.slogan}"`,
      `브랜드: ${result.output.brandNames.map(b => `${b.name} (${b.type})`).join(', ')}`,
    ].join('\n');
    await addIdeaBoxItem({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'tool-result',
      title,
      content,
      toolId: 'edge-maker',
    });
    if (myTeamId) {
      await addTeamIdea(myTeamId, user.id, user.name, '⚡', 'edge-maker', title, content);
    }
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
        {phase === 'input' && (
          <div className="space-y-4">
            {/* 2교시 데이터 불러오기 버튼 (mockup 확정안) */}
            {!scannerLoaded && painPoints.length === 0 && (
              <button
                onClick={handleLoadScannerData}
                className="w-full py-2.5 bg-gray-50 text-gray-500 border border-dashed border-gray-300 rounded-xl text-sm hover:bg-gray-100"
              >
                📥 2교시 마켓스캐너 데이터 불러오기
              </button>
            )}

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

            {/* 나의 강점 입력 (+버튼 리스트) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <PlusListInput
                label="나의 강점"
                items={strengths}
                onChange={setStrengths}
                placeholder="예: 3분 추출"
                max={5}
                addButtonText="➕ 강점 추가하기 (5개까지)"
              />
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={strengths.filter((s) => s.trim()).length === 0}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5" />
              생성하기 →
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

            {/* 결과를 아이디어보석함에 저장하기 */}
            <SaveToGemBoxButton onSave={handleSaveToTeamBox} saved={savedToTeamBox} />

            {/* 다음 교시 CTA */}
            <div className="bg-blue-50 border border-dashed border-blue-300 rounded-xl p-3 text-center">
              <button
                onClick={() => navigate('/marketing/school/tools/viral-card-maker')}
                className="text-blue-700 font-bold text-sm"
              >
                다음 · 4교시 바이럴카드 → 이 USP로 바이럴 포스트 만들기 →
              </button>
            </div>

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
