import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Copy, CheckCircle, Sparkles, TrendingUp, Users, Target, Shield, Lightbulb, Map, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import { generateMarketResearch, regenerateSection } from '../../../services/gemini/proMarketResearchService';
import type { MarketResearchReport } from '../../../services/gemini/proMarketResearchService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import EditableSection from '../pro/common/EditableSection';
import MarketResearchReportView from '../pro/common/MarketResearchReportView';

const SECTION_META: Record<keyof MarketResearchReport, { title: string; icon: typeof TrendingUp; color: string }> = {
  marketSize: { title: '📊 시장 규모', icon: TrendingUp, color: 'border-l-4 border-l-blue-500' },
  competitors: { title: '🏢 경쟁사 분석', icon: Users, color: 'border-l-4 border-l-red-500' },
  swot: { title: '🛡️ SWOT 분석 (강점·약점·기회·위협)', icon: Shield, color: 'border-l-4 border-l-purple-500' },
  opportunities: { title: '💡 기회 영역', icon: Lightbulb, color: 'border-l-4 border-l-amber-500' },
  targetPersona: { title: '🎯 타겟 페르소나 (우리 고객)', icon: Target, color: 'border-l-4 border-l-emerald-500' },
  entryStrategy: { title: '🗺️ 진입 전략', icon: Map, color: 'border-l-4 border-l-indigo-500' },
};

export default function MarketResearchTool() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const profile = useUserProfile();
  const { progress } = useSchoolProgress();
  const schoolData = progress?.marketCompassData;

  const [keywords, setKeywords] = useState('');
  const [targetAge, setTargetAge] = useState('');
  const [targetGender, setTargetGender] = useState('');
  const [itemType, setItemType] = useState('');
  const [report, setReport] = useState<MarketResearchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [showSchoolBanner, setShowSchoolBanner] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  const aiEnabled = isGeminiEnabled();

  // Prefill from school data
  useEffect(() => {
    if (schoolData?.marketScannerResult) {
      const r = schoolData.marketScannerResult;
      if (!keywords && r.input.itemKeyword) setKeywords(r.input.itemKeyword);
      if (!targetAge && r.input.targetAge) setTargetAge(r.input.targetAge);
      if (!targetGender && r.input.targetGender) setTargetGender(r.input.targetGender);
      if (!itemType && r.input.itemType) setItemType(r.input.itemType || '');
    }
  }, [schoolData]);

  const schoolSummary = schoolData?.marketScannerResult
    ? `마켓스캐너 키워드: ${schoolData.marketScannerResult.input.itemKeyword}, 경쟁사 ${schoolData.marketScannerResult.output.competitors.length}개, 페인포인트 ${schoolData.marketScannerResult.output.painPoints.length}개`
    : '';

  const handleGenerate = async () => {
    if (!keywords.trim()) return;
    setLoading(true);
    setReport(null);
    setIsMock(false);

    const existingData = schoolData?.marketScannerResult ? {
      competitors: schoolData.marketScannerResult.output.competitors.map(c => c.name).join(', '),
      painPoints: schoolData.marketScannerResult.output.painPoints.join(', '),
      keywords: schoolData.marketScannerResult.output.relatedKeywords.join(', '),
    } : undefined;

    const result = await generateMarketResearch({ keyword: keywords, targetAge, targetGender, itemType, existingData }, profile);
    setReport(result.report);
    setIsMock(result.isMock);
    setLoading(false);
  };

  const handleRegenerate = async (key: keyof MarketResearchReport) => {
    if (!report) return;
    setRegeneratingKey(key);
    const newText = await regenerateSection(key, report, { keyword: keywords }, profile);
    if (newText) {
      setReport(prev => prev ? { ...prev, [key]: newText } : prev);
    }
    setRegeneratingKey(null);
  };

  const handleSave = (key: keyof MarketResearchReport, value: string) => {
    setReport(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const sectionToString = (key: keyof MarketResearchReport): string => {
    if (!report) return '';
    const val = report[key];
    if (typeof val === 'string') {
      // 긴 문자열을 문장 단위로 분리해서 번호 리스트로 변환
      const sentences = val.split(/(?<=[.!?。])\s+/).filter(s => s.trim().length > 5);
      if (sentences.length > 3) {
        return `**요약**\n${sentences.slice(0, 2).join(' ')}\n\n` +
          sentences.slice(2).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
      }
      return val;
    }
    if (Array.isArray(val)) {
      if (typeof val[0] === 'string') return (val as string[]).join('\n');
      return (val as Array<{ name: string; strengths: string; weaknesses: string; positioning: string }>)
        .map(c => `**${c.name}**\n강점: ${c.strengths}\n약점: ${c.weaknesses}\n포지셔닝: ${c.positioning}`)
        .join('\n\n');
    }
    if (key === 'swot') {
      const s = val as MarketResearchReport['swot'];
      return `**강점**\n${s.strengths.join('\n')}\n\n**약점**\n${s.weaknesses.join('\n')}\n\n**기회**\n${s.opportunities.join('\n')}\n\n**위협**\n${s.threats.join('\n')}`;
    }
    // 객체형 데이터를 읽기 좋게 변환
    if (typeof val === 'object' && val !== null) {
      const obj = val as Record<string, unknown>;
      return Object.entries(obj).map(([k, v]) => {
        if (Array.isArray(v)) {
          return `**${k}**\n${(v as Array<Record<string, string>>).map(item => {
            if (typeof item === 'string') return `- ${item}`;
            return Object.entries(item).map(([ik, iv]) => `${ik}: ${iv}`).join(' / ');
          }).join('\n')}`;
        }
        if (typeof v === 'object' && v !== null) {
          return `**${k}**\n${Object.entries(v as Record<string, string>).map(([ik, iv]) => `${ik}: ${iv}`).join('\n')}`;
        }
        return `**${k}**: ${v}`;
      }).join('\n\n');
    }
    return String(val);
  };

  const handleCopy = async () => {
    if (!report) return;
    const text = Object.keys(SECTION_META)
      .map(key => `[${SECTION_META[key as keyof MarketResearchReport].title}]\n${sectionToString(key as keyof MarketResearchReport)}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // PDF export 핸들러는 미사용 — PDF는 MarketResearchReportView 안의 버튼에서 처리

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F4CA}'}</span>
            <h1 className="text-xl font-bold">시장 리서치 프로</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-gray-300 text-sm">내 시장을 6가지로 분석해요: 시장 크기 / 경쟁 브랜드 / 강점·약점 / 기회 / 고객 / 전략</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">내 상품이나 업종 *</label>
            <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
              placeholder="예: 비건 화장품, 펫푸드, 온라인 교육"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">고객 나이</label>
              <input type="text" value={targetAge} onChange={(e) => setTargetAge(e.target.value)}
                placeholder="예: 2030" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">고객 성별</label>
              <input type="text" value={targetGender} onChange={(e) => setTargetGender(e.target.value)}
                placeholder="예: 여성" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">상품 유형</label>
              <input type="text" value={itemType} onChange={(e) => setItemType(e.target.value)}
                placeholder="예: 식품" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm" />
            </div>
          </div>
          <button onClick={handleGenerate} disabled={!keywords.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${keywords.trim() && !loading ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 분석하고 있어요...</span> : '시장 분석 리포트 만들기'}
          </button>
        </div>

        {/* Report Output */}
        {report && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">지금은 예시 리포트예요. AI가 연결되면 내 상품에 맞는 진짜 리포트가 나와요!</p>
              </div>
            )}

            {/* 요약 카드 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">시장 리서치 리포트</h2>
              </div>
              <p className="text-xs text-gray-400 mb-4">키워드: {keywords} | 생성일: {new Date().toLocaleDateString('ko-KR')}</p>

              {/* 요약 미리보기 — 각 섹션 제목만 */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(Object.keys(SECTION_META) as Array<keyof MarketResearchReport>).map(key => {
                  const meta = SECTION_META[key];
                  const preview = sectionToString(key).replace(/\*\*/g, '').slice(0, 50);
                  return (
                    <div key={key} className={`p-3 rounded-xl bg-gray-50 ${meta.color}`}>
                      <p className="text-xs font-bold text-gray-700 mb-1">{meta.title}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{preview}...</p>
                    </div>
                  );
                })}
              </div>

              {/* 자세한 레포트 보기 버튼 */}
              <button
                onClick={() => setShowFullReport(true)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl text-base font-bold hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg"
              >
                <FileText className="w-5 h-5" />
                자세한 레포트 보기
              </button>

              {/* 텍스트 복사 */}
              <button onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                {copied ? <><CheckCircle className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 텍스트 복사</>}
              </button>
            </div>

            {/* 자세한 레포트 뷰 (풀스크린 오버레이) */}
            {showFullReport && (
              <MarketResearchReportView
                report={report}
                keyword={keywords}
                onClose={() => setShowFullReport(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
