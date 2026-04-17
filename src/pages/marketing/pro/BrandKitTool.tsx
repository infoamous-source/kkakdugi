import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Copy, CheckCircle, Sparkles, RotateCcw, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import { generateBrandKit, regenerateSlogans } from '../../../services/gemini/proBrandKitService';
import type { BrandKitData } from '../../../services/gemini/proBrandKitService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import EditableSection from '../pro/common/EditableSection';
import ColorPickerInput from '../pro/common/ColorPickerInput';
import BrandKitReportView from '../pro/common/BrandKitReportView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const FONT_OPTIONS = ['Pretendard', 'Noto Sans KR', 'Spoqa Han Sans Neo', 'Noto Serif KR', 'IBM Plex Sans KR', 'Wanted Sans'];

/** AI가 객체로 반환할 때 읽기 좋은 텍스트로 변환 */
function toReadableText(val: unknown): string {
  if (typeof val === 'string') return val;
  if (!val) return '';
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    // {summary, details} 패턴
    if (obj.summary || obj.details) {
      return [obj.summary, obj.details].filter(Boolean).join('\n\n');
    }
    // 일반 객체 — key: value 형태로
    return Object.entries(obj)
      .map(([k, v]) => typeof v === 'string' ? `**${k}**: ${v}` : `**${k}**: ${JSON.stringify(v)}`)
      .join('\n');
  }
  return String(val);
}

export default function BrandKitTool() {
  const navigate = useNavigate();
  const kitRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const profile = useUserProfile();
  const { progress } = useSchoolProgress();
  const schoolData = progress?.marketCompassData;

  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [target, setTarget] = useState('');
  const [mood, setMood] = useState('');
  const [kit, setKit] = useState<BrandKitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [regeneratingSlogans, setRegenSlogans] = useState(false);
  const [showSchoolBanner, setShowSchoolBanner] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  const aiEnabled = isGeminiEnabled();

  // Prefill from school data (EdgeMaker)
  useEffect(() => {
    if (schoolData?.edgeMakerResult) {
      const r = schoolData.edgeMakerResult;
      if (!brandName && r.output.brandNames?.[0]) setBrandName(r.output.brandNames[0].name);
      if (!mood && r.output.brandMood?.tone) setMood(r.output.brandMood.tone);
    }
  }, [schoolData]);

  const schoolSummary = schoolData?.edgeMakerResult
    ? `엣지메이커 USP: "${schoolData.edgeMakerResult.output.usp?.slice(0, 40)}...", 슬로건: "${schoolData.edgeMakerResult.output.slogan?.slice(0, 30)}..."`
    : '';

  const handleGenerate = async () => {
    if (!brandName.trim()) return;
    setLoading(true);
    setKit(null);
    setIsMock(false);

    const ed = schoolData?.edgeMakerResult?.output;
    const existingData = ed ? {
      usp: ed.usp,
      slogan: ed.slogan,
      primaryColor: ed.brandMood?.primaryColor,
      secondaryColor: ed.brandMood?.secondaryColor,
      tone: ed.brandMood?.tone,
    } : undefined;

    const result = await generateBrandKit({ brandName, industry, target, mood, existingData }, profile);
    setKit(result.kit);
    setIsMock(result.isMock);
    setLoading(false);
  };

  const handleRegenerateSlogans = async () => {
    if (!kit) return;
    setRegenSlogans(true);
    const newSlogans = await regenerateSlogans(kit, brandName, profile);
    if (newSlogans) {
      setKit(prev => prev ? { ...prev, slogans: newSlogans } : prev);
    }
    setRegenSlogans(false);
  };

  const handleColorChange = (idx: number, hex: string) => {
    if (!kit) return;
    setKit(prev => {
      if (!prev) return prev;
      const colors = [...prev.colors];
      colors[idx] = { ...colors[idx], hex };
      return { ...prev, colors };
    });
  };

  const handleFontChange = (type: 'heading' | 'body', value: string) => {
    if (!kit) return;
    setKit(prev => prev ? { ...prev, fonts: { ...prev.fonts, [type]: value } } : prev);
  };

  const handleCopy = async () => {
    if (!kit) return;
    const text = `브랜드: ${brandName}\n\nUSP: ${kit.usp}\n\n슬로건:\n${kit.slogans.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n컬러:\n${kit.colors.map(c => `${c.name}: ${c.hex} (${c.usage})`).join('\n')}\n\n폰트: 제목=${kit.fonts.heading}, 본문=${kit.fonts.body}\n\n보이스: ${kit.voiceGuide}`;
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
            <h1 className="text-xl font-bold">브랜드 키트 프로</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-purple-100 text-sm">내 브랜드만의 매력 문장 + 슬로건 + 색상 + 글꼴을 한번에 만들어요</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">브랜드명 *</label>
            <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
              placeholder="예: 맑은하루, FreshDay" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">업종</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                placeholder="예: 건강식품" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">고객</label>
              <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
                placeholder="예: 2030 직장인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">브랜드 느낌</label>
            <input type="text" value={mood} onChange={(e) => setMood(e.target.value)}
              placeholder="예: 따뜻한, 모던한, 프리미엄" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-sm" />
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
                <p className="text-xs text-yellow-700">지금은 예시 브랜드 키트예요. AI가 연결되면 내 브랜드에 맞는 진짜 키트가 나와요!</p>
              </div>
            )}

            {/* 요약 카드 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-extrabold text-gray-900">{brandName}</h2>
                <p className="text-xs text-gray-400 mt-1">Brand Identity Kit</p>
              </div>

              {/* 요약 미리보기 */}
              <div className="space-y-2 mb-5">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs font-bold text-purple-700 mb-1">우리 브랜드만의 매력</p>
                  <p className="text-[11px] text-gray-600 line-clamp-2">{toReadableText(kit.usp).slice(0, 80)}...</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-700 mb-1">슬로건</p>
                  <p className="text-[11px] text-gray-600">{kit.slogans[0]}</p>
                </div>
                <div className="flex rounded-lg overflow-hidden h-8">
                  {kit.colors.map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>

              {/* 자세한 레포트 보기 버튼 */}
              <button
                onClick={() => setShowFullReport(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-700 to-pink-500 text-white rounded-xl text-base font-bold hover:from-purple-600 hover:to-pink-400 transition-all shadow-lg"
              >
                <FileText className="w-5 h-5" />
                자세한 레포트 보기
              </button>

              <button onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                {copied ? <><CheckCircle className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 텍스트 복사</>}
              </button>
            </div>

            {/* 풀스크린 레포트 뷰 */}
            {showFullReport && (
              <BrandKitReportView
                kit={kit}
                brandName={brandName}
                onClose={() => setShowFullReport(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
