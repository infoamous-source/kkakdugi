import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, FileText } from 'lucide-react';

interface GraduationCertificateProps {
  userName: string;
  userOrg: string;
  teamName: string;
  onClose: () => void;
}

// ─── certificate.html의 CSS를 그대로 주입 ───

const CERT_CSS = `
  .gc-root { font-family: 'Noto Serif KR', serif; }

  .cert-wrapper {
    position: relative;
    width: 100%;
    max-width: 95vw;
  }
  .cert-frame {
    position: relative;
    background: #fffef7;
    aspect-ratio: 1.414 / 1;
    width: 100%;
    box-shadow:
      0 4px 20px rgba(0,0,0,0.4),
      0 0 0 1px rgba(201,169,110,0.3),
      inset 0 0 80px rgba(201,169,110,0.06);
    overflow: hidden;
  }
  .cert-frame::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.008) 2px,
        rgba(0,0,0,0.008) 4px
      );
    pointer-events: none;
    z-index: 1;
  }

  .border-outer {
    position: absolute;
    inset: 18px;
    border: 2px solid #b8942d;
    pointer-events: none;
    z-index: 2;
  }
  .border-inner {
    position: absolute;
    inset: 24px;
    border: 1px solid #c9a96e;
    pointer-events: none;
    z-index: 2;
  }
  .border-decorative {
    position: absolute;
    inset: 30px;
    border: 0.5px solid rgba(201,169,110,0.4);
    pointer-events: none;
    z-index: 2;
  }

  .corner {
    position: absolute;
    width: 60px;
    height: 60px;
    z-index: 3;
    pointer-events: none;
  }
  .corner svg { width: 100%; height: 100%; }
  .corner-tl { top: 14px; left: 14px; }
  .corner-tr { top: 14px; right: 14px; transform: scaleX(-1); }
  .corner-bl { bottom: 14px; left: 14px; transform: scaleY(-1); }
  .corner-br { bottom: 14px; right: 14px; transform: scale(-1,-1); }

  .cert-content {
    position: relative;
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 60px 70px;
    text-align: center;
  }

  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 280px;
    height: 280px;
    opacity: 0.04;
    z-index: 0;
    pointer-events: none;
  }

  .cert-title {
    font-family: 'Noto Serif KR', serif;
    font-size: 48px;
    font-weight: 900;
    color: #2c2418;
    letter-spacing: 18px;
    margin-bottom: 6px;
    text-shadow: 0 1px 0 rgba(201,169,110,0.2);
  }
  .cert-title-sub {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px;
    color: #b8942d;
    letter-spacing: 10px;
    text-transform: uppercase;
    margin-bottom: 30px;
    font-weight: 600;
  }
  .cert-divider {
    width: 220px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #c9a96e, transparent);
    margin-bottom: 24px;
  }
  .cert-name {
    font-family: 'Noto Serif KR', serif;
    font-size: clamp(18px, 5vw, 36px);
    font-weight: 700;
    color: #1a1408;
    margin: 6px 0;
    padding: 4px 20px 8px;
    border-bottom: 2px solid #b8942d;
    letter-spacing: clamp(2px, 1.5vw, 10px);
    min-width: 0;
    max-width: 90%;
    display: inline-block;
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .cert-desc {
    font-size: 12px;
    color: #7a6b52;
    line-height: 1.8;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  .cert-body {
    font-size: 12.5px;
    color: #5a4d3a;
    line-height: 2;
    margin: 18px 0 8px;
    max-width: 480px;
    letter-spacing: 0.5px;
  }
  .cert-course {
    font-weight: 700;
    color: #2c2418;
  }
  .cert-curriculum {
    font-size: 10px;
    color: #7a6b52;
    line-height: 2;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .cert-team {
    font-size: 10.5px;
    color: #5a4d3a;
    letter-spacing: 1.5px;
    margin-bottom: 2px;
  }
  .cert-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    max-width: 520px;
    margin-top: auto;
    padding-top: 10px;
  }
  .cert-date {
    font-size: 11px;
    color: #7a6b52;
    letter-spacing: 1px;
    text-align: left;
  }
  .cert-seal-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
  }
  .cert-seal {
    width: 76px;
    height: 76px;
    position: relative;
  }
  .cert-signatory {
    font-size: 10px;
    color: #7a6b52;
    letter-spacing: 2px;
    text-align: right;
  }
  .cert-number {
    position: absolute;
    top: 36px;
    left: 50px;
    font-size: 8px;
    color: #bbb09a;
    letter-spacing: 1px;
    z-index: 5;
  }

  .cert-controls {
    margin-top: 30px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  .cert-btn {
    padding: 12px 32px;
    border: none;
    border-radius: 4px;
    font-family: 'Noto Serif KR', serif;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 2px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .cert-btn-download {
    background: #b8942d;
    color: #fff;
  }
  .cert-btn-download:hover {
    background: #a07e1f;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(184,148,45,0.3);
  }
  .cert-btn-outline {
    background: transparent;
    color: #c9a96e;
    border: 1px solid #c9a96e;
  }
  .cert-btn-outline:hover {
    background: rgba(201,169,110,0.1);
  }
`;

const CORNER_SVG = `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4 L4 20 Q4 4 20 4 Z" fill="#b8942d" opacity="0.6"/>
  <path d="M8 8 L8 28 Q8 8 28 8" stroke="#c9a96e" stroke-width="0.5" fill="none"/>
  <path d="M4 30 Q10 18 30 4" stroke="#c9a96e" stroke-width="0.3" fill="none" opacity="0.5"/>
  <circle cx="10" cy="10" r="2" fill="#c9a96e" opacity="0.4"/>
</svg>`;

/** Inject Google Fonts + certificate CSS */
function ensureCertStyles() {
  if (document.getElementById('gc-styles')) return;
  // Fonts
  const link = document.createElement('link');
  link.id = 'gc-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700;900&family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
  // CSS
  const style = document.createElement('style');
  style.id = 'gc-styles';
  style.textContent = CERT_CSS;
  document.head.appendChild(style);
}

export default function GraduationCertificate({ userName, userOrg, teamName, onClose }: GraduationCertificateProps) {
  const { t } = useTranslation('common');
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ensureCertStyles(); }, []);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayFormatted = `${y}년 ${m}월 ${d}일`;
  const certNumber = `SGC-${y}-MK-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const spacedName = userName.split('').join(' ');

  const renderToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!certRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(certRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#fffef7',
      logging: false,
    });
  };

  const handleDownloadPng = async () => {
    try {
      const canvas = await renderToCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `수료증_${userName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Certificate PNG download failed:', err);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const canvas = await renderToCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const aspectRatio = canvas.height / canvas.width;
      let imgWidth = availableWidth;
      let imgHeight = imgWidth * aspectRatio;
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight / aspectRatio;
      }
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save(`수료증_${userName}.pdf`);
    } catch (err) {
      console.error('Certificate PDF download failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/70 backdrop-blur-sm gc-root">
      {/* 닫기 */}
      <div style={{ width: '100%', maxWidth: 800, display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* ─── Certificate (certificate.html 구조 그대로) ─── */}
      <div className="cert-wrapper" style={{ maxWidth: 800 }}>
        <div className="cert-frame" ref={certRef}>

          {/* Borders */}
          <div className="border-outer" />
          <div className="border-inner" />
          <div className="border-decorative" />

          {/* Corner ornaments */}
          <div className="corner corner-tl" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />
          <div className="corner corner-tr" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />
          <div className="corner corner-bl" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />
          <div className="corner corner-br" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />

          {/* Watermark */}
          <svg className="watermark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#b8942d" strokeWidth="2" fill="none" />
            <circle cx="100" cy="100" r="82" stroke="#b8942d" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="75" stroke="#b8942d" strokeWidth="1" fill="none" />
            <path d="M100 25 L106 45 L125 45 L110 55 L116 75 L100 63 L84 75 L90 55 L75 45 L94 45 Z" fill="#b8942d" opacity="0.5" />
            <text x="100" y="115" textAnchor="middle" fontSize="14" fontFamily="serif" fill="#b8942d" letterSpacing="4">AMOUS EDU</text>
          </svg>

          {/* Content */}
          <div className="cert-content">
            <div className="cert-title">수 료 증</div>
            <div className="cert-title-sub">Certificate of Completion</div>

            <div className="cert-divider" />

            <div className="cert-name">{spacedName}</div>

            <div className="cert-desc" style={{ marginTop: 16 }}>
              하기의 사람은 {userOrg || '깍두기 학교'}가 주관하는 교육과정을
            </div>
            <div className="cert-desc" style={{ marginBottom: 4 }}>
              성실히 이수하였기에 이 증서를 수여합니다.
            </div>

            <div className="cert-body">
              <span className="cert-course">예비 마케터 양성과정 (6차시)</span>
            </div>

            <div className="cert-curriculum">
              1교시 나의 적성 찾기 · 2교시 시장 조사하기<br />
              3교시 나만의 무기 만들기 · 4교시 SNS 광고 만들기<br />
              5교시 설득의 기술 · 6교시 투자 시뮬레이션
            </div>

            {teamName && (
              <div className="cert-team">소속 팀: {teamName}</div>
            )}

            <div className="cert-footer">
              <div className="cert-date">발급일자 : {todayFormatted}</div>

              <div className="cert-seal-area">
                <div style={{ textAlign: 'center' }}>
                  <div className="cert-signatory">{userOrg || '깍두기 학교'} X 에이머스교육컨설팅</div>
                </div>
                {/* AMOUS EDU electronic seal */}
                <svg className="cert-seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="44" stroke="#c0392b" strokeWidth="3" fill="none" opacity="0.75" />
                  <circle cx="50" cy="50" r="38" stroke="#c0392b" strokeWidth="0.8" fill="none" opacity="0.4" />
                  <text x="50" y="38" textAnchor="middle" fontSize="11" fontFamily="'Cormorant Garamond', serif" fill="#c0392b" opacity="0.8" fontWeight="700" letterSpacing="1.5">AMOUS</text>
                  <text x="50" y="53" textAnchor="middle" fontSize="13" fontFamily="'Cormorant Garamond', serif" fill="#c0392b" opacity="0.8" fontWeight="700" letterSpacing="2">EDU</text>
                  <line x1="22" y1="58" x2="78" y2="58" stroke="#c0392b" strokeWidth="0.5" opacity="0.35" />
                  <text x="50" y="70" textAnchor="middle" fontSize="7" fontFamily="'Noto Serif KR', serif" fill="#c0392b" opacity="0.65" letterSpacing="3">에이머스교육</text>
                  <text x="50" y="80" textAnchor="middle" fontSize="5.5" fontFamily="'Cormorant Garamond', serif" fill="#c0392b" opacity="0.5" letterSpacing="1.5">CONSULTING</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Certificate number */}
          <div className="cert-number">No. {certNumber}</div>

        </div>
      </div>

      {/* Download Buttons */}
      <div className="cert-controls" style={{ maxWidth: 800 }}>
        <button className="cert-btn cert-btn-download" onClick={handleDownloadPng}>
          <Download size={16} />
          PNG 다운로드
        </button>
        <button className="cert-btn cert-btn-outline" onClick={handleDownloadPdf}>
          <FileText size={16} />
          PDF 다운로드
        </button>
      </div>

      <button
        onClick={onClose}
        style={{ marginTop: 16, color: 'rgba(201,169,110,0.6)', fontSize: 13, letterSpacing: 2, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {t('common.close', '닫기')}
      </button>
    </div>
  );
}
