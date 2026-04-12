import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Sparkles, Edit3, Image, Check } from 'lucide-react';
import { generateText, isGeminiEnabled } from '../../../services/gemini/geminiClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LandingSection {
  type: 'hero' | 'features' | 'testimonial' | 'pricing' | 'cta';
  title: string;
  content: string;
  image?: string;
}

const MOCK_SECTIONS: LandingSection[] = [
  {
    type: 'hero',
    title: '당신의 비즈니스를 한 단계 끌어올리세요',
    content: '검증된 솔루션으로 매출을 200% 성장시킨 고객사가 이미 1,000곳이 넘습니다.',
  },
  {
    type: 'features',
    title: '왜 선택해야 할까요?',
    content: '간편한 시작: 5분 만에 설정 완료\n강력한 분석: 실시간 데이터 대시보드\n맞춤 지원: 전담 매니저 배정\n안전한 보안: 국제 보안 인증 획득',
  },
  {
    type: 'testimonial',
    title: '고객 후기',
    content: '"도입 후 3개월 만에 매출이 150% 올랐습니다. 더 일찍 시작할 걸 그랬어요."\n- 김OO, ABC 대표',
  },
  {
    type: 'pricing',
    title: '합리적인 가격',
    content: '무료 체험: 14일간 모든 기능 무료\n스타터: 월 29,000원 (소규모 팀)\n프로: 월 79,000원 (성장하는 비즈니스)\n엔터프라이즈: 맞춤 견적',
  },
  {
    type: 'cta',
    title: '지금 시작하세요',
    content: '14일 무료 체험, 신용카드 없이 시작\n지금 가입하면 첫 달 50% 할인',
  },
];

function parseAISections(text: string): LandingSection[] | null {
  try {
    const sections: LandingSection[] = [];
    const typeMap: Record<string, LandingSection['type']> = {
      '히어로': 'hero', '메인': 'hero', '상단': 'hero',
      '특징': 'features', '기능': 'features', '장점': 'features',
      '후기': 'testimonial', '리뷰': 'testimonial', '고객': 'testimonial',
      '가격': 'pricing', '요금': 'pricing', '플랜': 'pricing',
      'CTA': 'cta', '행동': 'cta', '시작': 'cta', '전환': 'cta',
    };

    const blocks = text.split(/##\s+/).filter((b) => b.trim());
    for (const block of blocks) {
      const lines = block.split('\n');
      const titleLine = lines[0].trim();
      const contentLines = lines.slice(1).filter((l) => l.trim()).map((l) => l.replace(/^[-*]\s*/, '').trim());

      let sectionType: LandingSection['type'] = 'features';
      for (const [keyword, type] of Object.entries(typeMap)) {
        if (titleLine.includes(keyword)) { sectionType = type; break; }
      }

      if (contentLines.length > 0) {
        sections.push({
          type: sectionType,
          title: titleLine.replace(/[[\]()]/g, ''),
          content: contentLines.join('\n'),
        });
      }
    }

    return sections.length >= 3 ? sections : null;
  } catch {
    return null;
  }
}

export default function LandingBuilderTool() {
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [price, setPrice] = useState('');
  const [target, setTarget] = useState('');
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState({ title: '', content: '' });

  const aiEnabled = isGeminiEnabled();

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setSections([]);

    if (aiEnabled) {
      try {
        const prompt = `당신은 랜딩페이지 기획 전문가입니다. 아래 정보로 모바일 랜딩페이지 콘텐츠를 생성하세요.

제품/서비스: ${productName}
주요 기능: ${features || '미입력'}
가격: ${price || '미입력'}
타겟: ${target || '일반 소비자'}

다음 5개 섹션을 작성하세요:

## 히어로 섹션
매력적인 헤드라인과 서브 카피 (2-3줄)

## 특징/기능 섹션
핵심 기능 4가지를 각각 한 줄로

## 고객 후기 섹션
가상의 고객 후기 1개 (이름 포함)

## 가격 섹션
가격 플랜 정보 (3-4단계)

## CTA 섹션
행동 유도 문구 + 혜택 안내

한국어로 작성. 각 섹션은 ##으로 시작.`;

        const result = await generateText(prompt);
        if (result) {
          const parsed = parseAISections(result);
          if (parsed) {
            setSections(parsed);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }
    }

    setSections(MOCK_SECTIONS);
    setLoading(false);
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditText({ title: sections[idx].title, content: sections[idx].content });
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    setSections((prev) => prev.map((s, i) => i === editingIdx ? { ...s, title: editText.title, content: editText.content } : s));
    setEditingIdx(null);
  };

  const handleImageChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSections((prev) => prev.map((s, i) => i === idx ? { ...s, image: reader.result as string } : s));
    };
    reader.readAsDataURL(file);
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

  const sectionBg = (type: LandingSection['type']) => {
    switch (type) {
      case 'hero': return 'bg-gradient-to-b from-gray-900 to-gray-800 text-white';
      case 'features': return 'bg-white text-gray-900';
      case 'testimonial': return 'bg-blue-50 text-gray-900';
      case 'pricing': return 'bg-gray-50 text-gray-900';
      case 'cta': return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      default: return 'bg-white text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F6D2}'}</span>
            <h1 className="text-xl font-bold">랜딩페이지 빌더</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-blue-100 text-sm">AI가 랜딩페이지를 만들고, 직접 편집하세요</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">제품/서비스명 *</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
              placeholder="예: AI 마케팅 자동화 툴" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">주요 기능 (선택)</label>
            <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={3}
              placeholder="예: 자동 SNS 게시, AI 카피 생성, 실시간 분석" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">가격 (선택)</label>
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="예: 월 29,000원~" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">타겟 (선택)</label>
              <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
                placeholder="예: 소상공인" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
          </div>
          <button onClick={handleGenerate} disabled={!productName.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${productName.trim() && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</span> : '랜딩페이지 생성'}
          </button>
        </div>

        {/* Mobile Preview */}
        {sections.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4">모바일 미리보기 (340px)</h3>
            <div className="flex justify-center mb-6">
              <div ref={previewRef} className="w-[340px] rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl">
                {sections.map((section, idx) => (
                  <div key={idx} className={`relative ${sectionBg(section.type)}`}>
                    {section.image && (
                      <img src={section.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )}
                    <div className="relative p-6">
                      {editingIdx === idx ? (
                        <div className="space-y-2">
                          <input
                            type="text" value={editText.title}
                            onChange={(e) => setEditText((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full px-2 py-1 rounded text-sm text-gray-900 border"
                          />
                          <textarea
                            value={editText.content}
                            onChange={(e) => setEditText((prev) => ({ ...prev, content: e.target.value }))}
                            rows={4} className="w-full px-2 py-1 rounded text-sm text-gray-900 border resize-none"
                          />
                          <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold">
                            <Check className="w-3 h-3" /> 저장
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`text-lg font-bold mb-3 ${section.type === 'hero' ? 'text-center' : ''}`}>
                            {section.title}
                          </h3>
                          {section.content.split('\n').map((line, li) => (
                            <p key={li} className={`text-sm mb-1 ${section.type === 'hero' ? 'text-center opacity-80' : 'opacity-90'}`}>
                              {line}
                            </p>
                          ))}
                          {section.type === 'cta' && (
                            <div className="mt-4 text-center">
                              <span className="inline-block px-6 py-2 bg-white text-blue-600 font-bold rounded-full text-sm">무료로 시작하기</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Edit Controls */}
                    {editingIdx !== idx && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={() => startEdit(idx)}
                          className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40 transition-colors">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <label className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40 transition-colors cursor-pointer">
                          <Image className="w-3 h-3" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(idx, e)} />
                        </label>
                      </div>
                    )}
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
