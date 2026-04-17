import { useRef } from 'react';
import { Download, X } from 'lucide-react';
import type { BrandKitData } from '../../../../services/gemini/proBrandKitService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  kit: BrandKitData;
  brandName: string;
  onClose: () => void;
}

function toText(val: unknown): string {
  if (typeof val === 'string') return val;
  if (!val) return '';
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (obj.summary || obj.details) return [obj.summary, obj.details].filter(Boolean).join('\n\n') as string;
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n');
  }
  return String(val);
}

export default function BrandKitReportView({ kit, brandName, onClose }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
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
      pdf.save(`브랜드키트_${brandName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium">
          <X className="w-5 h-5" /> 닫기
        </button>
        <button onClick={handleExportPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg">
          <Download className="w-4 h-4" /> PDF 저장
        </button>
      </div>

      <div ref={reportRef} className="max-w-[800px] mx-auto bg-white my-4 rounded-lg shadow-xl" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        {/* Header */}
        <div className="px-12 pt-12 pb-6 text-center">
          <h1 className="text-[32px] font-black text-gray-900 mb-1">{brandName}</h1>
          <p className="text-[13px] text-gray-400">Brand Identity Kit | {new Date().toLocaleDateString('ko-KR')}</p>
        </div>

        <div className="px-12 pb-12 space-y-8">
          {/* USP */}
          <section>
            <h2 className="text-[17px] font-black bg-purple-50 text-purple-700 px-4 py-2.5 rounded-lg mb-3">
              💎 우리 브랜드만의 매력
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-lg text-[14px] leading-relaxed text-gray-700 whitespace-pre-line">
              {toText(kit.usp)}
            </div>
          </section>

          {/* Slogans */}
          <section>
            <h2 className="text-[17px] font-black bg-pink-50 text-pink-700 px-4 py-2.5 rounded-lg mb-3">
              ✨ 슬로건
            </h2>
            <div className="space-y-2">
              {kit.slogans.map((s, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-center">
                  <p className="text-[16px] font-bold text-gray-800">"{s}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section>
            <h2 className="text-[17px] font-black bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg mb-3">
              🎨 컬러 팔레트
            </h2>
            {/* Color strip */}
            <div className="flex rounded-lg overflow-hidden h-16 mb-4 shadow-sm">
              {kit.colors.map((c, i) => (
                <div key={i} className="flex-1 flex items-end justify-center pb-1" style={{ backgroundColor: c.hex }}>
                  <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-white/80 text-gray-700">{c.hex}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {kit.colors.map((c, i) => (
                <div key={i} className="text-center">
                  <div className="w-full aspect-square rounded-xl border border-gray-200 mb-2" style={{ backgroundColor: c.hex }} />
                  <p className="text-[12px] font-bold text-gray-700">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.usage}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fonts */}
          <section>
            <h2 className="text-[17px] font-black bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg mb-3">
              🔤 폰트
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-[11px] text-gray-400 mb-2">제목 폰트</p>
                <p className="text-[22px] font-bold text-gray-900" style={{ fontFamily: kit.fonts.heading }}>{kit.fonts.heading}</p>
                <p className="text-[15px] mt-2 text-gray-600" style={{ fontFamily: kit.fonts.heading }}>가나다라마 ABCDEF 123</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-[11px] text-gray-400 mb-2">본문 폰트</p>
                <p className="text-[22px] font-bold text-gray-900" style={{ fontFamily: kit.fonts.body }}>{kit.fonts.body}</p>
                <p className="text-[15px] mt-2 text-gray-600" style={{ fontFamily: kit.fonts.body }}>가나다라마 ABCDEF 123</p>
              </div>
            </div>
          </section>

          {/* Voice Guide */}
          <section>
            <h2 className="text-[17px] font-black bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg mb-3">
              🗣️ 브랜드 말투 가이드
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
              {toText(kit.voiceGuide)}
            </div>
          </section>
        </div>

        <div className="text-center text-[11px] text-gray-400 py-6 border-t border-gray-100">
          깍두기학교 브랜드 키트 프로 — AI 자동 생성 리포트
        </div>
      </div>
    </div>
  );
}
