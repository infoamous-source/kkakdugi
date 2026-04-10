import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Key } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { generateSalesPlan } from '../../../../services/gemini/perfectPlannerService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import type {
  PerfectPlannerResult,
  PerfectPlannerInput,
  PlannerMode,
  DetailPagePlan,
  LiveScript,
} from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { addIdeaBoxItem } from '../../../../services/ideaBoxService';
import { PlusListInput } from './common/PlusListInput';
import { SaveToGemBoxButton } from './common/SaveToGemBoxButton';

type Phase = 'input' | 'loading' | 'result';

export default function PerfectPlannerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    hasStamp,
    autoStamp,
    edgeMakerResult: savedEdgeResult,
    perfectPlannerResult: savedPlannerResult,
    savePerfectPlannerResult,
  } = useSchoolProgress();
  const completed = hasStamp('perfect-planner');
  const aiEnabled = isGeminiEnabled();

  // Phase
  const [phase, setPhase] = useState<Phase>('input');

  // Input
  const [productName, setProductName] = useState('');
  const [customers, setCustomers] = useState<string[]>(['']);
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [offers, setOffers] = useState<string[]>(['']);
  const [mode, setMode] = useState<PlannerMode>('detail');
  const [autoLoadedStrengths, setAutoLoadedStrengths] = useState(false);
  const [autoLoadedProduct, setAutoLoadedProduct] = useState(false);

  // Result
  const [result, setResult] = useState<PerfectPlannerResult['output'] | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [savedToGemBox, setSavedToGemBox] = useState(false);

  // Load team
  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then((info) => {
      if (info) setMyTeamId(info.team.id);
    });
  }, [user]);

  // Restore previous result
  useEffect(() => {
    if (!user) return;
    if (savedPlannerResult) {
      setResult(savedPlannerResult.output);
      setProductName(savedPlannerResult.input.productName);
      setCustomers(
        savedPlannerResult.input.customers.length > 0 ? savedPlannerResult.input.customers : [''],
      );
      setStrengths(
        savedPlannerResult.input.strengths.length > 0 ? savedPlannerResult.input.strengths : [''],
      );
      setOffers(savedPlannerResult.input.offers.length > 0 ? savedPlannerResult.input.offers : ['']);
      setMode(savedPlannerResult.input.mode);
      setPhase('result');
    }
  }, [user, savedPlannerResult]);

  // 3교시 엣지메이커 데이터 수동 불러오기
  const handleLoadEdgeData = () => {
    if (!savedEdgeResult) {
      alert('3교시 엣지메이커 결과가 없어요. 먼저 3교시를 완료해주세요.');
      return;
    }
    const brandName = savedEdgeResult.output.brandNames?.[0]?.name || '';
    if (brandName) {
      setProductName(brandName);
      setAutoLoadedProduct(true);
    }
    const usp = savedEdgeResult.output.usp || '';
    if (usp) {
      // USP를 쉼표나 / 로 분리해서 strengths에 넣기
      const parts = usp
        .split(/[,/·]|그리고|·/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      setStrengths(parts.length > 0 ? parts : [usp]);
      setAutoLoadedStrengths(true);
    }
  };

  const handleGenerate = async () => {
    const cleanCustomers = customers.filter((s) => s.trim());
    const cleanStrengths = strengths.filter((s) => s.trim());
    const cleanOffers = offers.filter((s) => s.trim());
    if (!productName.trim() || cleanStrengths.length === 0) return;

    setPhase('loading');
    try {
      const input: PerfectPlannerInput = {
        productName: productName.trim(),
        customers: cleanCustomers,
        strengths: cleanStrengths,
        offers: cleanOffers,
        mode,
      };
      const { result: planResult, isMock: mock } = await generateSalesPlan(input);
      setResult(planResult);
      setIsMock(mock);
      setPhase('result');

      if (user) {
        await savePerfectPlannerResult({
          completedAt: new Date().toISOString(),
          input,
          output: planResult,
        });
        autoStamp('perfect-planner');
      }
    } catch (err) {
      console.error('[PerfectPlanner] Failed:', err);
      setPhase('input');
    }
  };

  const handleSaveToGemBox = async () => {
    if (!user || !result) return;
    const dp = result.detailPage;
    const title = `📋 ${productName} · ${mode === 'detail' ? '상세페이지' : '라이브 방송'}`;
    const content = [
      `헤드라인: ${dp.headline.replace(/\n/g, ' ')}`,
      `가격: ${dp.originalPrice.toLocaleString()}원 → ${dp.salePrice.toLocaleString()}원 (-${dp.discountPercent}%)`,
      `Pain: ${dp.painPoints.map((p) => p.text.replace(/\n/g, ' ')).join(' / ')}`,
      `특징: ${dp.features.map((f) => f.title).join(' · ')}`,
    ].join('\n');
    await addIdeaBoxItem({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'tool-result',
      title,
      content,
      toolId: 'perfect-planner',
    });
    if (myTeamId) {
      await addTeamIdea(myTeamId, user.id, user.name, '📋', 'perfect-planner', title, content);
    }
    setSavedToGemBox(true);
  };

  const isInputValid =
    productName.trim().length > 0 && strengths.some((s) => s.trim().length > 0);

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-kk-red bg-kk-cream px-2 py-0.5 rounded">
              5{t('school.curriculum.period', '교시')}
            </span>
            <h1 className="font-bold text-kk-brown">상세페이지 만들기 📐</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="text-xs text-gray-500">📍 5/6 · 마케팅 학과</div>

        {/* AI 미연결 */}
        {!aiEnabled && phase === 'input' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">
                  AI 비서가 연결되지 않았어요
                </h3>
                <p className="text-xs text-amber-700 mb-3">
                  지금은 예시 데이터로 상세페이지를 볼 수 있어요.
                </p>
                <button
                  onClick={() => navigate('/ai-welcome')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                >
                  <Key className="w-3.5 h-3.5" /> API 키 연결하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ INPUT PHASE ══════ */}
        {phase === 'input' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            {/* 데이터 불러오기 버튼 */}
            <button
              onClick={handleLoadEdgeData}
              className="w-full mb-3 py-2 bg-gray-50 text-gray-500 border border-dashed border-gray-300 rounded-lg text-xs hover:bg-gray-100"
            >
              📥 3교시 엣지메이커 데이터 불러오기
            </button>

            {/* 상품 이름 */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                상품 이름
                {autoLoadedProduct && (
                  <span className="ml-1.5 inline-block bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                    ✅ 가져옴
                  </span>
                )}
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value.slice(0, 30))}
                placeholder="예: DripQ 캡슐"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red ${
                  autoLoadedProduct ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              />
            </div>

            {/* 주요 고객 */}
            <PlusListInput
              label="주요 고객"
              items={customers}
              onChange={setCustomers}
              placeholder="예: 30대 직장인 여성"
              max={5}
              addButtonText="➕ 고객 추가하기"
            />

            {/* 다른 곳에 없는 장점 */}
            <PlusListInput
              label="다른 곳에 없는 장점"
              items={strengths}
              onChange={setStrengths}
              placeholder="예: 3분 만에 카페 수준"
              max={5}
              autoLoadedBadge={autoLoadedStrengths}
              addButtonText="➕ 장점 추가하기"
            />

            {/* 오늘의 특별 혜택 */}
            <PlusListInput
              label="오늘의 특별 혜택"
              items={offers}
              onChange={setOffers}
              placeholder="예: 오늘만 30% 할인"
              max={5}
              addButtonText="➕ 혜택 추가하기"
            />

            {/* 만들기 종류 */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">만들기 종류</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMode('detail')}
                  className={`flex-1 p-2 rounded-lg text-xs text-center border-2 ${
                    mode === 'detail'
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-bold">🛒 상세페이지</div>
                  <div className="text-[10px] mt-0.5 opacity-70">쇼핑몰 상품 페이지</div>
                </button>
                <button
                  onClick={() => setMode('live')}
                  className={`flex-1 p-2 rounded-lg text-xs text-center border-2 ${
                    mode === 'live'
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-bold">📺 라이브 방송 대본</div>
                  <div className="text-[10px] mt-0.5 opacity-70">실시간 판매 큐시트</div>
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!isInputValid}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              만들기 →
            </button>
          </div>
        )}

        {/* ══════ LOADING PHASE ══════ */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Loader2 className="w-8 h-8 text-kk-red animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-600">
              {mode === 'detail' ? '상세페이지를' : '라이브 방송 대본을'} 만들고 있어요…
            </p>
          </div>
        )}

        {/* ══════ RESULT PHASE ══════ */}
        {phase === 'result' && result && (
          <>
            {/* 모드 탭 */}
            <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setMode('detail')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                  mode === 'detail' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
                }`}
              >
                🛒 상세페이지
              </button>
              <button
                onClick={() => setMode('live')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                  mode === 'live' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
                }`}
              >
                📺 라이브 방송 대본
              </button>
            </div>

            {mode === 'detail' && <DetailPagePreview plan={result.detailPage} productName={productName} />}
            {mode === 'live' && <LiveScriptCueSheet script={result.liveScript} />}

            {/* AI 실패 안내 */}
            {isMock && aiEnabled && (
              <p className="text-[11px] text-amber-700 text-center">
                ⚠️ AI 응답을 가져오지 못해 예시를 보여드리고 있어요
              </p>
            )}

            {/* PDF 받기 - 작은 회색 텍스트 */}
            <div className="text-center">
              <button
                onClick={() => window.print()}
                className="text-[11px] text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
              >
                📄 PDF로 받기
              </button>
            </div>

            {/* 보석함 저장 */}
            <SaveToGemBoxButton onSave={handleSaveToGemBox} saved={savedToGemBox} />

            {/* 발표용 올리기 — 팀 배정된 모든 학생 */}
            {myTeamId && (
              <button
                onClick={async () => {
                  if (!user || !result) return;
                  try {
                    // 기존 제출물 확인
                    const { data: existing } = await supabase
                      .from('team_ideas')
                      .select('id, user_name')
                      .eq('team_id', myTeamId)
                      .eq('tool_id', 'showcase')
                      .limit(1);

                    if (existing && existing.length > 0) {
                      const ok = window.confirm(
                        `⚠️ 우리 조에서 이미 제출한 자료가 있어요!\n(${existing[0].user_name}님이 올림)\n\n덮어쓰기 할까요?`
                      );
                      if (!ok) return;
                      // 기존 것 삭제
                      await supabase
                        .from('team_ideas')
                        .delete()
                        .eq('team_id', myTeamId)
                        .eq('tool_id', 'showcase');
                    }

                    // 현재 화면의 이미지 URL도 함께 저장
                    const { searchPexelsImage } = await import('../../../../services/pexelsService');
                    const savedMainImg = await searchPexelsImage(productName);
                    const savedSubImg = await searchPexelsImage(productName + ' premium');

                    await addTeamIdea(
                      myTeamId, user.id, user.name, '📋', 'showcase',
                      `🎓 ${productName} 발표용 상세페이지`,
                      JSON.stringify({ plan: result.detailPage, productName, mainImg: savedMainImg, subImg: savedSubImg })
                    );
                    alert('✅ 발표용 상세페이지가 올라갔어요!\n선생님이 화면에서 보여줄 거예요.');
                  } catch (err) {
                    console.error('Showcase upload error:', err);
                    alert('올리기 실패. 다시 시도해주세요.');
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                🎓 발표용으로 올리기
              </button>
            )}

            {/* 다음 교시 CTA */}
            <div className="bg-blue-50 border border-dashed border-blue-300 rounded-xl p-3 text-center">
              <button
                onClick={() => navigate('/marketing/school/tools/roas-simulator')}
                className="text-blue-700 font-bold text-sm"
              >
                다음 · 6교시 ROAS시뮬레이터 → 광고비는 얼마나 들까? →
              </button>
            </div>

            {completed && (
              <div className="text-center text-xs text-emerald-600 font-semibold">
                ✅ 5교시 도장 받았어요
              </div>
            )}

            {/* 다시 만들기 */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setPhase('input');
                }}
                className="text-[11px] text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
              >
                🔁 다시 만들기
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DetailPagePreview — 모바일 쇼핑몰 톤 (340px 고정, 직각 모서리)
// mockup: docs/mockups/perfect-planner.html AFTER 컬럼
// ═══════════════════════════════════════════════════════════════

function DetailPagePreview({ plan, productName }: { plan: DetailPagePlan; productName?: string }) {
  const [mainImg, setMainImg] = useState<string | null>(null);
  const [subImg, setSubImg] = useState<string | null>(null);
  useEffect(() => {
    if (!productName) return;
    import('../../../../services/pexelsService').then(({ searchPexelsImage }) => {
      searchPexelsImage(productName).then(u => u && setMainImg(u));
      searchPexelsImage(productName + ' premium').then(u => u && setSubImg(u));
    }).catch(() => {});
  }, [productName]);

  // headline에서 highlight 단어를 노란색으로
  const renderHeadlineWithHighlight = () => {
    const lines = plan.headline.split('\n');
    return lines.map((line, i) => {
      const hi = plan.headlineHighlight;
      if (hi && line.includes(hi)) {
        const [before, ...rest] = line.split(hi);
        return (
          <div key={i}>
            {before}
            <span style={{ color: '#fbbf24' }}>{hi}</span>
            {rest.join(hi)}
          </div>
        );
      }
      return <div key={i}>{line}</div>;
    });
  };

  const featureColors = {
    amber: { bg: '#fffbeb', title: '#92400e', desc: '#78350f' },
    green: { bg: '#f0fdf4', title: '#166534', desc: '#14532d' },
    blue: { bg: '#eff6ff', title: '#1e40af', desc: '#1e3a8a' },
  } as const;

  return (
    <div
      className="relative mx-auto bg-white border border-gray-300"
      style={{ maxWidth: 340, fontFamily: "'Pretendard','Noto Sans KR',sans-serif" }}
    >
      {/* 모바일 상단바 */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex justify-between items-center text-[11px] text-gray-500">
        <span>← {plan.brandLine.replace(/\s*(공식|스토어)$/, '')}</span>
        <span>🔍 🛒</span>
      </div>

      {/* 1. 큰 메인 이미지 (정사각형) */}
      <div
        className="w-full flex items-center justify-center"
        style={{
          aspectRatio: '1',
          background: mainImg
            ? `url('${mainImg}') center/cover`
            : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #f59e0b 100%)',
        }}
      >
        {!mainImg && (
          <div className="text-center px-6">
            <div className="text-4xl mb-3">🛍️</div>
            <div className="text-lg font-bold text-amber-900">{productName || plan.productTitle}</div>
          </div>
        )}
      </div>

      {/* 2. 가격 영역 */}
      <div className="px-4 py-3.5" style={{ borderBottom: '8px solid #f4f4f5' }}>
        <div className="text-[11px] text-gray-500 mb-0.5">{plan.brandLine}</div>
        <div className="text-[15px] font-semibold text-gray-900 leading-snug mb-2">
          {plan.productTitle}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 font-bold">
            {plan.discountPercent}%
          </span>
          <span className="text-[13px] text-gray-400 line-through">
            {plan.originalPrice.toLocaleString()}원
          </span>
        </div>
        <div className="text-[24px] font-black text-red-500 mt-0.5">
          {plan.salePrice.toLocaleString()}원
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-[11px]">
          <span className="text-amber-400">★★★★★</span>
          <span className="text-gray-900 font-semibold">{plan.rating}</span>
          <span className="text-gray-500">· 리뷰 {plan.reviewCount.toLocaleString()}</span>
        </div>
        <div className="bg-amber-100 text-amber-800 px-2.5 py-1.5 text-[11px] font-semibold mt-2 flex items-center gap-1">
          {plan.countdownLabel} <b className="ml-auto">{plan.countdownValue}</b>
        </div>
      </div>

      {/* 3. 어그로 한 줄 */}
      <div
        className="px-4 py-3.5 text-center bg-amber-100"
        style={{ borderBottom: '8px solid #f4f4f5' }}
      >
        <div
          className="text-[14px] font-black leading-snug whitespace-pre-line"
          style={{ color: '#7c2d12' }}
        >
          {plan.attentionLine.text}
        </div>
      </div>

      {/* 4. 큰 헤드라인 */}
      <div className="px-4 py-7 text-center bg-black text-white">
        <div className="text-[11px] text-amber-400 font-bold mb-2">{plan.headlinePrefix}</div>
        <div
          className="font-black leading-[1.1]"
          style={{ fontSize: 30, letterSpacing: -1 }}
        >
          {renderHeadlineWithHighlight()}
        </div>
      </div>

      {/* 5. Pain points "~한 사람!" */}
      <div className="bg-amber-100 px-4 py-6" style={{ borderBottom: '8px solid #f4f4f5' }}>
        <div
          className="text-[18px] font-black text-center mb-4 leading-tight whitespace-pre-line"
          style={{ color: '#7c2d12' }}
        >
          {plan.painPointsTitle}
        </div>
        {plan.painPoints.map((p, i) => (
          <div
            key={i}
            className="bg-white px-4 py-3.5 mb-2 text-[14px] font-bold text-gray-900 whitespace-pre-line"
            style={{ borderLeft: '5px solid #f59e0b' }}
          >
            {p.emoji} {p.text}
          </div>
        ))}
      </div>

      {/* 6. 해결책 큰 이미지 */}
      <div className="bg-black text-white">
        <div className="px-4 pt-6 pb-4 text-center">
          <div className="text-[11px] text-amber-400 font-bold mb-1.5">{plan.solutionPrefix}</div>
          <div
            className="text-[24px] font-black leading-[1.1] whitespace-pre-line"
          >
            {plan.solutionHeadline}
          </div>
        </div>
        <div
          className="w-full flex items-center justify-center"
          style={{
            aspectRatio: '1',
            background: subImg
              ? `url('${subImg}') center/cover`
              : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
        >
          {!subImg && (
            <div className="text-center px-6">
              <div className="text-5xl mb-3">✨</div>
              <div className="text-white text-lg font-bold">{productName || plan.productTitle}</div>
            </div>
          )}
        </div>
      </div>

      {/* 7. 3가지 특징 */}
      <div className="bg-white" style={{ borderBottom: '8px solid #f4f4f5' }}>
        <div className="px-4 pt-6 pb-3.5 text-center text-[18px] font-black text-gray-900 whitespace-pre-line leading-tight">
          {plan.featuresTitle}
        </div>
        <div className="px-4 pb-5">
          {plan.features.map((f, i) => {
            const c = featureColors[f.colorKey];
            return (
              <div
                key={i}
                className="flex gap-3.5 items-center p-3.5 mb-2"
                style={{ background: c.bg }}
              >
                <div className="text-[36px]">{f.emoji}</div>
                <div>
                  <div className="text-[16px] font-black" style={{ color: c.title }}>
                    {f.title}
                  </div>
                  <div
                    className="text-[12px] mt-0.5 whitespace-pre-line"
                    style={{ color: c.desc }}
                  >
                    {f.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. 리뷰 */}
      <div className="px-4 py-5 bg-white" style={{ borderBottom: '8px solid #f4f4f5' }}>
        <div className="flex justify-between items-baseline mb-3">
          <div className="text-[15px] font-black text-gray-900">⭐ 진짜 후기</div>
          <div className="text-[11px] text-gray-500">
            {plan.reviewCount.toLocaleString()}개 모두 보기 ›
          </div>
        </div>
        {plan.reviews.map((r, i) => (
          <div
            key={i}
            className="bg-gray-50 p-3 mb-2"
            style={{ borderLeft: '3px solid #fbbf24' }}
          >
            <div className="text-[11px] text-amber-400 mb-1">{r.stars}</div>
            <div className="text-[13px] text-gray-900 font-semibold leading-snug">
              {r.text}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{r.author}</div>
          </div>
        ))}
      </div>

      {/* 9. 마지막 강조 */}
      <div className="bg-red-500 text-white px-4 py-6 text-center">
        <div className="text-[13px] mb-1.5">{plan.finalCtaDeadline}</div>
        <div className="text-[26px] font-black leading-[1.1] whitespace-pre-line">
          {plan.finalCtaHeadline}
        </div>
        <div className="text-[14px] mt-2">
          지금 사면{' '}
          <span className="bg-white text-red-500 px-2 py-0.5 font-black">
            {plan.salePrice.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* sticky CTA 높이 확보 */}
      <div style={{ height: 56 }} />
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 flex gap-2 items-center"
      >
        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-[18px] border border-gray-200">
          ♡
        </div>
        <button className="flex-1 bg-black text-white py-3 text-[14px] font-black">
          {plan.stickyCtaText}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LiveScriptCueSheet — 시간대별 큐시트 (진행자 멘트 / 액션 / 시청자)
// ═══════════════════════════════════════════════════════════════

const CUE_COLORS = {
  orange: { border: '#FF6B35', bg: '#fff7ed', title: '#7c2d12', text: '#9a3412' },
  amber: { border: '#f59e0b', bg: '#fffbeb', title: '#92400e', text: '#92400e' },
  green: { border: '#10b981', bg: '#f0fdf4', title: '#166534', text: '#166534' },
  blue: { border: '#3b82f6', bg: '#eff6ff', title: '#1e40af', text: '#1e40af' },
  red: { border: '#ef4444', bg: '#fef2f2', title: '#991b1b', text: '#991b1b' },
} as const;

function LiveScriptCueSheet({ script }: { script: LiveScript }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      {/* 라이브 헤더 */}
      <div className="bg-black text-white p-3.5 mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <div className="bg-red-500 px-2 py-0.5 text-[10px] font-bold">🔴 LIVE</div>
          <div className="text-[10px] text-gray-400">{script.expectedViewers}</div>
        </div>
        <div className="text-[14px] font-bold">{script.title}</div>
      </div>

      {/* 큐시트 항목 */}
      {script.items.map((item, i) => {
        const c = CUE_COLORS[item.colorKey];
        return (
          <div
            key={i}
            className="px-3 py-2.5 mb-2.5"
            style={{ borderLeft: `3px solid ${c.border}`, background: c.bg }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <div className="text-[13px] font-black" style={{ color: c.title }}>
                {item.emoji} {item.timeRange} · {item.title}
              </div>
              <div className="text-[10px]" style={{ color: c.text }}>
                {item.duration}
              </div>
            </div>
            <div className="bg-white px-2.5 py-2 text-[12px] text-gray-900 leading-relaxed mb-1.5 whitespace-pre-line">
              <b>진행자:</b> {item.hostScript}
            </div>
            {item.action && (
              <div className="text-[11px]" style={{ color: c.text }}>
                {item.action}
              </div>
            )}
            {item.audienceReaction && (
              <div className="text-[11px]" style={{ color: c.text }}>
                {item.audienceReaction}
              </div>
            )}
            {item.extra && (
              <div className="text-[11px]" style={{ color: c.text }}>
                {item.extra}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
