import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Sparkles, Plus, Trash2, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../../lib/userProfile';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { isGeminiEnabled } from '../../../services/gemini/geminiClient';
import { generateDashboardAnalysis } from '../../../services/gemini/proDashboardService';
import SchoolDataBanner from '../pro/common/SchoolDataBanner';
import EditableSection from '../pro/common/EditableSection';
import DashboardReportView from '../pro/common/DashboardReportView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MonthlyData {
  month: string;
  adSpend: number;
  revenue: number;
  channel: string;
}

const CHANNELS = ['Instagram', 'YouTube', 'Naver', 'Google', 'TikTok', 'Facebook', 'Kakao', 'Other'];

type ChartType = 'bar' | 'roas' | 'channel';

export default function MarketingDashboardTool() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const profile = useUserProfile();
  const { progress } = useSchoolProgress();
  const simulationResult = progress?.simulationResult;

  const [entries, setEntries] = useState<MonthlyData[]>([
    { month: '2026-01', adSpend: 500000, revenue: 1500000, channel: 'Instagram' },
    { month: '2026-02', adSpend: 600000, revenue: 2100000, channel: 'Instagram' },
    { month: '2026-03', adSpend: 450000, revenue: 1200000, channel: 'YouTube' },
  ]);
  const [goalROAS, setGoalROAS] = useState<number>(3);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showSchoolBanner, setShowSchoolBanner] = useState(true);
  const [showFullReport, setShowFullReport] = useState(false);

  const aiEnabled = isGeminiEnabled();

  // Prefill from school data (ROAS Simulator)
  useEffect(() => {
    if (simulationResult) {
      const r = simulationResult;
      // Add school data as first entry if not already present
      if (entries.length <= 3 && r.input.adSpend && r.input.revenue) {
        const channelMap: Record<string, string> = {
          instagram: 'Instagram',
          naver: 'Naver',
          kakao: 'Kakao',
          youtube: 'YouTube',
        };
        setEntries(prev => {
          const schoolEntry: MonthlyData = {
            month: r.completedAt?.slice(0, 7) || '2026-01',
            adSpend: r.input.adSpend,
            revenue: r.input.revenue,
            channel: channelMap[r.input.adChannel] || 'Other',
          };
          // Don't duplicate
          if (prev.some(e => e.adSpend === schoolEntry.adSpend && e.revenue === schoolEntry.revenue)) return prev;
          return [schoolEntry, ...prev];
        });
      }
    }
  }, [simulationResult]);

  const schoolSummary = simulationResult
    ? `ROAS 시뮬레이터: 광고비 ${simulationResult.input.adSpend.toLocaleString()}원, 매출 ${simulationResult.input.revenue.toLocaleString()}원, ROAS ${simulationResult.output.roas}`
    : '';

  const addEntry = () => {
    setEntries(prev => [...prev, { month: '', adSpend: 0, revenue: 0, channel: 'Instagram' }]);
  };

  const removeEntry = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const updateEntry = (idx: number, field: keyof MonthlyData, value: string | number) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const validEntries = entries.filter(e => e.month && e.adSpend > 0);

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

  const channelData = CHANNELS.map(ch => {
    const chEntries = validEntries.filter(e => e.channel === ch);
    const spend = chEntries.reduce((a, e) => a + e.adSpend, 0);
    const rev = chEntries.reduce((a, e) => a + e.revenue, 0);
    return { channel: ch, spend, revenue: rev, roas: spend > 0 ? (rev / spend).toFixed(2) : '-', count: chEntries.length };
  }).filter(c => c.count > 0);

  const maxRevenue = Math.max(...validEntries.map(e => e.revenue), 1);

  const goalAchieved = Number(avgROAS) >= goalROAS;

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis('');

    const result = await generateDashboardAnalysis({
      entries: validEntries,
      goalROAS,
    }, profile);
    setAnalysis(result);
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
            <h1 className="text-xl font-bold">마케팅 대시보드 프로</h1>
            {aiEnabled && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI</span>}
          </div>
          <p className="text-emerald-100 text-sm">광고비 대비 매출을 한눈에 보고, AI가 개선점을 알려줘요</p>
        </div>

        {schoolSummary && showSchoolBanner && (
          <SchoolDataBanner summary={schoolSummary} onDismiss={() => setShowSchoolBanner(false)} />
        )}

        {/* Goal ROAS Setting */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">목표 ROAS (광고 효율)</h3>
              <p className="text-xs text-gray-400">광고비 1원당 매출 몇 배를 목표로 할지 정해요. 예: 3 = 광고비 1원으로 3원 매출</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" value={goalROAS} min={1} max={20} step={0.5}
                onChange={(e) => setGoalROAS(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm text-center font-bold focus:border-emerald-400 focus:outline-none" />
              <span className="text-sm text-gray-500 font-medium">x</span>
            </div>
          </div>
          {validEntries.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">현재 {avgROAS}x / 목표 {goalROAS}x</span>
                <span className={`font-bold ${goalAchieved ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {goalAchieved ? '달성!' : `${((Number(avgROAS) / goalROAS) * 100).toFixed(0)}%`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${goalAchieved ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (Number(avgROAS) / goalROAS) * 100)}%` }} />
              </div>
            </div>
          )}
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
              <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input type="text" value={entry.month} onChange={(e) => updateEntry(idx, 'month', e.target.value)}
                    placeholder="예: 2026-01" className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none" />
                  <select value={entry.channel} onChange={(e) => updateEntry(idx, 'channel', e.target.value)}
                    className="w-24 px-1 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none">
                    {CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                  <button onClick={() => removeEntry(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={entry.adSpend || ''} onChange={(e) => updateEntry(idx, 'adSpend', Number(e.target.value))}
                    placeholder="광고비" className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none" />
                  <input type="number" value={entry.revenue || ''} onChange={(e) => updateEntry(idx, 'revenue', Number(e.target.value))}
                    placeholder="매출" className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-emerald-400 focus:outline-none" />
                </div>
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
                <p className={`text-xl font-extrabold ${goalAchieved ? 'text-emerald-600' : 'text-amber-600'}`}>{avgROAS}x</p>
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
                  <p className="text-[10px] text-emerald-600 font-semibold mb-1">최고 성과</p>
                  <p className="text-sm font-bold text-gray-900">{bestMonth.month}</p>
                  <p className="text-xs text-gray-500">ROAS {calcROAS(bestMonth)}x | {bestMonth.channel}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                  <p className="text-[10px] text-red-600 font-semibold mb-1">개선 필요</p>
                  <p className="text-sm font-bold text-gray-900">{worstMonth.month}</p>
                  <p className="text-xs text-gray-500">ROAS {calcROAS(worstMonth)}x | {worstMonth.channel}</p>
                </div>
              </div>
            )}

            {/* Chart Type Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {([
                { key: 'bar' as const, label: '매출 바 차트' },
                { key: 'roas' as const, label: 'ROAS 추이' },
                { key: 'channel' as const, label: '채널별 비교' },
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => setChartType(key)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartType === key ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Charts */}
            {chartType === 'bar' && (
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
                          className={`w-full rounded-t-lg transition-all duration-300 ${roas >= goalROAS ? 'bg-emerald-500' : roas >= goalROAS * 0.7 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ height }}
                        />
                        <span className="text-[9px] text-gray-400 mt-1">{entry.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Goal line indicator */}
                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                  <div className="w-4 h-0.5 bg-emerald-500" /> 목표 달성
                  <div className="w-4 h-0.5 bg-amber-500" /> 근접
                  <div className="w-4 h-0.5 bg-red-500" /> 미달
                </div>
              </div>
            )}

            {chartType === 'roas' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4">ROAS 추이</h3>
                <div className="relative" style={{ height: 160 }}>
                  {/* Goal line */}
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-300"
                    style={{ bottom: `${Math.min(100, (goalROAS / Math.max(...validEntries.map(e => Number(calcROAS(e))), goalROAS, 1)) * 100)}%` }}>
                    <span className="absolute -top-4 right-0 text-[9px] text-emerald-500">목표 {goalROAS}x</span>
                  </div>
                  <div className="flex items-end gap-3 h-full">
                    {validEntries.map((entry, idx) => {
                      const roas = Number(calcROAS(entry));
                      const maxR = Math.max(...validEntries.map(e => Number(calcROAS(e))), goalROAS);
                      const h = Math.max((roas / maxR) * 140, 4);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-xs font-bold text-gray-800">{roas}x</span>
                          <div className={`w-3 rounded-full ${roas >= goalROAS ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ height: h }} />
                          <span className="text-[9px] text-gray-400 mt-1">{entry.month.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {chartType === 'channel' && channelData.length > 0 && (
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
                        <th className="text-right py-2 font-semibold text-gray-600">목표</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelData.map(ch => (
                        <tr key={ch.channel} className="border-b border-gray-50">
                          <td className="py-2 font-medium text-gray-800">{ch.channel}</td>
                          <td className="py-2 text-right text-gray-600">{formatWon(ch.spend)}</td>
                          <td className="py-2 text-right text-gray-600">{formatWon(ch.revenue)}</td>
                          <td className={`py-2 text-right font-semibold ${Number(ch.roas) >= goalROAS ? 'text-emerald-600' : 'text-gray-800'}`}>{ch.roas}x</td>
                          <td className="py-2 text-right">
                            {ch.roas !== '-' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${Number(ch.roas) >= goalROAS ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {Number(ch.roas) >= goalROAS ? '달성' : '미달'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {!analysis ? (
              <button onClick={handleAnalyze} disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${!loading ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 분석하고 있어요...</span> : 'AI에게 분석 & 조언 받기'}
              </button>
            ) : (
              <>
                {/* 요약 + 자세한 레포트 보기 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                  <p className="text-xs font-bold text-emerald-700 mb-1">AI 분석 완료</p>
                  <p className="text-[11px] text-gray-600 line-clamp-2">{analysis.replace(/\*\*/g, '').slice(0, 100)}...</p>
                </div>
                <button
                  onClick={() => setShowFullReport(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-xl text-base font-bold hover:from-emerald-600 hover:to-teal-500 transition-all shadow-lg mb-3"
                >
                  <FileText className="w-5 h-5" />
                  자세한 레포트 보기
                </button>
                {showFullReport && (
                  <DashboardReportView
                    analysis={analysis}
                    entries={validEntries.map(e => ({ month: e.month, spend: Number(e.spend), revenue: Number(e.revenue) }))}
                    goalROAS={goalROAS}
                    onClose={() => setShowFullReport(false)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Export */}
        {validEntries.length > 0 && (
          <button onClick={handleExportPDF}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors shadow-lg">
            <Download className="w-5 h-5" /> 월간 리포트 PDF 저장
          </button>
        )}
      </div>
    </div>
  );
}
