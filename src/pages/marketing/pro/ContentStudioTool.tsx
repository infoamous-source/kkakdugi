import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Sparkles, Trash2 } from 'lucide-react';
import { generateText, isGeminiEnabled } from '../../../services/gemini/geminiClient';
import html2canvas from 'html2canvas';

type SizePreset = 'feed' | 'story' | 'youtube';

const SIZE_MAP: Record<SizePreset, { label: string; w: number; h: number; ratio: string }> = {
  feed: { label: 'Instagram Feed (1:1)', w: 340, h: 340, ratio: '1:1' },
  story: { label: 'Story (9:16)', w: 270, h: 480, ratio: '9:16' },
  youtube: { label: 'YouTube Thumbnail (16:9)', w: 400, h: 225, ratio: '16:9' },
};

const TONES = [
  { value: 'emotional', label: '감성적' },
  { value: 'fun', label: '유머러스' },
  { value: 'professional', label: '전문적' },
  { value: 'trendy', label: '트렌디' },
  { value: 'minimal', label: '미니멀' },
];

const MOCK_COPIES = [
  '당신의 하루를 바꿀 특별한 경험\n지금 시작하세요',
  '일상에 스며드는 작은 행복\n매일이 선물이 되는 순간',
  '나를 위한 최고의 선택\n후회 없는 하루의 시작',
];

export default function ContentStudioTool() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [target, setTarget] = useState('');
  const [tone, setTone] = useState('emotional');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copies, setCopies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sizePreset, setSizePreset] = useState<SizePreset>('feed');
  const [copyCount, setCopyCount] = useState(3);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const aiEnabled = isGeminiEnabled();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setCopies([]);

    if (aiEnabled) {
      try {
        const prompt = `당신은 SNS 광고 카피라이터입니다.

제품/서비스: ${productName}
타겟: ${target || '일반 소비자'}
톤: ${TONES.find((t) => t.value === tone)?.label || tone}

위 정보로 광고 카피 ${copyCount}개를 생성하세요.

규칙:
- 각 카피는 2줄 이내 (줄바꿈 1회 가능)
- 한국어로 작성
- SNS 카드 이미지 위에 올라갈 텍스트
- 짧고 임팩트 있게
- 각 카피를 ---로 구분

예시:
당신의 하루를 바꿀 특별한 경험
지금 시작하세요
---
일상에 스며드는 작은 행복
매일이 선물이 되는 순간`;

        const result = await generateText(prompt);
        if (result) {
          const parsed = result.split('---').map((c) => c.trim()).filter((c) => c.length > 2);
          if (parsed.length > 0) {
            setCopies(parsed.slice(0, copyCount));
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }
    }

    setCopies(MOCK_COPIES.slice(0, copyCount));
    setLoading(false);
  };

  const handleEditCopy = useCallback((idx: number, newText: string) => {
    setCopies((prev) => prev.map((c, i) => i === idx ? newText : c));
  }, []);

  const handleExportPNG = async (idx: number) => {
    const el = cardRefs.current[idx];
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `content-${idx + 1}-${SIZE_MAP[sizePreset].ratio.replace(':', 'x')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { /* ignore */ }
  };

  const size = SIZE_MAP[sizePreset];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-pink-600 to-orange-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F4F1}'}</span>
            <h1 className="text-xl font-bold">콘텐츠 스튜디오</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-pink-100 text-sm">사진 + AI 카피로 SNS 광고 카드를 만드세요</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">제품/서비스명 *</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 수제 그래놀라" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">타겟 (선택)</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
              placeholder="예: 건강을 챙기는 2030" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">톤</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${tone === t.value ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">배경 사진 (선택)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100" />
            {imagePreview && (
              <div className="mt-2 relative inline-block">
                <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
                <button onClick={() => { setImagePreview(null); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">사이즈</label>
              <select value={sizePreset} onChange={(e) => setSizePreset(e.target.value as SizePreset)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none text-sm">
                {Object.entries(SIZE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">카피 수</label>
              <select value={copyCount} onChange={(e) => setCopyCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none text-sm">
                {[1, 2, 3, 5, 10].map((n) => <option key={n} value={n}>{n}개</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={!productName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${productName.trim() && !loading ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</span> : '광고 카드 생성'}
          </button>
        </div>

        {/* Card Previews */}
        {copies.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">생성된 카드 ({copies.length}개) - 텍스트를 클릭하여 편집 가능</h3>
            <div className="space-y-6">
              {copies.map((copy, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    className="relative overflow-hidden rounded-2xl flex items-center justify-center"
                    style={{
                      width: size.w,
                      height: size.h,
                      backgroundColor: imagePreview ? undefined : '#1e293b',
                    }}
                  >
                    {imagePreview && (
                      <img src={imagePreview} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    <div
                      className="relative z-10 text-white text-center px-6 font-bold leading-relaxed"
                      style={{ fontSize: sizePreset === 'story' ? '18px' : '20px' }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleEditCopy(idx, e.currentTarget.textContent || '')}
                    >
                      {copy}
                    </div>
                  </div>
                  <button onClick={() => handleExportPNG(idx)}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                    <Download className="w-4 h-4" /> PNG 다운로드
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
