import { useRef } from 'react';
import { Download, X } from 'lucide-react';
import type { MarketResearchReport } from '../../../../services/gemini/proMarketResearchService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  report: MarketResearchReport;
  keyword: string;
  onClose: () => void;
}

export default function MarketResearchReportView({ report, keyword, onClose }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = pdf.internal.pageSize.getHeight() - 20;
      const imgRatio = canvas.height / canvas.width;
      const imgW = pdfWidth;
      const imgH = imgW * imgRatio;

      let srcY = 0;
      const sliceH = (pdfHeight / imgH) * canvas.height;
      let page = 0;
      while (srcY < canvas.height) {
        if (page > 0) pdf.addPage();
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceH, canvas.height - srcY);
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceImgH = (sliceCanvas.height / canvas.width) * imgW;
        pdf.addImage(sliceData, 'PNG', 10, 10, imgW, sliceImgH);
        srcY += sliceH;
        page++;
      }
      pdf.save(`시장리서치_${keyword}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const competitorsArray = Array.isArray(report.competitors) ? report.competitors : [];
  const swot = report.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const opportunities = Array.isArray(report.opportunities) ? report.opportunities : [];

  const toText = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (!val) return '';
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (obj.summary || obj.details) return [obj.summary, obj.details].filter(Boolean).join('\n\n') as string;
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n');
    }
    return String(val);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium">
          <X className="w-5 h-5" /> 닫기
        </button>
        <button onClick={handleExportPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-lg">
          <Download className="w-4 h-4" /> PDF 저장
        </button>
      </div>

      {/* Report content */}
      <div ref={reportRef} className="max-w-[800px] mx-auto bg-white my-4 rounded-lg shadow-xl" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        {/* Header */}
        <div className="px-12 pt-12 pb-8">
          <h1 className="text-[28px] font-black text-gray-900 mb-1">시장 리서치 리포트</h1>
          <p className="text-[13px] text-gray-400">
            키워드: {keyword} | 생성일: {new Date().toLocaleDateString('ko-KR')}
          </p>
        </div>

        <div className="px-12 pb-12 space-y-8">
          {/* 1. 시장 규모 */}
          <section>
            <h2 className="text-[17px] font-black bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-3">
              📊 시장 규모
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-lg text-[14px] leading-relaxed text-gray-700 whitespace-pre-line">
              {toText(report.marketSize)}
            </div>
          </section>

          {/* 2. 경쟁사 분석 */}
          <section>
            <h2 className="text-[17px] font-black bg-red-50 text-red-700 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-3">
              🏢 경쟁사 분석
            </h2>
            {competitorsArray.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left font-bold border-b-2 border-gray-300">브랜드</th>
                      <th className="px-3 py-2 text-left font-bold border-b-2 border-gray-300">포지셔닝</th>
                      <th className="px-3 py-2 text-left font-bold border-b-2 border-gray-300">강점</th>
                      <th className="px-3 py-2 text-left font-bold border-b-2 border-gray-300">약점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorsArray.map((c, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-bold">{c.name}</td>
                        <td className="px-3 py-2 text-gray-600">{c.positioning}</td>
                        <td className="px-3 py-2 text-gray-600">{c.strengths}</td>
                        <td className="px-3 py-2 text-gray-600">{c.weaknesses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-[14px] text-gray-600 whitespace-pre-line">{toText(report.competitors)}</div>
            )}
          </section>

          {/* 3. SWOT */}
          <section>
            <h2 className="text-[17px] font-black bg-purple-50 text-purple-700 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-3">
              🛡️ SWOT 분석
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-[15px] font-bold mb-2">강점 (S)</h3>
                <div className="flex flex-wrap gap-1">
                  {(swot.strengths || []).map((s, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-[15px] font-bold mb-2">약점 (W)</h3>
                <div className="flex flex-wrap gap-1">
                  {(swot.weaknesses || []).map((s, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-[15px] font-bold mb-2">기회 (O)</h3>
                <div className="flex flex-wrap gap-1">
                  {(swot.opportunities || []).map((s, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-[15px] font-bold mb-2">위협 (T)</h3>
                <div className="flex flex-wrap gap-1">
                  {(swot.threats || []).map((s, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 4. 기회 영역 */}
          <section>
            <h2 className="text-[17px] font-black bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-3">
              💡 기회 영역
            </h2>
            <div className="space-y-2">
              {opportunities.map((opp, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[13px] text-gray-700 leading-relaxed">{typeof opp === 'string' ? opp : toText(opp)}</p>
                </div>
              ))}
              {opportunities.length === 0 && (
                <div className="text-[14px] text-gray-600 whitespace-pre-line">{toText(report.opportunities)}</div>
              )}
            </div>
          </section>

          {/* 5. 타겟 페르소나 */}
          <section>
            <h2 className="text-[17px] font-black bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-3">
              🎯 타겟 페르소나
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
              {toText(report.targetPersona)}
            </div>
          </section>

          {/* 6. 진입 전략 */}
          <section>
            <h2 className="text-[17px] font-black bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-lg flex items-center gap-2 mb-3">
              🗺️ 진입 전략
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
              {toText(report.entryStrategy)}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-gray-400 py-6 border-t border-gray-100">
          깍두기학교 시장 리서치 프로 — AI 자동 생성 리포트
        </div>
      </div>
    </div>
  );
}
