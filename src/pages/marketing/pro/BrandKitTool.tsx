import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { generateText, isGeminiEnabled } from '../../../services/gemini/geminiClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BrandKit {
  slogans: string[];
  usp: string;
  colors: { name: string; hex: string; usage: string }[];
  fonts: { name: string; usage: string }[];
  voiceGuide: string;
}

const MOCK_KIT: BrandKit = {
  slogans: [
    '당신의 일상에 특별함을 더하다',
    '작은 변화, 큰 행복',
    '매일이 새로운 시작',
  ],
  usp: '합리적 가격에 프리미엄 품질을 제공하는 유일한 브랜드. 지속가능한 소재와 한국적 감성을 결합하여 차별화된 경험을 선사합니다.',
  colors: [
    { name: '메인 컬러', hex: '#2563eb', usage: '로고, CTA 버튼, 주요 강조' },
    { name: '서브 컬러', hex: '#f59e0b', usage: '포인트, 배지, 알림' },
    { name: '배경 컬러', hex: '#f8fafc', usage: '페이지 배경, 카드' },
    { name: '텍스트 컬러', hex: '#1e293b', usage: '본문, 제목' },
    { name: '액센트', hex: '#ec4899', usage: '프로모션, 할인 배지' },
  ],
  fonts: [
    { name: 'Pretendard', usage: '본문, UI 텍스트 (가독성 우선)' },
    { name: 'Noto Serif Korean', usage: '제목, 슬로건 (고급스러운 인상)' },
  ],
  voiceGuide: '친근하면서도 신뢰감 있는 톤. 전문 용어보다 쉬운 표현을 사용하되, 지나치게 캐주얼하지 않게 유지합니다. "~해요" 체를 기본으로 하며, 고객을 존중하는 따뜻한 메시지를 전달합니다.',
};

function parseAIBrandKit(text: string): BrandKit | null {
  try {
    const slogans: string[] = [];
    const colors: BrandKit['colors'] = [];
    const fonts: BrandKit['fonts'] = [];
    let usp = '';
    let voiceGuide = '';

    const lines = text.split('\n');
    let section = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('슬로건') || trimmed.includes('Slogan')) { section = 'slogan'; continue; }
      if (trimmed.includes('USP') || trimmed.includes('차별화') || trimmed.includes('고유 가치')) { section = 'usp'; continue; }
      if (trimmed.includes('컬러') || trimmed.includes('Color') || trimmed.includes('팔레트')) { section = 'color'; continue; }
      if (trimmed.includes('폰트') || trimmed.includes('Font') || trimmed.includes('타이포')) { section = 'font'; continue; }
      if (trimmed.includes('보이스') || trimmed.includes('Voice') || trimmed.includes('톤앤매너')) { section = 'voice'; continue; }

      if (section === 'slogan' && trimmed.length > 2) {
        const cleaned = trimmed.replace(/^[-\d.)\s*"]+/, '').replace(/["']$/g, '').trim();
        if (cleaned) slogans.push(cleaned);
      }
      if (section === 'usp' && trimmed.length > 5) {
        usp += (usp ? ' ' : '') + trimmed.replace(/^[-*]\s*/, '');
      }
      if (section === 'color') {
        const hexMatch = trimmed.match(/#[0-9a-fA-F]{6}/);
        if (hexMatch) {
          const namePart = trimmed.split(hexMatch[0])[0].replace(/^[-*\d.)\s]+/, '').trim() || '컬러';
          const usagePart = trimmed.split(hexMatch[0])[1]?.replace(/^[:\-–\s]+/, '').trim() || '';
          colors.push({ name: namePart, hex: hexMatch[0], usage: usagePart });
        }
      }
      if (section === 'font' && trimmed.length > 2) {
        const cleaned = trimmed.replace(/^[-*\d.)\s]+/, '').trim();
        if (cleaned) {
          const parts = cleaned.split(/[:\-–]/);
          fonts.push({ name: parts[0].trim(), usage: parts.slice(1).join('-').trim() || '' });
        }
      }
      if (section === 'voice' && trimmed.length > 3) {
        voiceGuide += (voiceGuide ? ' ' : '') + trimmed.replace(/^[-*]\s*/, '');
      }
    }

    if (slogans.length === 0 && colors.length === 0) return null;
    return {
      slogans: slogans.length > 0 ? slogans.slice(0, 3) : MOCK_KIT.slogans,
      usp: usp || MOCK_KIT.usp,
      colors: colors.length > 0 ? colors : MOCK_KIT.colors,
      fonts: fonts.length > 0 ? fonts : MOCK_KIT.fonts,
      voiceGuide: voiceGuide || MOCK_KIT.voiceGuide,
    };
  } catch {
    return null;
  }
}

export default function BrandKitTool() {
  const navigate = useNavigate();
  const kitRef = useRef<HTMLDivElement>(null);
  const [brandName, setBrandName] = useState('');
  const [values, setValues] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMock, setIsMock] = useState(false);

  const aiEnabled = isGeminiEnabled();

  const handleGenerate = async () => {
    if (!brandName.trim()) return;
    setLoading(true);
    setKit(null);
    setIsMock(false);

    if (aiEnabled) {
      try {
        const prompt = `당신은 브랜드 전략 컨설턴트입니다. 아래 브랜드 정보를 바탕으로 브랜드 키트를 생성하세요.

브랜드명: ${brandName}
핵심 가치: ${values || '미입력'}
타겟 고객: ${targetAudience || '미입력'}
업종: ${industry || '미입력'}

다음 형식으로 작성하세요:

## 슬로건 (3개)
1. "첫 번째 슬로건"
2. "두 번째 슬로건"
3. "세 번째 슬로건"

## USP (고유 가치 제안)
이 브랜드만의 차별화 포인트를 2-3문장으로

## 컬러 팔레트 (5개, 반드시 HEX 코드 포함)
- 메인 컬러 #XXXXXX - 사용처 설명
- 서브 컬러 #XXXXXX - 사용처 설명
- 배경 #XXXXXX - 사용처 설명
- 텍스트 #XXXXXX - 사용처 설명
- 액센트 #XXXXXX - 사용처 설명

## 폰트 추천 (2개)
- 폰트명 - 사용처

## 브랜드 보이스 가이드
톤앤매너 설명 (3-4문장)

한국어로 작성하세요.`;

        const result = await generateText(prompt);
        if (result) {
          const parsed = parseAIBrandKit(result);
          if (parsed) {
            setKit(parsed);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }
    }

    setKit(MOCK_KIT);
    setIsMock(true);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!kit) return;
    const text = `브랜드: ${brandName}\n\n슬로건:\n${kit.slogans.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nUSP: ${kit.usp}\n\n컬러:\n${kit.colors.map((c) => `${c.name}: ${c.hex} (${c.usage})`).join('\n')}\n\n폰트:\n${kit.fonts.map((f) => `${f.name}: ${f.usage}`).join('\n')}\n\n보이스: ${kit.voiceGuide}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleExportPDF = async () => {
    if (!kitRef.current) return;
    try {
      const canvas = await html2canvas(kitRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`brand-kit-${brandName}.pdf`);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-purple-700 to-pink-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F3A8}'}</span>
            <h1 className="text-xl font-bold">브랜드 키트</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-purple-100 text-sm">브랜드 아이덴티티를 한 장으로 정리합니다</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">브랜드명 *</label>
            <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
              placeholder="예: 맑은하루, FreshDay" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">핵심 가치 (선택)</label>
            <input type="text" value={values} onChange={(e) => setValues(e.target.value)}
              placeholder="예: 자연, 건강, 지속가능성" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">타겟 고객 (선택)</label>
            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="예: 2030 건강에 관심 있는 직장인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">업종 (선택)</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
              placeholder="예: 건강식품, 뷰티, IT" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
          </div>
          <button onClick={handleGenerate} disabled={!brandName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${brandName.trim() && !loading ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</span> : '브랜드 키트 생성'}
          </button>
        </div>

        {/* Brand Kit Output */}
        {kit && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">AI 미연결: 샘플 브랜드 키트입니다.</p>
              </div>
            )}
            <div ref={kitRef} className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 space-y-6">
              <div className="text-center pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-extrabold text-gray-900">{brandName}</h2>
                <p className="text-xs text-gray-400 mt-1">Brand Identity Kit</p>
              </div>

              {/* Slogans */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">슬로건</h3>
                <div className="space-y-2">
                  {kit.slogans.map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-sm font-medium text-gray-800">"{s}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* USP */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">USP (고유 가치 제안)</h3>
                <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-4">{kit.usp}</p>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">컬러 팔레트</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {kit.colors.map((c, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
                      <div className="h-16" style={{ backgroundColor: c.hex }} />
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800">{c.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{c.hex}</p>
                        {c.usage && <p className="text-[10px] text-gray-400 mt-0.5">{c.usage}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">폰트 추천</h3>
                <div className="space-y-2">
                  {kit.fonts.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-sm font-semibold text-gray-800">{f.name}</span>
                      <span className="text-xs text-gray-500">{f.usage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Guide */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">브랜드 보이스 가이드</h3>
                <p className="text-sm text-gray-700 bg-purple-50 rounded-xl p-4">{kit.voiceGuide}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                {copied ? <><CheckCircle className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 텍스트 복사</>}
              </button>
              <button onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
                <Download className="w-4 h-4" /> 브랜드 키트 PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
