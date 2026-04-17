import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Download, Sparkles, Trash2, RotateCcw,
  Upload, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import {
  generateAdCards, regenerateCardCopy, STAGE_LABELS,
  type CardSlide, type AdTone,
} from '../../../services/gemini/proContentStudioService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import html2canvas from 'html2canvas';

type SizePreset = 'feed' | 'story' | 'youtube';

const SIZE_MAP: Record<SizePreset, { label: string; w: number; h: number; ratio: string }> = {
  feed: { label: 'Feed (1:1)', w: 340, h: 340, ratio: '1:1' },
  story: { label: 'Story (9:16)', w: 270, h: 480, ratio: '9:16' },
  youtube: { label: 'YouTube (16:9)', w: 400, h: 225, ratio: '16:9' },
};

const TONE_OPTIONS: { value: AdTone; label: string }[] = [
  { value: 'emotional', label: '감성' },
  { value: 'fun', label: '재미' },
  { value: 'informative', label: '정보' },
  { value: 'trendy', label: '트렌디' },
];

const CARD_COUNTS = [2, 3, 4, 5, 6];

export default function ContentStudioTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
  const { progress } = useSchoolProgress();
  const schoolData = progress?.marketCompassData;

  // Inputs
  const [productName, setProductName] = useState('');
  const [target, setTarget] = useState('');
  const [tone, setTone] = useState<AdTone>('emotional');
  const [cardCount, setCardCount] = useState(4);
  const [sizePreset, setSizePreset] = useState<SizePreset>('feed');

  // Results
  const [cards, setCards] = useState<CardSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [regenIdx, setRegenIdx] = useState<number | null>(null);
  const [showSchoolBanner, setShowSchoolBanner] = useState(true);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const aiEnabled = isGeminiEnabled();

  // Prefill from school data (ViralCard)
  useEffect(() => {
    if (schoolData?.viralCardResult) {
      const r = schoolData.viralCardResult;
      if (!productName && r.input.productName) setProductName(r.input.productName);
      if (r.input.tone === 'spicy') setTone('fun');
      else if (r.input.tone === 'emotional') setTone('emotional');
      else if (r.input.tone === 'informative') setTone('informative');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolData]);

  const schoolSummary = schoolData?.viralCardResult
    ? `바이럴카드 제품: "${schoolData.viralCardResult.input.productName}", 카피 ${schoolData.viralCardResult.output.slides.length}장`
    : '';

  // --- Generate ---
  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setCards([]);
    setIsMock(false);

    const existingCopies = schoolData?.viralCardResult?.output.slides.map(s => s.copyText);
    const result = await generateAdCards({
      productName: productName.trim(),
      target: target.trim() || '일반 소비자',
      tone,
      cardCount,
      existingData: existingCopies?.length ? { copyTexts: existingCopies } : undefined,
    }, profile);

    setCards(result.cards);
    setIsMock(result.isMock);
    setLoading(false);
  };

  // --- Card Image Upload ---
  const handleCardImageUpload = useCallback((idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCards(prev => prev.map((c, i) => i === idx ? { ...c, image: reader.result as string } : c));
    };
    reader.readAsDataURL(file);
  }, []);

  const removeCardImage = useCallback((idx: number) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, image: undefined } : c));
  }, []);

  // --- Inline Edit ---
  const handleEditCopy = useCallback((idx: number, newText: string) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, copyText: newText } : c));
  }, []);

  // --- Per-Card Style ---
  const updateCardStyle = useCallback((idx: number, updates: Partial<CardSlide>) => {
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, ...updates } : c));
  }, []);

  // --- Regenerate Single Card Copy ---
  const handleRegenCard = async (idx: number) => {
    setRegenIdx(idx);
    const result = await regenerateCardCopy(idx, cards, { productName, target, tone }, profile);
    if (result) {
      setCards(prev => prev.map((c, i) => i === idx ? { ...c, copyText: result.copyText, highlightWord: result.highlightWord } : c));
    }
    setRegenIdx(null);
  };

  // --- Export PNG ---
  const handleExportPNG = async (idx: number) => {
    const el = cardRefs.current[idx];
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `ad-card-${idx + 1}-${SIZE_MAP[sizePreset].ratio.replace(':', 'x')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { /* ignore */ }
  };

  const handleExportAll = async () => {
    for (let i = 0; i < cards.length; i++) {
      await handleExportPNG(i);
    }
  };

  const size = SIZE_MAP[sizePreset];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-orange-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F4F1}'}</span>
            <h1 className="text-xl font-bold">콘텐츠 스튜디오 프로</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-pink-100 text-sm">AI가 광고 문구를 만들고, 사진도 넣고, 직접 수정할 수 있어요</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">제품/브랜드명 *</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="예: 수제 그래놀라" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">고객 (선택)</label>
              <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
                placeholder="예: 건강을 챙기는 2030" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none text-sm" />
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">톤</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tone === t.value ? 'bg-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">카드 수 (2~6장)</label>
            <div className="flex gap-2">
              {CARD_COUNTS.map(n => (
                <button key={n} onClick={() => setCardCount(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${cardCount === n ? 'bg-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Size Preset */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">사이즈</label>
            <div className="flex gap-2">
              {(Object.entries(SIZE_MAP) as [SizePreset, typeof SIZE_MAP['feed']][]).map(([k, v]) => (
                <button key={k} onClick={() => setSizePreset(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sizePreset === k ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Marketing Formula Hint */}
          <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl">
            <p className="text-xs text-pink-700 font-medium">학교에서 배운 마케팅 규칙이 자동 적용돼요</p>
          </div>

          <button onClick={handleGenerate} disabled={!productName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${productName.trim() && !loading ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> AI가 카드를 만들고 있어요...</span> : '광고 카드 생성'}
          </button>
        </div>

        {/* Generated Cards */}
        {cards.length > 0 && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">지금은 예시 카드예요. AI가 연결되면 내 상품에 맞는 진짜 카드가 나와요!</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">생성된 카드 ({cards.length}장)</h3>
              <button onClick={handleExportAll}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow">
                <Download className="w-4 h-4" /> 전체 다운로드
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card, idx) => (
                <div key={card.id} className="space-y-3">
                  {/* Stage Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                      {idx + 1}. {STAGE_LABELS[card.stage]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleRegenCard(idx)} disabled={regenIdx === idx}
                        className="p-1 text-gray-400 hover:text-pink-500 disabled:opacity-50" title="이 카드 카피 재생성">
                        <RotateCcw className={`w-3.5 h-3.5 ${regenIdx === idx ? 'animate-spin' : ''}`} />
                      </button>
                      <button onClick={() => handleExportPNG(idx)}
                        className="p-1 text-gray-400 hover:text-gray-700" title="PNG 다운로드">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    className="relative overflow-hidden rounded-2xl flex items-center justify-center cursor-pointer group"
                    style={{
                      width: size.w,
                      height: size.h,
                      backgroundColor: card.image ? undefined : card.bgColor,
                      maxWidth: '100%',
                    }}
                  >
                    {card.image && (
                      <img src={card.image} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${card.overlayOpacity})` }} />
                    <div
                      className="relative z-10 text-center px-6"
                      style={{
                        fontWeight: 900,
                        lineHeight: 1.15,
                        letterSpacing: '-0.5px',
                        fontFamily: "'Black Han Sans','Pretendard',sans-serif",
                        fontSize: `${Math.min(card.fontSize, card.copyText.length > 30 ? 18 : 22)}px`,
                        color: card.textColor,
                        textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        maxHeight: '70%',
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleEditCopy(idx, e.currentTarget.textContent || '')}
                    >
                      {card.copyText.split('\n').map((line, li) => {
                        const hi = card.highlightWord;
                        if (hi && line.includes(hi)) {
                          const [before, ...rest] = line.split(hi);
                          return <div key={li}>{before}<span style={{ color: '#FBBF24' }}>{hi}</span>{rest.join(hi)}</div>;
                        }
                        return <div key={li}>{line}</div>;
                      })}
                    </div>

                    {/* Image Upload Overlay */}
                    <label className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <div className="bg-black/50 rounded-full p-3">
                        {card.image ? <ImageIcon className="w-5 h-5 text-white" /> : <Upload className="w-5 h-5 text-white" />}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCardImageUpload(idx, e)} />
                    </label>
                  </div>

                  {/* Per-Card Controls */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    {/* Image Controls */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg cursor-pointer text-[11px] text-gray-600 hover:bg-gray-100 transition-colors">
                        <Upload className="w-3 h-3" />
                        {card.image ? '사진 교체' : '사진 추가'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCardImageUpload(idx, e)} />
                      </label>
                      {card.image && (
                        <button onClick={() => removeCardImage(idx)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-500 hover:text-red-700">
                          <Trash2 className="w-3 h-3" /> 삭제
                        </button>
                      )}
                    </div>

                    {/* Style Sliders */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block">글자 크기: {card.fontSize}px</label>
                        <input type="range" min={14} max={36} value={card.fontSize}
                          onChange={(e) => updateCardStyle(idx, { fontSize: Number(e.target.value) })}
                          className="w-full accent-pink-600 h-1" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block">오버레이: {Math.round(card.overlayOpacity * 100)}%</label>
                        <input type="range" min={0} max={80} value={Math.round(card.overlayOpacity * 100)}
                          onChange={(e) => updateCardStyle(idx, { overlayOpacity: Number(e.target.value) / 100 })}
                          className="w-full accent-pink-600 h-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-500">글자색</label>
                        <input type="color" value={card.textColor}
                          onChange={(e) => updateCardStyle(idx, { textColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-500">배경색</label>
                        <input type="color" value={card.bgColor}
                          onChange={(e) => updateCardStyle(idx, { bgColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={handleGenerate} disabled={loading}
                className="flex items-center justify-center gap-2 py-3 bg-pink-600 text-white rounded-xl text-sm font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50">
                <Sparkles className="w-4 h-4" /> 전체 재생성
              </button>
              <button onClick={handleExportAll}
                className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors shadow-lg">
                <Download className="w-5 h-5" /> 전체 PNG 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
