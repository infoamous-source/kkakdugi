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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const FONT_OPTIONS = ['Pretendard', 'Noto Sans KR', 'Spoqa Han Sans Neo', 'Noto Serif KR', 'IBM Plex Sans KR', 'Wanted Sans'];

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
                  <p className="text-[11px] text-gray-600 line-clamp-2">{String(kit.usp || '').slice(0, 80)}...</p>
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
                onClick={() => setShowFullReport(!showFullReport)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-700 to-pink-500 text-white rounded-xl text-base font-bold hover:from-purple-600 hover:to-pink-400 transition-all shadow-lg"
              >
                <FileText className="w-5 h-5" />
                {showFullReport ? '레포트 접기' : '자세한 레포트 보기'}
                <ChevronDown className={`w-5 h-5 transition-transform ${showFullReport ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 자세한 레포트 (펼침) */}
            {showFullReport && (
              <>
                <div ref={kitRef} className="space-y-4 mb-4">
                  {/* USP */}
                  <EditableSection
                    title="우리 브랜드만의 매력 (USP)"
                    content={typeof kit.usp === 'string' ? kit.usp : JSON.stringify(kit.usp, null, 2)}
                    onSave={(val) => setKit(prev => prev ? { ...prev, usp: val } : prev)}
                  />

                  {/* Slogans */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 text-sm">슬로건 (3개)</h3>
                      <button onClick={handleRegenerateSlogans} disabled={regeneratingSlogans}
                        className="p-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 text-purple-500 disabled:opacity-50" title="슬로건 3개 재생성">
                        <RotateCcw className={`w-3.5 h-3.5 ${regeneratingSlogans ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {kit.slogans.map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                          <input type="text" value={s}
                            onChange={(e) => {
                              const newSlogans = [...kit.slogans];
                              newSlogans[i] = e.target.value;
                              setKit(prev => prev ? { ...prev, slogans: newSlogans } : prev);
                            }}
                            className="w-full bg-transparent text-center text-sm font-medium text-gray-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 rounded-lg px-2 py-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors - 5 Color Pickers */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 text-sm mb-3">컬러 팔레트 (5색)</h3>
                    <div className="space-y-2">
                      {kit.colors.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg shrink-0 border border-gray-200" style={{ backgroundColor: c.hex }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-gray-700 truncate">{c.name}</span>
                              <span className="text-[10px] text-gray-400 shrink-0">{c.hex}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 truncate">{c.usage}</p>
                          </div>
                          <ColorPickerInput
                            label=""
                            color={c.hex}
                            onChange={(hex) => handleColorChange(i, hex)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex rounded-lg overflow-hidden mt-3 h-8">
                      {kit.colors.map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                  </div>

                  {/* Fonts */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 text-sm mb-3">폰트</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">제목 폰트</label>
                        <select value={kit.fonts.heading} onChange={(e) => handleFontChange('heading', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none">
                          {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">본문 폰트</label>
                        <select value={kit.fonts.body} onChange={(e) => handleFontChange('body', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none">
                          {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-400 mb-1">미리보기</p>
                      <p className="text-lg font-bold text-gray-900" style={{ fontFamily: kit.fonts.heading }}>제목 텍스트 Heading</p>
                      <p className="text-sm text-gray-700" style={{ fontFamily: kit.fonts.body }}>본문 텍스트입니다. Body text sample.</p>
                    </div>
                  </div>

                  {/* Voice Guide */}
                  <EditableSection
                    title="브랜드 말투 가이드"
                    content={typeof kit.voiceGuide === 'string' ? kit.voiceGuide : JSON.stringify(kit.voiceGuide, null, 2)}
                    onSave={(val) => setKit(prev => prev ? { ...prev, voiceGuide: val } : prev)}
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                    {copied ? <><CheckCircle className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 텍스트 복사</>}
                  </button>
                  <button onClick={handleExportPDF}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-purple-600 text-white rounded-xl text-base font-bold hover:bg-purple-700 transition-colors shadow-lg">
                    <Download className="w-5 h-5" /> 브랜드 키트 PDF 저장
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
