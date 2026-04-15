import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Sparkles, Plus, Trash2, GripVertical, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import { generateLandingSections } from '../../../services/gemini/proLandingService';
import type { LandingSection, SectionType } from '../../../services/gemini/proLandingService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import EditableSection from '../pro/common/EditableSection';
import ColorPickerInput from '../pro/common/ColorPickerInput';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type PreviewSize = 'mobile' | 'tablet' | 'desktop';
const PREVIEW_WIDTHS: Record<PreviewSize, number> = { mobile: 340, tablet: 540, desktop: 720 };

const SECTION_TYPE_OPTIONS: { value: SectionType; label: string }[] = [
  { value: 'hero', label: '히어로' },
  { value: 'features', label: '특징/기능' },
  { value: 'testimonial', label: '고객 후기' },
  { value: 'pricing', label: '가격' },
  { value: 'cta', label: 'CTA' },
  { value: 'faq', label: 'FAQ' },
  { value: 'team', label: '팀 소개' },
  { value: 'guarantee', label: '보증/환불' },
];

export default function LandingBuilderTool() {
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const profile = useUserProfile();
  const { progress } = useSchoolProgress();
  const schoolData = progress?.marketCompassData;

  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [target, setTarget] = useState('');
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>('mobile');
  const [showSchoolBanner, setShowSchoolBanner] = useState(true);

  const aiEnabled = isGeminiEnabled();

  // Prefill from school data (PerfectPlanner)
  useEffect(() => {
    if (schoolData?.perfectPlannerResult) {
      const r = schoolData.perfectPlannerResult;
      if (!productName && r.input.productName) setProductName(r.input.productName);
    }
  }, [schoolData]);

  const schoolSummary = schoolData?.perfectPlannerResult
    ? `퍼펙트플래너 제품: "${schoolData.perfectPlannerResult.input.productName}", 상세페이지 기획 완료`
    : '';

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setSections([]);
    setIsMock(false);

    const ppResult = schoolData?.perfectPlannerResult?.output?.detailPage;
    const existingData = ppResult ? {
      headline: ppResult.headline,
      painPoints: ppResult.painPoints?.map(p => p.text),
      features: ppResult.features?.map(f => f.title),
    } : undefined;

    const result = await generateLandingSections({
      brandName: productName,
      target,
      productDesc,
      existingData,
    }, profile);
    setSections(result.sections);
    setIsMock(result.isMock);
    setLoading(false);
  };

  const addSection = () => {
    const id = `sec_${Date.now()}`;
    setSections(prev => [...prev, { id, type: 'features', title: '새 섹션', content: '내용을 입력하세요', bgColor: '#ffffff' }]);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    setSections(prev => {
      const arr = [...prev];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const updateSection = (id: string, updates: Partial<LandingSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const sectionBg = (type: SectionType) => {
    switch (type) {
      case 'hero': return 'bg-gradient-to-b from-gray-900 to-gray-800 text-white';
      case 'features': return 'bg-white text-gray-900';
      case 'testimonial': return 'bg-blue-50 text-gray-900';
      case 'pricing': return 'bg-gray-50 text-gray-900';
      case 'cta': return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      case 'faq': return 'bg-white text-gray-900';
      case 'team': return 'bg-gray-50 text-gray-900';
      case 'guarantee': return 'bg-green-50 text-gray-900';
      default: return 'bg-white text-gray-900';
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let y = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      while (y < pdfHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight);
        y += pageHeight;
      }
      pdf.save(`landing-${productName}.pdf`);
    } catch { /* ignore */ }
  };

  const previewWidth = PREVIEW_WIDTHS[previewSize];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F6D2}'}</span>
            <h1 className="text-xl font-bold">랜딩페이지 프로</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-blue-100 text-sm">섹션 추가/삭제/순서변경 + CTA 편집 + 반응형 프리뷰</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">제품/서비스명 *</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
              placeholder="예: AI 마케팅 자동화 툴" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">제품 설명 (선택)</label>
            <textarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)} rows={3}
              placeholder="예: 자동 SNS 게시, AI 카피 생성, 실시간 분석"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">타겟 (선택)</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
              placeholder="예: 소상공인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
          </div>
          <button onClick={handleGenerate} disabled={!productName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${productName.trim() && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</span> : '랜딩페이지 생성'}
          </button>
        </div>

        {/* Sections Editor + Preview */}
        {sections.length > 0 && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">AI 미연결: 샘플 랜딩페이지입니다.</p>
              </div>
            )}

            {/* Section Editor */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">섹션 편집 ({sections.length}개)</h3>
                <button onClick={addSection}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                  <Plus className="w-3 h-3" /> 섹션 추가
                </button>
              </div>
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div key={section.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex flex-col">
                        <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                        <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                      </div>
                      <GripVertical className="w-3 h-3 text-gray-300" />
                      <select value={section.type}
                        onChange={(e) => updateSection(section.id, { type: e.target.value as SectionType })}
                        className="px-2 py-1 border border-gray-200 rounded-lg text-xs">
                        {SECTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input type="text" value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs" />
                      <button onClick={() => removeSection(section.id)}
                        className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={2} className="w-full px-2 py-1 border border-gray-100 rounded-lg text-xs resize-none" />
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">배경:</span>
                        <input type="color" value={section.bgColor || '#ffffff'}
                          onChange={(e) => updateSection(section.id, { bgColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                      </div>
                      {(section.type === 'hero' || section.type === 'cta') && (
                        <>
                          <input type="text" value={section.ctaText || ''}
                            onChange={(e) => updateSection(section.id, { ctaText: e.target.value })}
                            placeholder="CTA 버튼 텍스트"
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs w-40" />
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">CTA색:</span>
                            <input type="color" value={section.ctaColor || '#F59E0B'}
                              onChange={(e) => updateSection(section.id, { ctaColor: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Size Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">미리보기</h3>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {([
                  { key: 'mobile' as const, icon: Smartphone, label: '모바일' },
                  { key: 'tablet' as const, icon: Tablet, label: '태블릿' },
                  { key: 'desktop' as const, icon: Monitor, label: '데스크톱' },
                ] as const).map(({ key, icon: Icon, label }) => (
                  <button key={key} onClick={() => setPreviewSize(key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${previewSize === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Landing Preview */}
            <div className="flex justify-center mb-6">
              <div ref={previewRef}
                className="rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl transition-all duration-300"
                style={{ width: previewWidth }}>
                {sections.map((section) => (
                  <div key={section.id}
                    className={`relative ${section.bgColor ? '' : sectionBg(section.type)}`}
                    style={section.bgColor ? { backgroundColor: section.bgColor, color: isLightColor(section.bgColor) ? '#111827' : '#ffffff' } : undefined}>
                    {section.image && (
                      <img src={section.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )}
                    <div className="relative p-6">
                      <h3 className={`text-lg font-bold mb-3 ${section.type === 'hero' ? 'text-center' : ''}`}>
                        {section.title}
                      </h3>
                      {section.content.split('\n').map((line, li) => (
                        <p key={li} className={`text-sm mb-1 ${section.type === 'hero' ? 'text-center opacity-80' : 'opacity-90'}`}>
                          {line}
                        </p>
                      ))}
                      {section.ctaText && (
                        <div className="mt-4 text-center">
                          <span className="inline-block px-6 py-2 font-bold rounded-full text-sm"
                            style={{ backgroundColor: section.ctaColor || '#F59E0B', color: '#ffffff' }}>
                            {section.ctaText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" /> 포트폴리오 PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Simple helper to check if a hex color is light */
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
