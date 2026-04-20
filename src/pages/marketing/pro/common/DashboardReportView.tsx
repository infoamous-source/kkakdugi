import { useRef, useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { exportToPdf } from '../../../../lib/pdfExport';

interface Props {
  analysis: string;
  entries: Array<{ month: string; spend: number; revenue: number }>;
  goalROAS: number;
  onClose: () => void;
}

export default function DashboardReportView({ analysis, entries, goalROAS, onClose }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    try {
      await exportToPdf(reportRef.current, `마케팅대시보드_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF가 만들어지지 않았어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setExporting(false);
    }
  };

  const totalSpend = entries.reduce((s, e) => s + e.spend, 0);
  const totalRevenue = entries.reduce((s, e) => s + e.revenue, 0);
  const avgROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '0';
  const totalProfit = totalRevenue - totalSpend;

  // 분석 텍스트를 섹션별로 분리
  const analysisSections = analysis.split(/\n{2,}/).filter(s => s.trim());

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium">
          <X className="w-5 h-5" /> 닫기
        </button>
        <button onClick={handleExportPDF} disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg disabled:opacity-50">
          {exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> 만드는 중...</> : <><Download className="w-4 h-4" /> PDF 저장</>}
        </button>
      </div>

      <div ref={reportRef} className="max-w-[800px] mx-auto bg-white my-4 rounded-lg shadow-xl" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <div className="px-12 pt-12 pb-6">
          <h1 className="text-[28px] font-black text-gray-900 mb-1">마케팅 대시보드 리포트</h1>
          <p className="text-[13px] text-gray-400">목표 ROAS: {goalROAS}x | 기간: {entries[0]?.month || '-'} ~ {entries[entries.length - 1]?.month || '-'} | {new Date().toLocaleDateString('ko-KR')}</p>
        </div>

        <div className="px-12 pb-12 space-y-8">
          {/* 핵심 지표 */}
          <section>
            <h2 className="text-[17px] font-black bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg mb-3">
              📊 핵심 지표 요약
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-[11px] text-gray-400 mb-1">평균 ROAS</p>
                <p className={`text-[24px] font-black ${Number(avgROAS) >= goalROAS ? 'text-emerald-600' : 'text-amber-600'}`}>{avgROAS}x</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-[11px] text-gray-400 mb-1">총 매출</p>
                <p className="text-[20px] font-black text-gray-900">{(totalRevenue / 10000).toFixed(0)}만</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-[11px] text-gray-400 mb-1">총 광고비</p>
                <p className="text-[20px] font-black text-gray-900">{(totalSpend / 10000).toFixed(0)}만</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-[11px] text-gray-400 mb-1">이익</p>
                <p className={`text-[20px] font-black ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{(totalProfit / 10000).toFixed(0)}만</p>
              </div>
            </div>
          </section>

          {/* 월별 상세 */}
          <section>
            <h2 className="text-[17px] font-black bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg mb-3">
              📅 월별 성과
            </h2>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left font-bold border-b-2 border-gray-300">월</th>
                  <th className="px-3 py-2 text-right font-bold border-b-2 border-gray-300">광고비</th>
                  <th className="px-3 py-2 text-right font-bold border-b-2 border-gray-300">매출</th>
                  <th className="px-3 py-2 text-right font-bold border-b-2 border-gray-300">ROAS</th>
                  <th className="px-3 py-2 text-center font-bold border-b-2 border-gray-300">목표</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  const roas = e.spend > 0 ? (e.revenue / e.spend) : 0;
                  const achieved = roas >= goalROAS;
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-3 py-2 font-bold">{e.month}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{e.spend.toLocaleString()}원</td>
                      <td className="px-3 py-2 text-right text-gray-600">{e.revenue.toLocaleString()}원</td>
                      <td className="px-3 py-2 text-right font-bold">{roas.toFixed(1)}x</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${achieved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {achieved ? '달성' : '미달'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* AI 분석 */}
          <section>
            <h2 className="text-[17px] font-black bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg mb-3">
              🤖 AI 분석 & 조언
            </h2>
            <div className="space-y-3">
              {analysisSections.map((section, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.replace(/\*\*/g, '')}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="text-center text-[11px] text-gray-400 py-6 border-t border-gray-100">
          깍두기학교 마케팅 대시보드 프로 — AI 자동 생성 리포트
        </div>
      </div>
    </div>
  );
}
