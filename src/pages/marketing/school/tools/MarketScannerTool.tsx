import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Radar, Search, Copy, Check, ChevronDown, ChevronUp, ArrowRight, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { generateMarketAnalysis } from '../../../../services/gemini/marketCompassService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import { useUserProfile } from '../../../../lib/userProfile';
import type { MarketScannerResult } from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { addIdeaBoxItem } from '../../../../services/ideaBoxService';
import { SimpleMarkdown } from '@/components/common/SimpleMarkdown';
import { PlusListInput } from './common/PlusListInput';
import { SaveToGemBoxButton } from './common/SaveToGemBoxButton';

type Phase = 'input' | 'loading' | 'result';

const AGE_OPTIONS = ['10s', '20s', '30s', '40s', '50plus'] as const;
const GENDER_OPTIONS = ['female', 'male', 'all'] as const;
const ITEM_TYPE_OPTIONS = ['service', 'physical', 'digital', 'food', 'fashion', 'beauty', 'education', 'other'] as const;

export default function MarketScannerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
  const {
    hasStamp, autoStamp,
    marketScannerResult: savedScannerResult,
    saveMarketScannerResult,
  } = useSchoolProgress();
  const completed = hasStamp('market-scanner');

  const [phase, setPhase] = useState<Phase>('input');
  // mockup 확정안: 키워드 1개 → +버튼 리스트로 여러 개 입력 (최대 5)
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [targetAge, setTargetAge] = useState<string>('20s');
  const [targetGender, setTargetGender] = useState<string>('all');
  const [itemType, setItemType] = useState<string>('other');
  const [result, setResult] = useState<MarketScannerResult | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedCompetitor, setExpandedCompetitor] = useState<number | null>(0);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [savedToTeamBox, setSavedToTeamBox] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiEnabled = isGeminiEnabled();

  // 이전 결과 확인
  useEffect(() => {
    if (savedScannerResult) {
      setHasPreviousResult(true);
    }
  }, [savedScannerResult]);

  // Load team info
  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then(info => {
      if (info) setMyTeamId(info.team.id);
    });
  }, [user]);

  const loadPreviousResult = useCallback(() => {
    if (!savedScannerResult) return;
    setResult(savedScannerResult);
    // 이전 데이터는 단일 키워드였을 수 있음 → 콤마/슬래시로 분리
    const parts = savedScannerResult.input.itemKeyword
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setKeywords(parts.length > 0 ? parts : [savedScannerResult.input.itemKeyword]);
    setTargetAge(savedScannerResult.input.targetAge);
    setTargetGender(savedScannerResult.input.targetGender);
    setItemType(savedScannerResult.input.itemType || 'other');
    setPhase('result');
  }, [savedScannerResult]);

  const cleanKeywords = keywords.filter((k) => k.trim());
  const keywordForAnalysis = cleanKeywords.join(' / ');

  const handleAnalyze = async () => {
    if (cleanKeywords.length === 0) return;

    setPhase('loading');
    setLoadingStep(0);
    setAiError(null);

    // 로딩 스텝 애니메이션
    const timer1 = setTimeout(() => setLoadingStep(1), 1200);
    const timer2 = setTimeout(() => setLoadingStep(2), 2400);

    try {
      const { result: output, isMock: mock } = await generateMarketAnalysis(keywordForAnalysis, targetAge, targetGender, itemType, profile);

      // 최소 3초 대기
      await new Promise((resolve) => setTimeout(resolve, 3500));

      const scannerResult: MarketScannerResult = {
        completedAt: new Date().toISOString(),
        input: { itemKeyword: keywordForAnalysis, targetAge, targetGender, itemType },
        output,
      };

      setResult(scannerResult);
      setIsMock(mock);

      if (mock && aiEnabled) {
        setAiError('AI 응답을 처리하지 못했어요. 예시 데이터를 보여드릴게요.');
      }

      // 저장 + 자동 스탬프
      if (user) {
        saveMarketScannerResult(scannerResult);
        autoStamp('market-scanner');
      }

      setPhase('result');
    } catch {
      setPhase('input');
      setAiError('시장 분석 생성에 실패했어요. 다시 시도해주세요.');
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

  const handleComplete = () => {
    navigate('/marketing/school/tools/edge-maker');
  };

  const handleReanalyze = () => {
    setResult(null);
    setPhase('input');
    setHasPreviousResult(false);
  };

  const handleSaveToTeamBox = async () => {
    if (!user || !result) return;
    const title = `🔍 ${result.input.itemKeyword}`;
    const content = [
      `키워드: ${result.output.relatedKeywords.map(k => `#${k}`).join(' ')}`,
      `고객의 소리: ${result.output.painPoints.join(' / ')}`,
      result.output.analysisReport ? `\n분석:\n${result.output.analysisReport}` : '',
    ].filter(Boolean).join('\n');
    await addIdeaBoxItem({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'tool-result',
      title,
      content,
      toolId: 'market-scanner',
    });
    if (myTeamId) {
      await addTeamIdea(myTeamId, user.id, user.name, '🔍', 'market-scanner', title, content);
    }
    setSavedToTeamBox(true);
    setTimeout(() => setSavedToTeamBox(false), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-kk-navy transition-colors"
    >
      {copiedField === field ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-500">{t('school.marketCompass.scanner.result.copied')}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{t('school.marketCompass.scanner.result.copy')}</span>
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
            <span className="text-xs font-bold text-kk-navy bg-kk-cream px-2 py-0.5 rounded">
              {t('school.marketCompass.scanner.headerBadge')}
            </span>
            <h1 className="font-bold text-kk-brown">{t('school.marketCompass.scanner.title')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Hero */}
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-kk-cream rounded-2xl flex items-center justify-center">
            <Radar className="w-8 h-8 text-kk-navy" />
          </div>
          <h2 className="text-xl font-bold text-kk-brown">{t('school.marketCompass.scanner.hero')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('school.marketCompass.scanner.heroSub')}</p>
        </div>

        {/* ─── AI 미연결 안내 ─── */}
        {!aiEnabled && phase !== 'loading' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">AI 비서가 연결되지 않았어요</h3>
                <p className="text-xs text-amber-700 mb-3">API 키를 연결하면 AI가 나만의 시장 분석을 해줘요. 지금은 예시 데이터로 체험할 수 있어요.</p>
                <button onClick={() => navigate('/ai-welcome')} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors">
                  <Key className="w-3.5 h-3.5" /> API 키 연결하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── INPUT PHASE ─── */}
        {phase === 'input' && (
          <div className="space-y-4">
            {/* 이전 결과 배너 */}
            {hasPreviousResult && (
              <div className="bg-kk-cream border border-kk-warm rounded-xl p-4">
                <p className="text-sm text-kk-navy font-medium">{t('school.marketCompass.scanner.previousResult')}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={loadPreviousResult}
                    className="flex-1 py-2 text-sm bg-kk-navy text-white rounded-lg font-medium hover:bg-kk-navy-deep transition-colors"
                  >
                    {t('school.marketCompass.scanner.viewPrevious')}
                  </button>
                  <button
                    onClick={() => setHasPreviousResult(false)}
                    className="flex-1 py-2 text-sm bg-white text-kk-navy border border-kk-navy/30 rounded-lg font-medium hover:bg-kk-cream transition-colors"
                  >
                    {t('school.marketCompass.scanner.startNew')}
                  </button>
                </div>
              </div>
            )}

            {/* 입력 폼 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-kk-brown">{t('school.marketCompass.scanner.inputTitle')}</h3>

              {/* 키워드 (여러 개) */}
              <PlusListInput
                label="키워드 *"
                items={keywords}
                onChange={setKeywords}
                placeholder="예: 유기농 캡슐커피"
                max={5}
                helpText="💡 팁: 구체적일수록 좋아요. '커피'는 너무 넓어요 → '사무실용 캡슐커피'"
                addButtonText="➕ 키워드 추가하기 (5개까지)"
              />

              {/* 아이템 형태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('school.marketCompass.scanner.itemType')}
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-navy bg-white"
                >
                  {ITEM_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {t(`school.marketCompass.scanner.itemTypes.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 타겟 연령 + 성별 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('school.marketCompass.scanner.targetAge')}
                  </label>
                  <select
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-navy bg-white"
                  >
                    {AGE_OPTIONS.map((age) => (
                      <option key={age} value={age}>
                        {t(`school.marketCompass.scanner.ages.${age}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('school.marketCompass.scanner.targetGender')}
                  </label>
                  <select
                    value={targetGender}
                    onChange={(e) => setTargetGender(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-navy bg-white"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {t(`school.marketCompass.scanner.genders.${g}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 분석 버튼 */}
              <button
                onClick={handleAnalyze}
                disabled={cleanKeywords.length === 0}
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                분석 시작 →
              </button>
            </div>
          </div>
        )}

        {/* ─── LOADING PHASE ─── */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <Radar className="w-16 h-16 text-kk-navy animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
                    loadingStep >= step ? 'bg-kk-cream text-kk-navy' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full transition-colors ${loadingStep >= step ? 'bg-kk-navy' : 'bg-gray-300'}`} />
                  <span className="text-sm font-medium">
                    {t(`school.marketCompass.scanner.loading.step${step + 1}`)}
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
                {isMock ? t('school.marketCompass.scanner.result.mockBadge') : t('school.marketCompass.scanner.result.aiBadge')}
              </span>
            </div>

            {/* AI 실패 안내 + 재시도 */}
            {isMock && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-700 mb-2">
                  {aiError || (aiEnabled ? 'AI 응답을 가져오지 못해서 예시 데이터를 보여드리고 있어요.' : 'API 키가 연결되지 않아 예시 데이터를 보여드리고 있어요.')}
                </p>
                <div className="flex gap-2">
                  {aiEnabled ? (
                    <button onClick={handleReanalyze} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                      <RefreshCw className="w-3 h-3" /> AI로 다시 분석하기
                    </button>
                  ) : (
                    <button onClick={() => navigate('/ai-welcome')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                      <Key className="w-3 h-3" /> API 키 연결하기
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 연관 검색어 TOP 5 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  {t('school.marketCompass.scanner.result.keywordsTitle')}
                </h3>
                <CopyButton
                  text={result.output.relatedKeywords.map((k) => `#${k}`).join(' ')}
                  field="keywords"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {result.output.relatedKeywords.map((kw, i) => (
                  <span
                    key={kw}
                    className="px-3 py-1.5 bg-kk-cream text-kk-navy rounded-full text-sm font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 경쟁사 분석 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-kk-brown flex items-center gap-2 mb-3">
                <span className="text-lg">🏢</span>
                {t('school.marketCompass.scanner.result.competitorsTitle')}
              </h3>
              <div className="space-y-2">
                {result.output.competitors.map((comp, i) => (
                  <div key={comp.name} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCompetitor(expandedCompetitor === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <span className="font-medium text-gray-800">{comp.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{comp.description}</span>
                      </div>
                      {expandedCompetitor === i ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedCompetitor === i && (
                      <div className="px-4 pb-3 space-y-2">
                        <div>
                          <span className="text-xs font-bold text-green-600">
                            ✅ {t('school.marketCompass.scanner.result.strengths')}
                          </span>
                          <ul className="mt-1 space-y-0.5">
                            {comp.strengths.map((s, j) => (
                              <li key={j} className="text-sm text-gray-600 pl-4">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-red-500">
                            ❌ {t('school.marketCompass.scanner.result.weaknesses')}
                          </span>
                          <ul className="mt-1 space-y-0.5">
                            {comp.weaknesses.map((w, j) => (
                              <li key={j} className="text-sm text-gray-600 pl-4">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 고객의 소리 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  {t('school.marketCompass.scanner.result.painPointsTitle')}
                </h3>
                <CopyButton
                  text={result.output.painPoints.join('\n')}
                  field="painPoints"
                />
              </div>
              <div className="space-y-2">
                {result.output.painPoints.map((pain, i) => (
                  <div
                    key={pain}
                    className="flex items-start gap-3 bg-kk-cream rounded-xl px-4 py-3"
                  >
                    <span className="text-kk-red text-sm mt-0.5">★</span>
                    <p className="text-sm text-gray-700 leading-relaxed">"{pain}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 분석 레포트 */}
            {result.output.analysisReport && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-kk-brown flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    {t('school.marketCompass.scanner.result.analysisReportTitle')}
                  </h3>
                  <CopyButton
                    text={result.output.analysisReport}
                    field="analysisReport"
                  />
                </div>
                <SimpleMarkdown content={result.output.analysisReport} className="text-sm text-gray-700 leading-relaxed bg-kk-bg rounded-xl p-4" />
              </div>
            )}

            {/* 결과를 아이디어보석함에 저장하기 */}
            <SaveToGemBoxButton onSave={handleSaveToTeamBox} saved={savedToTeamBox} />

            {/* 다음 단계 */}
            <div className="bg-kk-cream rounded-2xl border border-kk-warm p-5">
              <h3 className="font-semibold text-kk-brown text-center mb-3">
                {t('school.marketCompass.scanner.next.title')}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleComplete}
                  className="w-full py-3 bg-kk-red hover:bg-kk-red-deep text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  {t('school.marketCompass.scanner.next.edgeMakerButton')}
                </button>
                <button
                  onClick={handleReanalyze}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {t('school.marketCompass.scanner.reanalyzeButton')}
                </button>
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
