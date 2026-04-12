import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Sparkles, Plus, Trash2 } from 'lucide-react';
import { generateText, isGeminiEnabled } from '../../../services/gemini/geminiClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MonthlyData {
  month: string;
  adSpend: number;
  revenue: number;
  channel: string;
}

const CHANNELS = ['Instagram', 'YouTube', 'Naver', 'Google', 'TikTok', 'Facebook', 'Other'];

const MOCK_ANALYSIS = `이번 분기 전체 ROAS는 평균 3.2로 양호한 수준입니다.

주요 인사이트:
- Instagram 채널이 가장 높은 ROAS를 기록하며 핵심 채널로 자리잡고 있습니다
- YouTube는 초기 투자 대비 브랜드 인지도 기여가 크지만 직접 전환율은 낮습니다
- 광고비 대비 매출이 가장 높았던 달의 전략을 다른 달에도 적용해보세요

추천 액션:
1. Instagram 예산을 10-15% 증액하여 성과를 극대화하세요
2. YouTube는 리타겟팅 광고와 결합하면 전환율이 개선됩니다
3. 월별 A/B 테스트를 통해 최적의 크리에이티브를 찾으세요`;

export default function MarketingDashboardTool() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<MonthlyData[]>([
    { month: '2026-01', adSpend: 500000, revenue: 1500000, channel: 'Instagram' },
    { month: '2026-02', adSpend: 600000, revenue: 2100000, channel: 'Instagram' },
    { month: '2026-03', adSpend: 450000, revenue: 1200000, channel: 'YouTube' },
  ]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const aiEnabled = isGeminiEnabled();

  const addEntry = () => {
    setEntries((prev) => [...prev, { month: '', adSpend: 0, revenue: 0, channel: 'Instagram' }]);
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateEntry = (idx: number, field: keyof MonthlyData, value: string | number) => {
    setEntries((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  // Calculations
  const validEntries = entries.filter((e) => e.month && e.adSpend > 0);

  const calcROAS = (entry: MonthlyData) => entry.adSpend > 0 ? (entry.revenue / entry.adSpend).toFixed(2) : '0';
  const calcProfit = (entry: MonthlyData) => entry.revenue - entry.adSpend;

  const totalAdSpend = validEntries.reduce((a, e) => a + e.adSpend, 0);
  const totalRevenue = validEntries.reduce((a, e) => a + e.revenue, 0);
  const avgROAS = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) : '0';
  const totalProfit = totalRevenue - totalAdSpend;

  const bestMonth = validEntries.length > 0
    ? validEntries.reduce((best, e) => (e.revenue / e.adSpend) > (best.revenue / best.adSpend) ? e : best)
    : null;
  const worstMonth = validEntries.length > 0
    ? validEntries.reduce((worst, e) => (e.revenue / e.adSpend) < (worst.revenue / worst.adSpend) ? e : worst)
    : null;

  // Channel comparison
  const channelData = CHANNELS.map((ch) => {
    const chEntries = validEntries.filter((e) => e.channel === ch);
    const spend = chEntries.reduce((a, e) => a + e.adSpend, 0);
    const rev = chEntries.reduce((a, e) => a + e.revenue, 0);
    return { channel: ch, spend, revenue: rev, roas: spend > 0 ? (rev / spend).toFixed(2) : '-', count: chEntries.length };
  }).filter((c) => c.count > 0);

  const maxRevenue = Math.max(...validEntries.map((e) => e.revenue), 1);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis('');

    if (aiEnabled) {
      try {
        const dataStr = validEntries.map((e) => `${e.month}: 광고비 ${e.adSpend.toLocaleString()}원, 매출 ${e.revenue.toLocaleString()}원, 채널: ${e.channel}, ROAS: ${calcROAS(e)}`).join('\n');
        const prompt = `당신은 마케팅 데이터 분석 전문가입니다.

아래 월별 마케팅 데이터를 분석하고 인사이트와 추천을 제공하세요:

${dataStr}

전체 평균 ROAS: ${avgROAS}
총 광고비: ${totalAdSpend.toLocaleString()}원
총 매출: ${totalRevenue.toLocaleString()}원

다음을 포함하세요:
1. 전반적인 성과 요약 (1-2문장)
2. 주요 인사이트 (3가지)
3. 추천 액션 (3가지)

한국어로 간결하게 작성하세요.`;

        const result = await generateText(prompt);
        if (result) {
          setAnalysis(result);
          setLoading(false);
          return;
        }
      } catch { /* fallback */ }
    }

    setAnalysis(MOCK_ANALYSIS);
    setLoading(false);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
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
      pdf.save('marketing-dashboard-report.pdf');
    } catch { /* ignore */ }
  };

  const formatWon = (n: number) => n.toLocaleString() + '원';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>뒤로 가기</span>
        </button>

        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{'\u{1F4C8}'}</span>
            <h1 className="text-xl font-bold">마케팅 대시보드</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-emerald-100 text-sm">월별 데이터를 입력하고 성과를 분석하세요</p>
        </div>

        {/* Data Entry */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">월별 데이터 입력</h3>
            <button onClick={addEntry} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">
              <Plus className="w-3 h-3" /> 추가
            </button>
          </div>
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div key={idx} className="grid grid-cols-[100px_1fr_1fr_100px_32px] gap-2 items-center">
                <input type="month" value={entry.month} onChange={(e) => updateEntry(idx, 'month', e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none" />
                <input type="number" value={entry.adSpend || ''} onChange={(e) => updateEntry(idx, 'adSpend', Number(e.target.value))}
                  placeholder="광고비" className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none" />
                <input type="number" value={entry.revenue || ''} onChange={(e) => updateEntry(idx, 'revenue', Number(e.target.value))}
                  placeholder="매출" className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none" />
                <select value={entry.channel} onChange={(e) => updateEntry(idx, 'channel', e.target.value)}
                  className="px-1 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none">
                  {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                </select>
                <button onClick={() => removeEntry(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Report */}
        {validEntries.length > 0 && (
          <div ref={reportRef} className="space-y-4 mb-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-[10px] text-gray-500 mb-1">평균 ROAS</p>
                <p className="text-xl font-extrabold text-emerald-600">{avgROAS}x</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-[10px] text-gray-500 mb-1">총 매출</p>
                <p className="text-lg font-bold text-gray-900">{formatWon(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-[10px] text-gray-500 mb-1">총 광고비</p>
                <p className="text-lg font-bold text-gray-900">{formatWon(totalAdSpend)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-[10px] text-gray-500 mb-1">총 이익</p>
                <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatWon(totalProfit)}</p>
              </div>
            </div>

            {/* Best/Worst Month */}
            {bestMonth && worstMonth && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                  <p className="text-[10px] text-emerald-600 font-semibold mb-1">BEST MONTH</p>
                  <p className="text-sm font-bold text-gray-900">{bestMonth.month}</p>
                  <p className="text-xs text-gray-500">ROAS {calcROAS(bestMonth)}x | {bestMonth.channel}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                  <p className="text-[10px] text-red-600 font-semibold mb-1">WORST MONTH</p>
                  <p className="text-sm font-bold text-gray-900">{worstMonth.month}</p>
                  <p className="text-xs text-gray-500">ROAS {calcROAS(worstMonth)}x | {worstMonth.channel}</p>
                </div>
              </div>
            )}

            {/* Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">월별 매출 트렌드</h3>
              <div className="flex items-end gap-2" style={{ height: 160 }}>
                {validEntries.map((entry, idx) => {
                  const height = Math.max((entry.revenue / maxRevenue) * 140, 4);
                  const roas = Number(calcROAS(entry));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-gray-500 font-mono">{roas}x</span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${roas >= 3 ? 'bg-emerald-500' : roas >= 2 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ height }}
                      />
                      <span className="text-[9px] text-gray-400 mt-1">{entry.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Channel Comparison */}
            {channelData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">채널별 비교</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 font-semibold text-gray-600">채널</th>
                        <th className="text-right py-2 font-semibold text-gray-600">광고비</th>
                        <th className="text-right py-2 font-semibold text-gray-600">매출</th>
                        <th className="text-right py-2 font-semibold text-gray-600">ROAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelData.map((ch) => (
                        <tr key={ch.channel} className="border-b border-gray-50">
                          <td className="py-2 font-medium text-gray-800">{ch.channel}</td>
                          <td className="py-2 text-right text-gray-600">{formatWon(ch.spend)}</td>
                          <td className="py-2 text-right text-gray-600">{formatWon(ch.revenue)}</td>
                          <td className={`py-2 text-right font-semibold ${Number(ch.roas) >= 3 ? 'text-emerald-600' : 'text-gray-800'}`}>{ch.roas}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {!analysis && (
              <button onClick={handleAnalyze} disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${!loading ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 분석 중...</span> : 'AI 분석 & 추천 받기'}
              </button>
            )}

            {analysis && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> AI 분석 리포트
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-line">{analysis}</div>
              </div>
            )}
          </div>
        )}

        {/* Export */}
        {validEntries.length > 0 && (
          <button onClick={handleExportPDF}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" /> 월간 리포트 PDF
          </button>
        )}
      </div>
    </div>
  );
}
