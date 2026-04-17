import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Download, Sparkles, Plus, Trash2, GripVertical,
  Monitor, Tablet, Smartphone, Image as ImageIcon, X,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import { generateLandingSections } from '../../../services/gemini/proLandingService';
import type { LandingSection, SectionType } from '../../../services/gemini/proLandingService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import EditableSection from '../pro/common/EditableSection';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type PreviewSize = 'mobile' | 'tablet' | 'desktop';
const PREVIEW_WIDTHS: Record<PreviewSize, number> = { mobile: 340, tablet: 540, desktop: 720 };

const SECTION_TYPE_OPTIONS: { value: SectionType; label: string; emoji: string }[] = [
  { value: 'hero', label: '히어로 (첫 화면)', emoji: '🎬' },
  { value: 'features', label: '3가지 약속 (기능)', emoji: '✅' },
  { value: 'testimonial', label: '고객 후기', emoji: '💬' },
  { value: 'pricing', label: '가격/할인', emoji: '💰' },
  { value: 'cta', label: 'CTA (구매 유도)', emoji: '🛒' },
  { value: 'faq', label: 'FAQ', emoji: '❓' },
  { value: 'team', label: '팀/브랜드 소개', emoji: '👥' },
  { value: 'guarantee', label: '보증/환불 정책', emoji: '🛡️' },
];

/**
 * 랜딩페이지 프로 — 전면 리뉴얼
 *
 * 학교 도구(퍼펙트플래너) 마케팅 규칙 반영:
 * - 어그로 한 줄 (B형 호기심 / C형 사회적 증거)
 * - painPoints = "~한 사람!" 형태
 * - features = 3가지 약속 (amber/green/blue)
 * - headline = 구어체, 캐주얼, 스크롤 멈추게
 * - reviews = 실감나는 구체적 상황
 *
 * 프로 업그레이드:
 * - 섹션 추가/삭제/순서변경
 * - 섹션별 이미지 업로드 (자유롭게 중간에 배치)
 * - CTA 버튼 텍스트/색상 편집
 * - 모바일/태블릿/데스크톱 프리뷰
 * - 학교 데이터(퍼펙트플래너) 자동 프리필
 */
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
  const [offers, setOffers] = useState('');
  const [strengths, setStrengths] = useState('');
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
      const dp = r.output?.detailPage;
      if (!productName && r.input?.productName) setProductName(r.input.productName);
      if (!target && r.input?.customers) setTarget(Array.isArray(r.input.customers) ? r.input.customers.join(', ') : String(r.input.customers));
      if (!strengths && r.input?.strengths) setStrengths(Array.isArray(r.input.strengths) ? r.input.strengths.join(', ') : String(r.input.strengths));
      if (!offers && r.input?.offers) setOffers(Array.isArray(r.input.offers) ? r.input.offers.join(', ') : String(r.input.offers));
    }
  }, [schoolData]);

  const schoolSummary = schoolData?.perfectPlannerResult
    ? `퍼펙트플래너: "${schoolData.perfectPlannerResult.input?.productName}", 고객·장점·혜택 반영됨`
    : '';

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setSections([]);
    setIsMock(false);

    const ppResult = schoolData?.perfectPlannerResult?.output?.detailPage;
    const existingData = ppResult ? {
      headline: ppResult.headline,
      painPoints: ppResult.painPoints?.map((p: { text: string }) => p.text),
      features: ppResult.features?.map((f: { title: string }) => f.title),
      reviews: ppResult.reviews?.map((r: { text: string }) => r.text),
      price: ppResult.salePrice ? `${ppResult.salePrice}원` : undefined,
      ctaText: ppResult.stickyCtaText,
    } : undefined;

    const result = await generateLandingSections({
      brandName: productName,
      target: target || '일반 고객',
      productDesc: productDesc || `${strengths}. 혜택: ${offers}`,
      existingData,
    }, profile);
    setSections(result.sections);
    setIsMock(result.isMock);
    setLoading(false);
  };

  const addSection = (type: SectionType = 'features') => {
    const id = `sec_${Date.now()}`;
    setSections(prev => [...prev, {
      id, type, title: '새 섹션', content: '내용을 입력하세요',
      bgColor: type === 'hero' || type === 'cta' ? '#4F46E5' : '#ffffff',
      ctaText: type === 'cta' || type === 'hero' ? '지금 시작하기' : undefined,
      ctaColor: '#F59E0B',
    }]);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= sections.length) return;
    setSections(prev => {
      const arr = [...prev];
      [arr[idx], arr[tgt]] = [arr[tgt], arr[idx]];
      return arr;
    });
  };

  const updateSection = (id: string, updates: Partial<LandingSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // 섹션별 이미지 업로드
  const handleImageUpload = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateSection(sectionId, { image: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
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
          <p className="text-blue-100 text-sm">학교에서 만든 상세페이지를 진짜 홈페이지처럼 업그레이드해요</p>
          <p className="text-blue-200 text-xs mt-1">내용 추가/삭제/순서 바꾸기 · 사진 넣기 · 구매 버튼 편집 · 미리보기</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Input Form — 학교 퍼펙트플래너 입력 구조 반영 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">상품/브랜드명 *</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="예: 하루한끼 도시락" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">주요 고객</label>
              <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
                placeholder="예: 바쁜 직장인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">다른 곳에 없는 장점</label>
              <input type="text" value={strengths} onChange={(e) => setStrengths(e.target.value)}
                placeholder="예: 전문 셰프가 매일 조리" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">오늘의 특별 혜택</label>
              <input type="text" value={offers} onChange={(e) => setOffers(e.target.value)}
                placeholder="예: 첫 주문 30% 할인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">추가 설명 (선택)</label>
            <textarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)} rows={2}
              placeholder="예: 매일 새벽 배송, 1인분 포장, 칼로리 표기"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm resize-none" />
          </div>

          {/* 마케팅 규칙 힌트 */}
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
            <p className="text-xs text-purple-700 font-medium mb-1">💡 학교에서 배운 마케팅 규칙이 자동 적용돼요</p>
            <p className="text-[11px] text-purple-600">
              눈길 끄는 첫 문장 · 고객의 고민 · 3가지 약속 · 진짜 후기 · 친근한 말투
            </p>
          </div>

          <button onClick={handleGenerate} disabled={!productName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${productName.trim() && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> AI가 상세페이지를 만들고 있어요...</span> : '🚀 랜딩페이지 생성'}
          </button>
        </div>

        {/* Sections Editor + Preview */}
        {sections.length > 0 && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">지금은 예시 랜딩페이지예요. AI가 연결되면 내 상품에 맞는 진짜 페이지가 나와요!</p>
              </div>
            )}

            {/* Section Editor */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">📝 섹션 편집 ({sections.length}개)</h3>
                <div className="flex gap-1">
                  {SECTION_TYPE_OPTIONS.slice(0, 4).map((opt) => (
                    <button key={opt.value} onClick={() => addSection(opt.value)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg text-[11px] font-medium transition-colors">
                      <Plus className="w-2.5 h-2.5" /> {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div key={section.id} className="border border-gray-100 rounded-xl p-3">
                    {/* 순서 + 타입 + 제목 + 삭제 */}
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
                        {SECTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>)}
                      </select>
                      <input type="text" value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium" />
                      <button onClick={() => removeSection(section.id)}
                        className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* 내용 편집 */}
                    <textarea value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={3} className="w-full px-2 py-1.5 border border-gray-100 rounded-lg text-xs resize-none mb-2" />

                    {/* 이미지 업로드 + 배경색 + CTA */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* 이미지 업로드 */}
                      <label className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer text-[11px] text-gray-600 transition-colors">
                        <ImageIcon className="w-3 h-3" />
                        {section.image ? '이미지 교체' : '이미지 추가'}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => handleImageUpload(section.id, e)} />
                      </label>
                      {section.image && (
                        <button onClick={() => updateSection(section.id, { image: undefined })}
                          className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700">
                          <X className="w-3 h-3" /> 이미지 삭제
                        </button>
                      )}

                      {/* 배경색 */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">배경:</span>
                        <input type="color" value={section.bgColor || '#ffffff'}
                          onChange={(e) => updateSection(section.id, { bgColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                      </div>

                      {/* CTA 편집 (hero/cta 섹션) */}
                      {(section.type === 'hero' || section.type === 'cta') && (
                        <>
                          <input type="text" value={section.ctaText || ''}
                            onChange={(e) => updateSection(section.id, { ctaText: e.target.value })}
                            placeholder="CTA 버튼 텍스트"
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs w-36" />
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">버튼색:</span>
                            <input type="color" value={section.ctaColor || '#F59E0B'}
                              onChange={(e) => updateSection(section.id, { ctaColor: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* 이미지 미리보기 (축소) */}
                    {section.image && (
                      <div className="mt-2">
                        <img src={section.image} alt="" className="h-16 rounded-lg object-cover opacity-70" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 전체 섹션 추가 */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                {SECTION_TYPE_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => addSection(opt.value)}
                    className="px-2 py-1 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg text-[10px] transition-colors">
                    + {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Size Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">👀 미리보기</h3>
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
                    className={`relative overflow-hidden ${section.bgColor ? '' : sectionBg(section.type)}`}
                    style={section.bgColor ? { backgroundColor: section.bgColor, color: isLightColor(section.bgColor) ? '#111827' : '#ffffff' } : undefined}>
                    {/* 섹션 배경 이미지 */}
                    {section.image && (
                      <img src={section.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    {section.image && (
                      <div className="absolute inset-0 bg-black/40" />
                    )}
                    <div className="relative p-6">
                      <h3 className={`font-bold mb-3 ${
                        section.type === 'hero' ? 'text-xl text-center' : 'text-lg'
                      } ${section.image ? 'text-white' : ''}`}>
                        {section.title}
                      </h3>
                      {section.content.split('\n').map((line, li) => (
                        <p key={li} className={`text-sm mb-1.5 leading-relaxed ${
                          section.type === 'hero' ? 'text-center' : ''
                        } ${section.image ? 'text-white/90' : 'opacity-90'}`}>
                          {line}
                        </p>
                      ))}
                      {section.ctaText && (
                        <div className={`mt-5 ${section.type === 'hero' ? 'text-center' : ''}`}>
                          <span className="inline-block px-8 py-3 font-bold rounded-full text-sm shadow-lg"
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

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleGenerate} disabled={loading}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                <Sparkles className="w-4 h-4" /> 다시 생성
              </button>
              <button onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors shadow-lg">
                <Download className="w-5 h-5" /> PDF로 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
