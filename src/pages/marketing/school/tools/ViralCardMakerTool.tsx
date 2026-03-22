import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Loader2, Sparkles, Copy, Check,
  RefreshCw, ChevronDown, ChevronUp, ImageIcon, Download, Bookmark, Gem, Key,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import { generateViralCards, generateAllSlideImages } from '../../../../services/gemini/viralCardService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import { useIdeaBox } from '../../../../hooks/useIdeaBox';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import type { ViralTone, ImageStyle, ViralCardSlide, ViralCardResult } from '../../../../types/school';
import { SimpleMarkdown } from '@/components/common/SimpleMarkdown';

type Phase = 'input' | 'loading' | 'result';

const STEP_ICONS: Record<string, string> = {
  hook: '\uD83C\uDFA3',
  empathy: '\uD83D\uDCAC',
  solution: '\uD83D\uDCA1',
  action: '\uD83D\uDE80',
};

const TONE_OPTIONS: { value: ViralTone; emoji: string; labelKey: string; descKey: string }[] = [
  { value: 'spicy', emoji: '\uD83C\uDF36\uFE0F', labelKey: 'school.viralCardMaker.tone.spicy', descKey: 'school.viralCardMaker.tone.spicyDesc' },
  { value: 'emotional', emoji: '\uD83D\uDC95', labelKey: 'school.viralCardMaker.tone.emotional', descKey: 'school.viralCardMaker.tone.emotionalDesc' },
  { value: 'informative', emoji: '\uD83D\uDCCA', labelKey: 'school.viralCardMaker.tone.informative', descKey: 'school.viralCardMaker.tone.informativeDesc' },
];

const IMAGE_STYLE_OPTIONS: { value: ImageStyle; emoji: string; labelKey: string; gradient: string }[] = [
  { value: 'illustration', emoji: '\uD83C\uDFA8', labelKey: 'school.viralCardMaker.imageStyle.illustration', gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFC3A0 50%, #D4FC79 100%)' },
  { value: 'realistic', emoji: '\uD83D\uDCF7', labelKey: 'school.viralCardMaker.imageStyle.realistic', gradient: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)' },
  { value: 'minimal', emoji: '\u2B1C', labelKey: 'school.viralCardMaker.imageStyle.minimal', gradient: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)' },
  { value: 'popart', emoji: '\uD83D\uDFE1', labelKey: 'school.viralCardMaker.imageStyle.popart', gradient: 'linear-gradient(135deg, #FF0099 0%, #FFD700 50%, #00FF88 100%)' },
  { value: 'custom', emoji: '\uD83D\uDCE4', labelKey: 'school.viralCardMaker.imageStyle.custom', gradient: 'linear-gradient(135deg, #E0E0E0 0%, #F5F5F5 50%, #E8E8E8 100%)' },
];

export default function ViralCardMakerTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem: addIdeaBoxItem } = useIdeaBox();
  const {
    hasStamp, autoStamp,
    edgeMakerResult: savedEdgeResult,
    viralCardResult: savedViralResult,
    saveViralCardResult,
  } = useSchoolProgress();
  const completed = hasStamp('viral-card-maker');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Phase
  const [phase, setPhase] = useState<Phase>('input');

  // Input
  const [productName, setProductName] = useState('');
  const [targetPersona, setTargetPersona] = useState('');
  const [usp, setUsp] = useState('');
  const [tone, setTone] = useState<ViralTone>('spicy');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('illustration');
  const [showFormula, setShowFormula] = useState(false);
  const [edgeDataLoaded, setEdgeDataLoaded] = useState(false);

  // Loading
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  // Result
  const [result, setResult] = useState<ViralCardResult['output'] | null>(null);
  const [slideImages, setSlideImages] = useState<(string | null)[]>([null, null, null, null]);
  const [imageLoadingDone, setImageLoadingDone] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [regeneratingImage, setRegeneratingImage] = useState<number | null>(null);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [savedToIdeaBox, setSavedToIdeaBox] = useState(false);
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

  // Load previous result or Edge Maker data on mount
  useEffect(() => {
    if (!user) return;

    if (savedViralResult) {
      setResult(savedViralResult.output);
      setProductName(savedViralResult.input.productName);
      setTargetPersona(savedViralResult.input.targetPersona);
      setUsp(savedViralResult.input.usp);
      setTone(savedViralResult.input.tone);
      setImageStyle(savedViralResult.input.imageStyle);
      setSlideImages([null, null, null, null]); // Images not saved
      setPhase('result');
      return;
    }

    if (savedEdgeResult) {
      const brandName = savedEdgeResult.output.brandNames?.[0]?.name || '';
      if (brandName) setProductName(brandName);
      if (savedEdgeResult.output.usp) setUsp(savedEdgeResult.output.usp);
      setEdgeDataLoaded(true);
    }
  }, [user, savedViralResult, savedEdgeResult]);

  // Copy helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* noop */ }
  };

  // Generate
  const handleGenerate = async () => {
    if (!productName.trim() || !targetPersona.trim()) return;

    setPhase('loading');
    setLoadingStep(0);
    setLoadingText(t('school.viralCardMaker.loading.step1'));
    setAiError(null);

    try {
      // Step 1: Generate copy
      const { result: copyResult, isMock: mock } = await generateViralCards(
        productName.trim(),
        targetPersona.trim(),
        usp.trim(),
        tone,
        imageStyle,
      );

      setResult(copyResult);
      setIsMock(mock);
      setSlideImages([null, null, null, null]);
      setPhase('result');

      if (mock && aiEnabled) {
        setAiError('AI 응답을 처리하지 못했어요. 예시 데이터를 보여드릴게요.');
      }

      // Save result (without images) + 자동 스탬프
      if (user) {
        saveViralCardResult({
          completedAt: new Date().toISOString(),
          input: { productName: productName.trim(), targetPersona: targetPersona.trim(), usp: usp.trim(), tone, imageStyle },
          output: copyResult,
        });
        autoStamp('viral-card-maker');
      }

      // Step 2: Generate images in background (only if not mock)
      if (imageStyle === 'custom' && customImageBase64) {
        // Use uploaded image for all 4 slides
        setSlideImages([customImageBase64, customImageBase64, customImageBase64, customImageBase64]);
        setImageLoadingDone(true);
      } else if (!mock) {
        setLoadingStep(1);
        setImageLoadingDone(false);
        generateAllSlideImages(copyResult.slides, imageStyle, (index, base64) => {
          setSlideImages((prev) => {
            const next = [...prev];
            next[index] = base64;
            return next;
          });
        }).then(() => setImageLoadingDone(true));
      } else {
        setImageLoadingDone(true);
      }
    } catch (err) {
      console.error('[ViralCard] Generation failed:', err);
      setPhase('input');
      setAiError('광고 카드 생성에 실패했어요. 다시 시도해주세요.');
    }
  };

  // Handle custom image upload
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 이미지만 업로드할 수 있어요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setCustomImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  // Regenerate single image
  const handleRegenerateImage = async (index: number) => {
    if (!result || regeneratingImage !== null || imageStyle === 'custom') return;
    setRegeneratingImage(index);

    try {
      const { generateSlideImage } = await import('../../../../services/gemini/viralCardService');
      const base64 = await generateSlideImage(result.slides[index].imagePrompt, imageStyle);
      setSlideImages((prev) => {
        const next = [...prev];
        next[index] = base64;
        return next;
      });
    } catch { /* noop */ }
    setRegeneratingImage(null);
  };

  // Copy all
  const handleCopyAll = () => {
    if (!result) return;
    const text = result.slides.map((slide, i) => {
      return `━━ [${i + 1}/4] ${STEP_ICONS[slide.step]} ${slide.stepLabel} ━━\n${slide.copyText}\n\uD83D\uDCA1 ${t('school.viralCardMaker.designTip')}: ${slide.designTip}`;
    }).join('\n\n');
    copyToClipboard(`${text}\n\n${t('school.viralCardMaker.strategy')}: ${result.overallStrategy}`, 'all');
  };

  // Save slide as image (canvas)
  const handleSaveSlideAsImage = async (index: number) => {
    if (!result) return;
    const slide = result.slides[index];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Draw background
    if (slideImages[index]) {
      const img = new Image();
      img.src = `data:image/png;base64,${slideImages[index]}`;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); });
      ctx.drawImage(img, 0, 0, 1080, 1080);
    } else {
      // Gradient fallback
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, slide.colorScheme.primary);
      gradient.addColorStop(1, slide.colorScheme.secondary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);
    }

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, 1080, 1080);

    // Step badge
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${STEP_ICONS[slide.step]} ${slide.stepLabel}`, 60, 80);

    // Page number
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${index + 1}/4`, 1020, 80);
    ctx.textAlign = 'left';

    // Copy text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px sans-serif';
    const lines = slide.copyText.split('\n');
    const startY = 1080 - 60 - (lines.length - 1) * 60;
    lines.forEach((line, i) => {
      ctx.fillText(line, 60, startY + i * 60);
    });

    // Download
    const link = document.createElement('a');
    link.download = `card-${index + 1}-${slide.step}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSaveAllSlides = async () => {
    if (!result) return;
    for (let i = 0; i < result.slides.length; i++) {
      await handleSaveSlideAsImage(i);
    }
  };

  // Save to idea box
  const handleSaveToIdeaBox = () => {
    if (!user || !result) return;
    const allCopy = result.slides.map((s, i) => `[${i + 1}/4] ${s.stepLabel}: ${s.copyText}`).join('\n\n');
    addIdeaBoxItem({
      type: 'copy',
      toolId: 'viral-card-maker',
      title: productName,
      content: allCopy,
      preview: result.slides[0].copyText.slice(0, 50),
      tags: [tone, imageStyle],
    });
    setSavedToIdeaBox(true);
    setTimeout(() => setSavedToIdeaBox(false), 2000);
  };

  // Save to team gem box
  const handleSaveToTeamBox = async () => {
    if (!user || !result || !myTeamId) return;
    const allCopy = result.slides.map((s, i) => `[${i + 1}/4] ${s.stepLabel}: ${s.copyText}`).join('\n\n');
    await addTeamIdea(myTeamId, user.id, user.name, '🎨', 'viral-card-maker', `🎨 ${productName}`, allCopy);
    setSavedToTeamBox(true);
    setTimeout(() => setSavedToTeamBox(false), 2000);
  };

  // stamp already auto-applied on result generation

  const isInputValid = productName.trim().length > 0 && targetPersona.trim().length > 0;

  // Scroll snap handler
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.offsetWidth;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveSlide(idx);
  };

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-kk-navy bg-kk-cream px-2 py-0.5 rounded">4{t('school.curriculum.period')}</span>
            <h1 className="font-bold text-kk-brown">{t('school.periods.viralCardMaker.name')}</h1>
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
                <p className="text-xs text-amber-700 mb-3">API 키를 연결하면 AI가 나만의 광고 카드를 만들어줘요. 지금은 예시 데이터로 체험할 수 있어요.</p>
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
                <Share2 className="w-7 h-7 text-kk-navy" />
              </div>
              <h2 className="text-lg font-bold text-kk-brown mb-1">{t('school.viralCardMaker.title')}</h2>
              <p className="text-sm text-gray-500">{t('school.viralCardMaker.subtitle')}</p>
            </div>

            {/* Formula Explanation */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="w-full px-5 py-3 flex items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-kk-brown">{t('school.viralCardMaker.formulaTitle')}</span>
                {showFormula ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showFormula && (
                <div className="px-5 pb-4 space-y-2">
                  {['hook', 'empathy', 'solution', 'action'].map((step) => (
                    <div key={step} className="flex items-start gap-2 text-sm">
                      <span className="text-lg">{STEP_ICONS[step]}</span>
                      <div>
                        <span className="font-bold text-gray-700">{step.toUpperCase()}</span>
                        <span className="text-gray-500 ml-1">- {t(`school.viralCardMaker.formula.${step}`)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edge Maker Badge */}
            {edgeDataLoaded && (
              <div className="bg-kk-cream border border-kk-warm rounded-xl px-4 py-2 text-xs text-kk-brown font-medium">
                {t('school.viralCardMaker.edgeDataLoaded')}
              </div>
            )}

            {/* Input Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('school.viralCardMaker.input.productName')}</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value.slice(0, 30))}
                  placeholder={t('school.viralCardMaker.input.productNamePlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('school.viralCardMaker.input.targetPersona')}</label>
                <input
                  type="text"
                  value={targetPersona}
                  onChange={(e) => setTargetPersona(e.target.value.slice(0, 80))}
                  placeholder={t('school.viralCardMaker.input.targetPersonaPlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('school.viralCardMaker.input.usp')}</label>
                <input
                  type="text"
                  value={usp}
                  onChange={(e) => setUsp(e.target.value.slice(0, 100))}
                  placeholder={t('school.viralCardMaker.input.uspPlaceholder')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                />
              </div>
            </div>

            {/* Tone Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('school.viralCardMaker.toneLabel')}</label>
              <div className="grid grid-cols-3 gap-2">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      tone === opt.value
                        ? 'border-kk-red bg-kk-cream'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.emoji}</div>
                    <div className="text-xs font-bold text-gray-700">{t(opt.labelKey)}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{t(opt.descKey)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Style Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">{t('school.viralCardMaker.imageStyleLabel')}</label>
              <div className="grid grid-cols-5 gap-2">
                {IMAGE_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setImageStyle(opt.value)}
                    className={`rounded-xl border-2 overflow-hidden transition-all ${
                      imageStyle === opt.value
                        ? 'border-kk-red ring-2 ring-kk-peach'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.value === 'custom' ? (
                      <div className="h-16 w-full border-b-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <span className="text-2xl">{opt.emoji}</span>
                      </div>
                    ) : (
                      <div className="h-16 w-full relative overflow-hidden" style={{ background: opt.gradient }}>
                        <div className="absolute inset-0 flex flex-col justify-end p-1.5">
                          <div className="bg-white/80 rounded h-1 w-3/4 mb-0.5" />
                          <div className="bg-white/60 rounded h-1 w-1/2" />
                        </div>
                      </div>
                    )}
                    <div className="p-1.5 text-center">
                      <div className="text-[10px] font-bold text-gray-700">{t(opt.labelKey)}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom image upload */}
              {imageStyle === 'custom' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-kk-cream file:text-kk-brown hover:file:bg-kk-warm"
                  />
                  {customImageBase64 && (
                    <img
                      src={`data:image/png;base64,${customImageBase64}`}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!isInputValid}
              className="w-full py-3.5 bg-kk-red hover:bg-kk-red-deep text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t('school.viralCardMaker.generateButton')}
            </button>
          </>
        )}

        {/* ══════ LOADING PHASE ══════ */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-kk-cream rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-kk-red animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-600">{loadingText}</p>
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= loadingStep ? 'bg-kk-red' : 'bg-gray-200'
                  }`}
                />
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
              {isMock ? t('school.viralCardMaker.mockBadge') : t('school.viralCardMaker.aiBadge')}
            </div>

            {/* AI 실패 안내 + 재시도 */}
            {isMock && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs text-amber-700 mb-2">
                  {aiError || (aiEnabled ? 'AI 응답을 가져오지 못해서 예시 데이터를 보여드리고 있어요.' : 'API 키가 연결되지 않아 예시 데이터를 보여드리고 있어요.')}
                </p>
                <div className="flex gap-2">
                  {aiEnabled ? (
                    <button onClick={() => { setResult(null); setSlideImages([null, null, null, null]); setPhase('input'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                      <RefreshCw className="w-3 h-3" /> AI로 다시 생성하기
                    </button>
                  ) : (
                    <button onClick={() => navigate('/ai-welcome')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                      <Key className="w-3 h-3" /> API 키 연결하기
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Strategy Summary */}
            <div className="bg-kk-cream border border-kk-warm rounded-xl p-4">
              <SimpleMarkdown content={result.overallStrategy} className="text-sm text-kk-brown font-medium" />
            </div>

            {/* Card Preview - Mobile Swipe */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">{t('school.viralCardMaker.preview')}</h3>

              {/* Swipeable Cards */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-3 overflow-x-auto pb-3"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
              >
                {result.slides.map((slide, index) => (
                  <div
                    key={slide.step}
                    className="flex-shrink-0 w-full rounded-xl overflow-hidden"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {/* Card Visual */}
                    <div
                      className="relative aspect-square rounded-xl overflow-hidden"
                      style={{
                        background: slideImages[index]
                          ? undefined
                          : slide.colorScheme.gradient,
                      }}
                    >
                      {slideImages[index] ? (
                        <img
                          src={`data:image/png;base64,${slideImages[index]}`}
                          alt={slide.stepLabel}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : !imageLoadingDone && !isMock ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-white/70 animate-spin mx-auto mb-2" />
                            <span className="text-white/70 text-xs">{t('school.viralCardMaker.loading.image', '이미지 생성 중...')}</span>
                          </div>
                        </div>
                      ) : null}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-5">
                        {/* Step Badge */}
                        <div className="flex justify-between items-start">
                          <span className="bg-white/90 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            {STEP_ICONS[slide.step]} {slide.stepLabel}
                          </span>
                          <span className="text-white/80 text-xs font-bold">{index + 1}/4</span>
                        </div>
                        {/* Copy Text */}
                        <div className="text-white font-bold text-lg leading-snug whitespace-pre-line drop-shadow-lg">
                          {slide.copyText}
                        </div>
                      </div>
                    </div>

                    {/* Design Tip */}
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                      <span>\uD83D\uDCA1</span>
                      <span>{slide.designTip}</span>
                    </div>

                    {/* Slide Actions */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => copyToClipboard(slide.copyText, `slide-${index}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200"
                      >
                        {copiedField === `slide-${index}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copiedField === `slide-${index}` ? t('school.viralCardMaker.copied') : t('school.viralCardMaker.copy')}
                      </button>
                      <button
                        onClick={() => handleSaveSlideAsImage(index)}
                        aria-label="슬라이드 저장"
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      {!isMock && imageStyle !== 'custom' && (
                        <button
                          onClick={() => handleRegenerateImage(index)}
                          disabled={regeneratingImage !== null}
                          aria-label="이미지 재생성"
                          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                        >
                          {regeneratingImage === index
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <ImageIcon className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5 mt-2">
                {result.slides.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === activeSlide ? 'bg-kk-red' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center justify-center gap-2 py-3 bg-kk-cream text-kk-brown font-bold rounded-xl hover:bg-kk-warm transition-colors text-sm"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedField === 'all' ? t('school.viralCardMaker.copied') : t('school.viralCardMaker.copyAll')}
              </button>
              <button
                onClick={handleSaveAllSlides}
                className="flex items-center justify-center gap-2 py-3 bg-kk-cream text-kk-brown font-bold rounded-xl hover:bg-kk-warm transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                {t('school.viralCardMaker.saveAll')}
              </button>
              <button
                onClick={handleSaveToIdeaBox}
                className="flex items-center justify-center gap-2 py-3 bg-kk-cream text-kk-brown font-bold rounded-xl hover:bg-kk-warm transition-colors text-sm"
              >
                <Bookmark className="w-4 h-4" />
                {savedToIdeaBox ? t('school.viralCardMaker.savedToIdeaBox') : t('school.viralCardMaker.saveToIdeaBox')}
              </button>
              {myTeamId && (
                <button
                  onClick={handleSaveToTeamBox}
                  className="flex items-center justify-center gap-2 py-3 bg-kk-cream text-kk-brown font-bold rounded-xl hover:bg-kk-warm transition-colors text-sm"
                >
                  <Gem className="w-4 h-4" />
                  {savedToTeamBox ? '저장 완료!' : '💎 보석함'}
                </button>
              )}
              <button
                onClick={() => {
                  setResult(null);
                  setSlideImages([null, null, null, null]);
                  setPhase('input');
                }}
                className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                {t('school.viralCardMaker.generateButton')}
              </button>
            </div>

            {/* Completion Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              {completed && (
                <div className="py-3 bg-green-50 text-green-600 font-bold rounded-xl text-center">
                  {t('school.tools.alreadyCompleted')}
                </div>
              )}
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
