import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Copy, CheckCircle, Sparkles } from 'lucide-react';
import { generateText, isGeminiEnabled } from '../../../services/gemini/geminiClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MOCK_REPORT = `## 시장 규모
국내 시장 규모는 약 2.5조 원으로 추정되며, 연평균 12% 성장 중입니다. 글로벌 시장은 약 150억 달러 규모이며 아시아 태평양 지역이 가장 빠르게 성장하고 있습니다.

## 경쟁사 분석
주요 경쟁사 3곳의 강점과 약점을 분석했습니다:
- **경쟁사 A**: 높은 브랜드 인지도, 프리미엄 가격 전략. 약점: 느린 신제품 출시
- **경쟁사 B**: 가성비 전략, 온라인 중심. 약점: 오프라인 채널 부족
- **경쟁사 C**: 기술력 우위, B2B 강점. 약점: B2C 마케팅 미흡

## 기회 영역
1. 20-30대 타겟 니치 시장 (경쟁 강도 낮음)
2. 구독 모델 도입 가능성
3. SNS 기반 바이럴 마케팅 기회
4. 친환경/ESG 트렌드 활용

## 타겟 고객 프로필
- **주요 타겟**: 25-35세 직장인, 월 소득 300-500만 원
- **구매 동기**: 편의성, 가성비, 트렌드
- **선호 채널**: 인스타그램, 유튜브, 네이버 블로그
- **구매 결정 요인**: 후기, 가격, 브랜드 신뢰도`;

export default function MarketResearchTool() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [keywords, setKeywords] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMock, setIsMock] = useState(false);

  const aiEnabled = isGeminiEnabled();

  const handleGenerate = async () => {
    if (!keywords.trim()) return;
    setLoading(true);
    setReport('');
    setIsMock(false);

    if (aiEnabled) {
      try {
        const prompt = `당신은 시장 리서치 전문가입니다. 아래 정보를 바탕으로 시장 리서치 리포트를 작성하세요.

키워드/업종: ${keywords}
경쟁사: ${competitors || '미입력'}
타겟 시장: ${targetMarket || '미입력'}

다음 4개 섹션으로 구성하세요:
## 시장 규모
(시장 규모 추정, 성장률, 트렌드)

## 경쟁사 분석
(각 경쟁사의 강점/약점, 포지셔닝)

## 기회 영역
(진입 가능한 틈새, 차별화 포인트)

## 타겟 고객 프로필
(인구통계, 구매 동기, 선호 채널)

한국어로 작성하고, 구체적인 수치와 예시를 포함하세요.`;

        const result = await generateText(prompt);
        if (result) {
          setReport(result);
          setLoading(false);
          return;
        }
      } catch { /* fallback */ }
    }

    setReport(MOCK_REPORT);
    setIsMock(true);
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('market-research-report.pdf');
    } catch { /* ignore */ }
  };

  // 간단한 마크다운 → HTML 변환
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) {
          return <li key={i} className="ml-4 mb-2 text-sm text-gray-700"><strong className="text-gray-900">{match[1]}</strong>: {match[2]}</li>;
        }
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 mb-1 text-sm text-gray-700">{line.replace('- ', '')}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 mb-1 text-sm text-gray-700 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm text-gray-700 mb-2">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F4CA}'}</span>
            <h1 className="text-xl font-bold">시장 리서치 리포트</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-gray-300 text-sm">키워드를 입력하면 AI가 시장 분석 리포트를 생성합니다</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">키워드 / 업종 *</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="예: 비건 화장품, 펫푸드, 온라인 교육"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">경쟁사 (선택)</label>
            <input
              type="text"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="예: A사, B사, C사"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">타겟 시장 (선택)</label>
            <input
              type="text"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              placeholder="예: 2030 여성, 1인 가구, 소상공인"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!keywords.trim() || loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              keywords.trim() && !loading
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 분석 중...</span>
            ) : '리포트 생성'}
          </button>
        </div>

        {/* Report Output */}
        {report && (
          <div>
            {isMock && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                <p className="text-xs text-yellow-700">AI 미연결 상태: 샘플 리포트입니다. AI 연결 후 맞춤 리포트를 받을 수 있습니다.</p>
              </div>
            )}
            <div ref={reportRef} className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <div className="border-b border-gray-100 pb-4 mb-2">
                <h2 className="text-lg font-bold text-gray-900">시장 리서치 리포트</h2>
                <p className="text-xs text-gray-400 mt-1">키워드: {keywords} | 생성일: {new Date().toLocaleDateString('ko-KR')}</p>
              </div>
              {renderMarkdown(report)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                {copied ? <><CheckCircle className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 텍스트 복사</>}
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" /> PDF 리포트 다운로드
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
