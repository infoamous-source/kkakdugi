import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Download, Sparkles, Plus, Trash2, Upload,
  RotateCcw, Star, Clock, ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import { generateDetailPage } from '../../../services/gemini/proDetailPageService';
import type { DetailPagePlan } from '../../../services/gemini/proDetailPageService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 섹션 사이 이미지 삽입 위치
interface InsertedImage {
  id: string;
  afterSection: number; // 0 = 타이틀 뒤, 1 = 어그로 뒤, ...
  dataUrl: string;
}

const COLOR_MAP: Record<string, string> = {
  amber: '#F59E0B',
  green: '#10B981',
  blue: '#3B82F6',
};

const COLOR_BG_MAP: Record<string, string> = {
  amber: '#FFFBEB',
  green: '#ECFDF5',
  blue: '#EFF6FF',
};

export default function DetailPageTool() {
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const profile = useUserProfile();
  const { progress } = useSchoolProgress();
  const schoolData = progress?.marketCompassData;

  // Inputs
  const [productName, setProductName] = useState('');
  const [customers, setCustomers] = useState('');
  const [strengths, setStrengths] = useState('');
  const [offers, setOffers] = useState('');

  // Result
  const [detailPage, setDetailPage] = useState<DetailPagePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [showSchoolBanner, setShowSchoolBanner] = useState(true);
  const [insertedImages, setInsertedImages] = useState<InsertedImage[]>([]);

  const aiEnabled = isGeminiEnabled();

  // Prefill from school data (PerfectPlanner)
  useEffect(() => {
    if (schoolData?.perfectPlannerResult) {
      const r = schoolData.perfectPlannerResult;
      if (!productName && r.input?.productName) setProductName(r.input.productName);
      if (!customers && r.input?.customers) setCustomers(Array.isArray(r.input.customers) ? r.input.customers.join(', ') : String(r.input.customers));
      if (!strengths && r.input?.strengths) setStrengths(Array.isArray(r.input.strengths) ? r.input.strengths.join(', ') : String(r.input.strengths));
      if (!offers && r.input?.offers) setOffers(Array.isArray(r.input.offers) ? r.input.offers.join(', ') : String(r.input.offers));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolData]);

  const schoolSummary = schoolData?.perfectPlannerResult
    ? `퍼펙트플래너: "${schoolData.perfectPlannerResult.input?.productName}", 고객/장점/혜택 반영됨`
    : '';

  const existingPPData = schoolData?.perfectPlannerResult?.output?.detailPage;

  // --- Generate ---
  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setDetailPage(null);
    setIsMock(false);
    setInsertedImages([]);

    const result = await generateDetailPage({
      productName: productName.trim(),
      customers: customers.trim(),
      strengths: strengths.trim(),
      offers: offers.trim(),
      existingData: existingPPData || undefined,
    }, profile);

    setDetailPage(result.detailPage);
    setIsMock(result.isMock);
    setLoading(false);
  };

  // --- Inline Edit Helpers ---
  const updateField = useCallback(<K extends keyof DetailPagePlan>(key: K, value: DetailPagePlan[K]) => {
    setDetailPage(prev => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const updatePainPoint = useCallback((idx: number, text: string) => {
    setDetailPage(prev => {
      if (!prev) return prev;
      const pp = [...prev.painPoints];
      pp[idx] = { ...pp[idx], text };
      return { ...prev, painPoints: pp };
    });
  }, []);

  const addPainPoint = useCallback(() => {
    setDetailPage(prev => {
      if (!prev) return prev;
      return { ...prev, painPoints: [...prev.painPoints, { emoji: '😤', text: '새로운 고충!' }] };
    });
  }, []);

  const removePainPoint = useCallback((idx: number) => {
    setDetailPage(prev => {
      if (!prev) return prev;
      return { ...prev, painPoints: prev.painPoints.filter((_, i) => i !== idx) };
    });
  }, []);

  const updateFeature = useCallback((idx: number, updates: Partial<DetailPagePlan['features'][0]>) => {
    setDetailPage(prev => {
      if (!prev) return prev;
      const features = [...prev.features];
      features[idx] = { ...features[idx], ...updates };
      return { ...prev, features };
    });
  }, []);

  const addFeature = useCallback(() => {
    setDetailPage(prev => {
      if (!prev) return prev;
      const colorKeys = ['amber', 'green', 'blue'] as const;
      return { ...prev, features: [...prev.features, { emoji: '✨', title: '새 약속', description: '설명을 입력하세요', colorKey: colorKeys[prev.features.length % 3] }] };
    });
  }, []);

  const removeFeature = useCallback((idx: number) => {
    setDetailPage(prev => {
      if (!prev) return prev;
      return { ...prev, features: prev.features.filter((_, i) => i !== idx) };
    });
  }, []);

  const updateReview = useCallback((idx: number, updates: Partial<DetailPagePlan['reviews'][0]>) => {
    setDetailPage(prev => {
      if (!prev) return prev;
      const reviews = [...prev.reviews];
      reviews[idx] = { ...reviews[idx], ...updates };
      return { ...prev, reviews };
    });
  }, []);

  const addReview = useCallback(() => {
    setDetailPage(prev => {
      if (!prev) return prev;
      return { ...prev, reviews: [...prev.reviews, { stars: '★★★★★', text: '"새 후기를 입력하세요"', author: '고객** · 00대' }] };
    });
  }, []);

  const removeReview = useCallback((idx: number) => {
    setDetailPage(prev => {
      if (!prev) return prev;
      return { ...prev, reviews: prev.reviews.filter((_, i) => i !== idx) };
    });
  }, []);

  // --- Attention Toggle ---
  const toggleAttentionType = useCallback(() => {
    setDetailPage(prev => {
      if (!prev) return prev;
      const newType = prev.attentionLine.type === 'B' ? 'C' : 'B';
      return { ...prev, attentionLine: { ...prev.attentionLine, type: newType } };
    });
  }, []);

  // --- Image Insert ---
  const handleInsertImage = useCallback((afterSection: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInsertedImages(prev => [...prev, {
        id: `img_${Date.now()}`,
        afterSection,
        dataUrl: reader.result as string,
      }]);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeInsertedImage = useCallback((id: string) => {
    setInsertedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // --- Export PDF ---
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
      pdf.save(`detail-page-${productName}.pdf`);
    } catch { /* ignore */ }
  };

  // Render images inserted after a specific section
  const renderInsertedImages = (sectionIndex: number) => {
    const imgs = insertedImages.filter(img => img.afterSection === sectionIndex);
    if (imgs.length === 0) return null;
    return (
      <>
        {imgs.map(img => (
          <div key={img.id} className="relative">
            <img src={img.dataUrl} alt="" className="w-full" />
            <button onClick={() => removeInsertedImage(img.id)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-10">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </>
    );
  };

  // Image insert button
  const renderImageInsertButton = (sectionIndex: number) => (
    <div className="flex justify-center py-3">
      <label className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl cursor-pointer text-sm font-bold shadow-md hover:shadow-lg transition-all">
        <Plus className="w-4 h-4" /> 이미지 추가
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleInsertImage(sectionIndex, e)} />
      </label>
    </div>
  );

  const dp = detailPage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F6D2}'}</span>
            <h1 className="text-xl font-bold">상세페이지 프로</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-red-100 text-sm">쿠팡/스마트스토어에 올릴 수 있는 상세페이지를 만들어요</p>
          <p className="text-red-200 text-xs mt-1">글자 수정 + 사진 넣기 + PDF 저장 가능</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">상품/브랜드명 *</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="예: 하루한끼 도시락" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">주요 고객</label>
              <input type="text" value={customers} onChange={(e) => setCustomers(e.target.value)}
                placeholder="예: 바쁜 직장인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">다른 곳에 없는 장점</label>
              <input type="text" value={strengths} onChange={(e) => setStrengths(e.target.value)}
                placeholder="예: 전문 셰프가 매일 조리" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">오늘의 특별 혜택</label>
              <input type="text" value={offers} onChange={(e) => setOffers(e.target.value)}
                placeholder="예: 첫 주문 30% 할인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-700 font-medium">학교에서 배운 마케팅 규칙이 자동 적용돼요</p>
          </div>

          <button onClick={handleGenerate} disabled={!productName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${productName.trim() && !loading ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> AI가 상세페이지를 만들고 있어요...</span> : '상세페이지 생성'}
          </button>
        </div>

        {/* Preview */}
        {dp && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">지금은 예시 상세페이지예요. AI가 연결되면 내 상품에 맞는 진짜 상세페이지가 나와요!</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">모바일 프리뷰 (텍스트 클릭하여 편집)</h3>
            </div>

            {/* Mobile Preview Frame */}
            <div className="flex justify-center mb-6">
              <div ref={previewRef}
                className="bg-white rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl"
                style={{ width: 375 }}>

                {/* 1. Product Title */}
                <div className="p-4 border-b border-gray-100">
                  <div
                    className="text-sm font-bold text-gray-900 leading-snug"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateField('productTitle', e.currentTarget.textContent || '')}
                  >
                    {dp.productTitle}
                  </div>
                </div>

                {/* 2. Brand Line */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500">{dp.brandLine}</span>
                </div>

                {/* 3. Price */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-600 font-extrabold text-2xl">{dp.discountPercent}%</span>
                    <span className="text-gray-400 text-sm line-through">{dp.originalPrice?.toLocaleString()}원</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">{dp.salePrice?.toLocaleString()}원</div>
                </div>

                {/* 4. Rating */}
                <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.floor(dp.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{dp.rating}</span>
                  <span className="text-xs text-gray-400">(리뷰 {dp.reviewCount?.toLocaleString()}개)</span>
                </div>

                {/* 5. Countdown */}
                <div className="px-4 py-3 bg-red-50 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-red-600">{dp.countdownLabel}</span>
                  <span className="text-sm font-mono font-bold text-red-700 ml-auto">{dp.countdownValue}</span>
                </div>

                {renderInsertedImages(0)}
                {renderImageInsertButton(0)}

                {/* 6. Attention Line */}
                <div className="px-4 py-4 bg-gray-900 text-center">
                  <button onClick={toggleAttentionType}
                    className="text-[11px] text-gray-400 mb-2 hover:text-white inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors"
                    title="호기심 자극형 ↔ 숫자·증거형 카피로 바꿔봐요">
                    🔄 다른 스타일로 바꾸기
                  </button>
                  <div
                    className="text-white font-bold text-lg leading-snug whitespace-pre-line"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateField('attentionLine', { ...dp.attentionLine, text: e.currentTarget.textContent || '' })}
                  >
                    {dp.attentionLine.text}
                  </div>
                </div>

                {/* 7. Headline */}
                <div className="px-6 py-8 bg-gradient-to-b from-gray-50 to-white text-center">
                  <p className="text-xs text-gray-400 mb-2">{dp.headlinePrefix}</p>
                  <div
                    className="text-2xl font-extrabold text-gray-900 leading-tight whitespace-pre-line"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateField('headline', e.currentTarget.textContent || '')}
                  >
                    {dp.headline}
                  </div>
                </div>

                {renderInsertedImages(1)}
                {renderImageInsertButton(1)}

                {/* 9. Pain Points */}
                <div className="px-4 py-6 bg-gray-50">
                  <h3 className="text-center font-extrabold text-lg text-gray-800 mb-4 whitespace-pre-line">{dp.painPointsTitle}</h3>
                  <div className="space-y-3">
                    {dp.painPoints.map((pp, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-3 flex items-start gap-3 group">
                        <span className="text-xl flex-shrink-0">{pp.emoji}</span>
                        <div
                          className="flex-1 text-sm font-medium text-gray-700 whitespace-pre-line"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => updatePainPoint(idx, e.currentTarget.textContent || '')}
                        >
                          {pp.text}
                        </div>
                        <button onClick={() => removePainPoint(idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addPainPoint}
                    className="mt-2 w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                    + 고충 추가
                  </button>
                </div>

                {renderInsertedImages(2)}
                {renderImageInsertButton(2)}

                {/* 11. Solution */}
                <div className="px-6 py-6 text-center">
                  <p className="text-xs text-gray-400 mb-1">{dp.solutionPrefix}</p>
                  <div
                    className="text-xl font-extrabold text-gray-900 whitespace-pre-line"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateField('solutionHeadline', e.currentTarget.textContent || '')}
                  >
                    {dp.solutionHeadline}
                  </div>
                </div>

                {/* 12. Features (3가지 약속) */}
                <div className="px-4 py-6 bg-gray-50">
                  <h3 className="text-center font-extrabold text-lg text-gray-800 mb-4 whitespace-pre-line">{dp.featuresTitle}</h3>
                  <div className="space-y-3">
                    {dp.features.map((feat, idx) => (
                      <div key={idx} className="rounded-xl p-4 group"
                        style={{ backgroundColor: COLOR_BG_MAP[feat.colorKey] || '#F9FAFB' }}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{feat.emoji}</span>
                          <div className="flex-1">
                            <div
                              className="font-bold text-sm mb-1"
                              style={{ color: COLOR_MAP[feat.colorKey] || '#6B7280' }}
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => updateFeature(idx, { title: e.currentTarget.textContent || '' })}
                            >
                              {feat.title}
                            </div>
                            <div
                              className="text-xs text-gray-600 whitespace-pre-line"
                              contentEditable suppressContentEditableWarning
                              onBlur={(e) => updateFeature(idx, { description: e.currentTarget.textContent || '' })}
                            >
                              {feat.description}
                            </div>
                          </div>
                          <button onClick={() => removeFeature(idx)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={addFeature}
                    className="mt-2 w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                    + 약속 추가
                  </button>
                </div>

                {renderInsertedImages(3)}
                {renderImageInsertButton(3)}

                {/* 14. Reviews */}
                <div className="px-4 py-6">
                  <h3 className="font-bold text-sm text-gray-800 mb-3">고객 후기</h3>
                  <div className="space-y-3">
                    {dp.reviews.map((review, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-3 group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-yellow-400 text-xs">{review.stars}</span>
                          <button onClick={() => removeReview(idx)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div
                          className="text-sm text-gray-700 mb-1"
                          contentEditable suppressContentEditableWarning
                          onBlur={(e) => updateReview(idx, { text: e.currentTarget.textContent || '' })}
                        >
                          {review.text}
                        </div>
                        <p className="text-[11px] text-gray-400">{review.author}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={addReview}
                    className="mt-2 w-full py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors">
                    + 후기 추가
                  </button>
                </div>

                {renderInsertedImages(4)}
                {renderImageInsertButton(4)}

                {/* 15. Final CTA */}
                <div className="px-6 py-8 bg-gradient-to-b from-gray-900 to-gray-800 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">{dp.finalCtaDeadline}</span>
                  </div>
                  <div
                    className="text-2xl font-extrabold text-white leading-tight whitespace-pre-line mb-4"
                    contentEditable suppressContentEditableWarning
                    onBlur={(e) => updateField('finalCtaHeadline', e.currentTarget.textContent || '')}
                  >
                    {dp.finalCtaHeadline}
                  </div>
                </div>

                {/* 16. Sticky CTA Button */}
                <div className="sticky bottom-0 p-3 bg-white border-t border-gray-200">
                  <button className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    {dp.stickyCtaText}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleGenerate} disabled={loading}
                className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
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
