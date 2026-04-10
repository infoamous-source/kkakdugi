import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { generateViralCards } from '../../../../services/gemini/viralCardService';
import { searchPexelsImages, isPexelsEnabled } from '../../../../services/pexelsService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import type {
  ViralCardResult,
  ViralCardSlide,
  ViralTone,
  ViralImageSource,
} from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { addIdeaBoxItem } from '../../../../services/ideaBoxService';
import { PlusListInput } from './common/PlusListInput';
import { SaveToGemBoxButton } from './common/SaveToGemBoxButton';
import { ViralCardTemplate } from './common/ViralCardTemplates';

type Phase = 'input' | 'loading' | 'result';

const TONE_OPTIONS: {
  value: ViralTone;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  { value: 'spicy', emoji: '🌶️', label: '자극형', desc: '눈에 띄게 강렬하게' },
  { value: 'emotional', emoji: '💗', label: '감성형', desc: '따뜻한 이야기로' },
  { value: 'informative', emoji: '📊', label: '정보형', desc: '사실과 숫자로' },
];

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #FEE2E2, #FEF3C7)',
  'linear-gradient(135deg, #DBEAFE, #E0E7FF)',
  'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
  'linear-gradient(135deg, #FEF3C7, #FDE68A)',
];

export default function ViralCardMakerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    hasStamp,
    autoStamp,
    edgeMakerResult: savedEdgeResult,
    viralCardResult: savedViralResult,
    saveViralCardResult,
  } = useSchoolProgress();
  const completed = hasStamp('viral-card-maker');
  const aiEnabled = isGeminiEnabled();
  const pexelsEnabled = isPexelsEnabled();

  // Phase
  const [phase, setPhase] = useState<Phase>('input');

  // Input
  const [productName, setProductName] = useState('');
  const [targetPersonas, setTargetPersonas] = useState<string[]>(['']);
  const [usp, setUsp] = useState('');
  const [tone, setTone] = useState<ViralTone>('spicy');
  const [imageSource, setImageSource] = useState<ViralImageSource>('pexels');
  const [autoLoadedProduct, setAutoLoadedProduct] = useState(false);

  // Result
  const [slides, setSlides] = useState<ViralCardSlide[] | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [savedToGemBox, setSavedToGemBox] = useState(false);
  const [zoomedCard, setZoomedCard] = useState<number | null>(null);

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
    if (savedViralResult) {
      setSlides(savedViralResult.output.slides);
      setProductName(savedViralResult.input.productName);
      setTargetPersonas(
        savedViralResult.input.targetPersonas.length > 0
          ? savedViralResult.input.targetPersonas
          : [''],
      );
      setUsp(savedViralResult.input.usp);
      setTone(savedViralResult.input.tone);
      setImageSource(savedViralResult.input.imageSource);
      setPhase('result');
    }
  }, [user, savedViralResult]);

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
    if (savedEdgeResult.output.usp) setUsp(savedEdgeResult.output.usp);
  };

  // 이미지 fetching
  const fetchImages = async (newSlides: ViralCardSlide[]): Promise<ViralCardSlide[]> => {
    if (imageSource !== 'pexels' || !pexelsEnabled) {
      return newSlides;
    }
    setImageLoading(true);
    try {
      const keywords = newSlides.map((s) => s.imageKeyword);
      const urls = await searchPexelsImages(keywords);
      return newSlides.map((s, i) => ({ ...s, imageUrl: urls[i] || undefined }));
    } finally {
      setImageLoading(false);
    }
  };

  const handleGenerate = async () => {
    const cleanPersonas = targetPersonas.filter((s) => s.trim());
    if (!productName.trim() || cleanPersonas.length === 0) return;

    setPhase('loading');
    try {
      const { result: genResult, isMock: mock } = await generateViralCards(
        productName.trim(),
        cleanPersonas,
        usp.trim(),
        tone,
      );
      const withImages = await fetchImages(genResult.slides);
      setSlides(withImages);
      setIsMock(mock);
      setPhase('result');

      if (user) {
        const fullResult: ViralCardResult = {
          completedAt: new Date().toISOString(),
          input: {
            productName: productName.trim(),
            targetPersonas: cleanPersonas,
            usp: usp.trim(),
            tone,
            imageSource,
          },
          output: { slides: withImages },
        };
        await saveViralCardResult(fullResult);
        autoStamp('viral-card-maker');
      }
    } catch (err) {
      console.error('[ViralCard] Failed:', err);
      setPhase('input');
    }
  };

  const handleRegenerateImages = async () => {
    if (!slides || !pexelsEnabled) return;
    setImageLoading(true);
    try {
      // sessionStorage 캐시를 무시하고 새로 뽑으려면 키워드에 랜덤 토큰 추가
      const refreshed = await Promise.all(
        slides.map(async (s) => {
          const keyword = s.imageKeyword + ' ' + Math.floor(Math.random() * 100);
          const { searchPexelsImage } = await import('../../../../services/pexelsService');
          const url = await searchPexelsImage(keyword);
          return { ...s, imageUrl: url || s.imageUrl };
        }),
      );
      setSlides(refreshed);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveToGemBox = async () => {
    if (!user || !slides) return;
    const title = `🎨 ${productName} SNS 광고이미지 4장`;
    const content = slides
      .map((s, i) => `${i + 1}. [${s.stepKoLabel}] ${s.copyText.replace(/\n/g, ' ')}`)
      .join('\n');
    await addIdeaBoxItem({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'tool-result',
      title,
      content,
      toolId: 'viral-card-maker',
    });
    if (myTeamId) {
      await addTeamIdea(myTeamId, user.id, user.name, '🎨', 'viral-card-maker', title, content);
    }
    setSavedToGemBox(true);
  };

  // PNG 다운로드 — html2canvas로 slide 캡처
  const handleDownloadCardPng = async (slideIdx: number) => {
    const el = document.getElementById(`viral-slide-${slideIdx}`);
    if (!el) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `viral-card-${slideIdx + 1}-${productName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG download failed:', err);
      alert('PNG 다운로드 실패. 다시 시도해주세요.');
    }
  };

  const isInputValid =
    productName.trim().length > 0 && targetPersonas.some((s) => s.trim().length > 0);

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
              4{t('school.curriculum.period', '교시')}
            </span>
            <h1 className="font-bold text-kk-brown">바이럴 카드 만들기 🔥</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="text-xs text-gray-500">📍 4/6 · 마케팅 학과</div>

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
                  지금은 예시 카피로 카드를 볼 수 있어요.
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
            {/* 데이터 불러오기 */}
            <button
              onClick={handleLoadEdgeData}
              className="w-full mb-3 py-2 bg-gray-50 text-gray-500 border border-dashed border-gray-300 rounded-lg text-xs hover:bg-gray-100"
            >
              📥 3교시 엣지메이커 데이터 불러오기
            </button>

            {/* 상품명 */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                상품명
                {autoLoadedProduct && (
                  <span className="ml-1.5 inline-block bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                    ✅ 이전 단계에서 가져옴
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

            {/* 타겟 페르소나 */}
            <PlusListInput
              label="타겟 페르소나"
              items={targetPersonas}
              onChange={setTargetPersonas}
              placeholder="예: 30대 직장인 여성"
              max={5}
              addButtonText="➕ 페르소나 추가하기"
            />

            {/* USP */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                USP (차별점)
              </label>
              <input
                type="text"
                value={usp}
                onChange={(e) => setUsp(e.target.value.slice(0, 100))}
                placeholder="예: 3분 만에 카페 수준, 절반 가격"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
              />
            </div>

            {/* 분위기 선택 */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                분위기 선택
              </label>
              <div className="flex gap-1.5">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`flex-1 p-2 rounded-lg text-xs text-center border-2 ${
                      tone === opt.value
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">
                      {opt.emoji} {opt.label}
                    </div>
                    <div className="text-[10px] mt-0.5 opacity-70">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!isInputValid}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              4장 SNS 광고이미지 생성 →
            </button>
          </div>
        )}

        {/* ══════ LOADING PHASE ══════ */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Loader2 className="w-8 h-8 text-kk-red animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-600">4장 SNS 광고이미지를 만들고 있어요…</p>
          </div>
        )}

        {/* ══════ RESULT PHASE ══════ */}
        {phase === 'result' && slides && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs text-gray-500 font-semibold">
              4장 SNS 광고이미지 ({pexelsEnabled ? 'Pexels 이미지' : '컬러 그라데이션'} + 레이아웃 템플릿)
            </h3>

            {imageLoading && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> 이미지 불러오는 중…
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  id={`viral-slide-${i}`}
                  className="relative cursor-zoom-in"
                  onClick={() => setZoomedCard(i)}
                >
                  <ViralCardTemplate
                    slide={slide}
                    index={i}
                    productName={productName}
                    imageUrl={slide.imageUrl || null}
                    fallbackGradient={FALLBACK_GRADIENTS[i]}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-2">
              {pexelsEnabled && (
                <button
                  onClick={handleRegenerateImages}
                  disabled={imageLoading}
                  className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> 다른 이미지로
                </button>
              )}
            </div>

            {isMock && aiEnabled && (
              <p className="text-[11px] text-amber-700 text-center">
                ⚠️ AI 카피를 가져오지 못해 예시를 보여드리고 있어요
              </p>
            )}

            <SaveToGemBoxButton onSave={handleSaveToGemBox} saved={savedToGemBox} />

            <div className="bg-blue-50 border border-dashed border-blue-300 rounded-xl p-3 text-center">
              <button
                onClick={() => navigate('/marketing/school/tools/perfect-planner')}
                className="text-blue-700 font-bold text-sm"
              >
                다음 · 5교시 퍼펙트플래너 → 상세페이지 만들기 →
              </button>
            </div>

            {completed && (
              <div className="text-center text-xs text-emerald-600 font-semibold">
                ✅ 4교시 도장 받았어요
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => {
                  setSlides(null);
                  setPhase('input');
                }}
                className="text-[11px] text-gray-500 hover:text-gray-700"
              >
                🔁 다시 만들기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 카드 확대 팝업 */}
      {zoomedCard !== null && slides && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedCard(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setZoomedCard(null); }}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
          <div
            className="relative max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ViralCardTemplate
              slide={slides[zoomedCard]}
              index={zoomedCard}
              productName={productName}
              imageUrl={slides[zoomedCard].imageUrl || null}
              fallbackGradient={FALLBACK_GRADIENTS[zoomedCard]}
            />
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => handleDownloadCardPng(zoomedCard)}
                className="px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                📥 PNG 다운로드
              </button>
              {zoomedCard > 0 && (
                <button
                  onClick={() => setZoomedCard(zoomedCard - 1)}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  ← 이전
                </button>
              )}
              {zoomedCard < slides.length - 1 && (
                <button
                  onClick={() => setZoomedCard(zoomedCard + 1)}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  다음 →
                </button>
              )}
            </div>
            <p className="text-white/60 text-xs text-center mt-3">
              카드 {zoomedCard + 1} / {slides.length} · 클릭/ESC로 닫기
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
