import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, FileText } from 'lucide-react';

interface GraduationCertificateProps {
  userName: string;
  userOrg: string;
  /** @deprecated 디자인에서 제거됨 — 호환성만 유지 */
  teamName?: string;
  onClose: () => void;
}

// ─── Option A · Luxury Premium Certificate CSS ───

const CERT_CSS = `
  .gc-root { font-family: 'Noto Serif KR', serif; }

  .cert-wrapper {
    position: relative;
    width: 100%;
    max-width: 960px;
  }
  .cert-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 1.414 / 1;
    background:
      radial-gradient(ellipse at top left, rgba(255, 248, 220, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse at bottom right, rgba(255, 240, 200, 0.8) 0%, transparent 60%),
      linear-gradient(135deg, #fdfaf0 0%, #fff8e7 50%, #fdf5e0 100%);
    box-shadow:
      0 20px 60px rgba(0,0,0,0.6),
      0 0 0 1px rgba(212, 175, 55, 0.5),
      inset 0 0 120px rgba(184, 148, 45, 0.08),
      inset 0 0 40px rgba(255, 215, 0, 0.04);
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }
  .cert-frame::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(45deg, transparent 0 2px, rgba(184,148,45,0.015) 2px 3px),
      repeating-linear-gradient(-45deg, transparent 0 2px, rgba(184,148,45,0.015) 2px 3px);
    pointer-events: none;
    z-index: 1;
  }
  .cert-frame::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(120, 90, 20, 0.08) 100%);
    pointer-events: none;
    z-index: 2;
  }

  /* Triple gold borders */
  .border-1 {
    position: absolute;
    inset: 16px;
    border: 3px solid transparent;
    background:
      linear-gradient(135deg, #b8942d, #f4e4a6, #b8942d, #8b6914, #d4af37, #b8942d) border-box;
    -webkit-mask:
      linear-gradient(#fff 0 0) padding-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 3;
  }
  .border-2 { position: absolute; inset: 22px; border: 1px solid #d4af37; pointer-events: none; z-index: 3; }
  .border-3 { position: absolute; inset: 27px; border: 0.5px solid rgba(184, 148, 45, 0.4); pointer-events: none; z-index: 3; }
  .border-4 { position: absolute; inset: 34px; border: 0.5px dashed rgba(184, 148, 45, 0.3); pointer-events: none; z-index: 3; }

  /* Corner ornaments */
  .corner {
    position: absolute;
    width: 110px;
    height: 110px;
    z-index: 4;
    pointer-events: none;
  }
  .corner svg { width: 100%; height: 100%; overflow: visible; }
  .corner-tl { top: 10px; left: 10px; }
  .corner-tr { top: 10px; right: 10px; transform: scaleX(-1); }
  .corner-bl { bottom: 10px; left: 10px; transform: scaleY(-1); }
  .corner-br { bottom: 10px; right: 10px; transform: scale(-1, -1); }

  /* Watermark */
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 340px;
    height: 340px;
    opacity: 0.05;
    z-index: 0;
    pointer-events: none;
  }

  /* Content layout */
  .cert-content {
    position: relative;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
    padding: 52px 78px 42px;
    text-align: center;
  }
  .cert-top, .cert-middle, .cert-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* Title — gold foil gradient */
  .cert-title {
    font-family: 'Noto Serif KR', serif;
    font-size: 52px;
    font-weight: 900;
    letter-spacing: 22px;
    margin-bottom: 2px;
    padding-left: 22px;
    color: #b8942d;
  }
  .cert-title-sub {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    color: #8b6914;
    letter-spacing: 12px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .cert-title-flourish { width: 260px; height: 20px; margin-bottom: 8px; }

  /* Description */
  .cert-desc {
    font-family: 'Noto Serif KR', serif;
    font-size: 12.5px;
    color: #6b5835;
    line-height: 1.9;
    letter-spacing: 1.2px;
    font-weight: 400;
  }

  /* Name */
  .cert-name-wrap {
    position: relative;
    margin: 14px 0 10px;
    padding: 12px 40px 16px;
  }
  .cert-name-wrap::before,
  .cert-name-wrap::after {
    content: '❦';
    position: absolute;
    top: 50%;
    transform: translateY(-40%);
    font-size: 16px;
    color: #b8942d;
    opacity: 0.6;
  }
  .cert-name-wrap::before { left: 6px; }
  .cert-name-wrap::after { right: 6px; }
  .cert-name {
    font-family: 'Noto Serif KR', serif;
    font-size: clamp(24px, 4.2vw, 38px);
    font-weight: 700;
    color: #2c2418;
    letter-spacing: clamp(4px, 1.3vw, 12px);
    padding-left: 12px;
    display: inline-block;
    position: relative;
    word-break: keep-all;
    max-width: 100%;
  }
  .cert-name::after {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: -4px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #d4af37, #8b6914, #d4af37, transparent);
  }

  /* Course badge */
  .cert-course-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 24px;
    margin: 10px 0 2px;
    border: 1px solid #d4af37;
    background: linear-gradient(180deg, rgba(255, 248, 220, 0.8), rgba(255, 240, 200, 0.5));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      0 1px 2px rgba(184, 148, 45, 0.2);
    border-radius: 2px;
  }
  .cert-course-badge::before,
  .cert-course-badge::after {
    content: '';
    width: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b6914);
  }
  .cert-course-badge::after {
    background: linear-gradient(90deg, #8b6914, transparent);
  }
  .cert-course {
    font-family: 'Noto Serif KR', serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #2c2418;
    letter-spacing: 2px;
  }
  .cert-course-sub {
    font-family: 'Cormorant Garamond', serif;
    font-size: 10.5px;
    color: #8a7550;
    font-style: italic;
    margin-top: 6px;
    letter-spacing: 1px;
  }

  /* Footer */
  .cert-footer {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: end;
    width: 100%;
    max-width: 620px;
    gap: 24px;
  }
  .cert-date-block { text-align: left; }
  .cert-date-label {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    color: #a89464;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .cert-date {
    font-family: 'Noto Serif KR', serif;
    font-size: 12px;
    color: #2c2418;
    letter-spacing: 1.5px;
    font-weight: 600;
    border-bottom: 1px solid #b8942d;
    padding-bottom: 2px;
    display: inline-block;
  }
  .cert-qr-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .cert-qr {
    width: 62px;
    height: 62px;
    padding: 4px;
    background: #fff;
    border: 1px solid #b8942d;
    box-shadow:
      0 1px 3px rgba(184, 148, 45, 0.3),
      inset 0 0 0 2px rgba(255, 248, 220, 0.8);
  }
  .cert-qr-label {
    font-family: 'Cinzel', serif;
    font-size: 7px;
    color: #a89464;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .cert-signature-block {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .cert-signatory-line {
    font-family: 'Noto Serif KR', serif;
    font-size: 10px;
    color: #5a4d3a;
    letter-spacing: 1.5px;
    font-weight: 500;
  }
  .cert-signatory-sub {
    font-family: 'Cinzel', serif;
    font-size: 7.5px;
    color: #a89464;
    letter-spacing: 2.5px;
    text-transform: uppercase;
  }

  /* Hologram seal */
  .cert-seal-wrap {
    position: absolute;
    right: 90px;
    bottom: 58px;
    width: 96px;
    height: 96px;
    z-index: 6;
    pointer-events: none;
  }
  .cert-seal-glow {
    position: absolute;
    inset: -10px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .cert-seal {
    position: relative;
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(192, 57, 43, 0.3));
    opacity: 0.88;
  }

  /* Serial + verified */
  .cert-serial {
    position: absolute;
    top: 42px;
    left: 60px;
    z-index: 5;
    font-family: 'Cinzel', serif;
    font-size: 7px;
    color: #a89464;
    letter-spacing: 1.5px;
    line-height: 1.4;
  }
  .cert-serial-label {
    font-size: 6px;
    color: #b8a06c;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .cert-serial-hash {
    font-family: 'Courier New', monospace;
    font-size: 6.5px;
    color: #8a7550;
    letter-spacing: 0.5px;
  }
  .cert-verified {
    position: absolute;
    top: 42px;
    right: 60px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Cinzel', serif;
    font-size: 7px;
    color: #8b6914;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .cert-verified-badge {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d4af37, #8b6914);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 7px;
    font-weight: 700;
  }

  /* Controls */
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
    background: linear-gradient(135deg, #d4af37, #8b6914);
    color: #fff;
    box-shadow: 0 2px 8px rgba(184,148,45,0.4);
  }
  .cert-btn-download:hover {
    background: linear-gradient(135deg, #b8942d, #6b500f);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(184,148,45,0.5);
  }
  .cert-btn-outline {
    background: transparent;
    color: #d4af37;
    border: 1px solid #d4af37;
  }
  .cert-btn-outline:hover { background: rgba(212,169,55,0.1); }
`;

// Corner ornament SVG (gold arabesque)
const CORNER_SVG = `<svg viewBox="0 0 120 120">
  <defs>
    <linearGradient id="goldCornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4e4a6"/>
      <stop offset="50%" stop-color="#b8942d"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
  </defs>
  <path d="M10 10 Q10 50 50 50 Q30 30 10 30 Z" fill="url(#goldCornerGrad)" opacity="0.85"/>
  <path d="M15 15 Q50 15 50 55" stroke="#b8942d" stroke-width="1.2" fill="none"/>
  <path d="M20 20 Q55 20 55 60" stroke="#d4af37" stroke-width="0.5" fill="none" opacity="0.7"/>
  <path d="M12 60 Q40 40 60 12" stroke="#b8942d" stroke-width="0.8" fill="none" opacity="0.6"/>
  <path d="M10 80 Q45 45 80 10" stroke="#c9a96e" stroke-width="0.4" fill="none" opacity="0.5"/>
  <circle cx="14" cy="14" r="3" fill="#d4af37"/>
  <circle cx="14" cy="14" r="1.5" fill="#fff8e7"/>
  <circle cx="45" cy="45" r="2" fill="#b8942d" opacity="0.8"/>
  <circle cx="60" cy="60" r="1.5" fill="#d4af37" opacity="0.6"/>
  <circle cx="75" cy="75" r="1" fill="#b8942d" opacity="0.4"/>
  <path d="M30 10 Q35 15 30 25 Q25 15 30 10 Z" fill="#b8942d" opacity="0.5"/>
  <path d="M10 30 Q15 35 25 30 Q15 25 10 30 Z" fill="#b8942d" opacity="0.5"/>
  <path d="M50 10 L52 14 L56 15 L52 16 L50 20 L48 16 L44 15 L48 14 Z" fill="#d4af37" opacity="0.7"/>
  <path d="M10 50 L14 52 L15 56 L16 52 L20 50 L16 48 L15 44 L14 48 Z" fill="#d4af37" opacity="0.7"/>
</svg>`;

/** Inject Google Fonts + certificate CSS */
function ensureCertStyles() {
  if (document.getElementById('gc-styles')) return;
  const link = document.createElement('link');
  link.id = 'gc-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700;900&family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@400;500;600;700&family=Cinzel:wght@400;600;700;900&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.id = 'gc-styles';
  style.textContent = CERT_CSS;
  document.head.appendChild(style);
}

/** 간단한 결정론적 해시 생성 (시리얼 번호 해시 부분) */
function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h) + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).padStart(12, '0').slice(0, 12);
}

export default function GraduationCertificate({ userName, userOrg, onClose }: GraduationCertificateProps) {
  const { t } = useTranslation('common');
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ensureCertStyles(); }, []);

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayFormatted = `${y} . ${m} . ${d}`;
  const serialNumber = `KKD-${y}-MK-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const serialHash = `#${simpleHash(userName + y + m + d)}`;
  // 한글이면 글자 띄우기, 영어/혼합이면 그대로
  const isKorean = /^[가-힣\s/]+$/.test(userName.replace(/[^가-힣a-zA-Z\s/]/g, ''));
  const spacedName = isKorean
    ? userName.split('').filter(c => c !== ' ').join(' ')
    : userName;

  const renderToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!certRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(certRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#fdfaf0',
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-sm gc-root overflow-y-auto">
      {/* 닫기 */}
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* ─── Certificate ─── */}
      <div className="cert-wrapper">
        <div className="cert-frame" ref={certRef}>

          {/* Borders */}
          <div className="border-1" />
          <div className="border-2" />
          <div className="border-3" />
          <div className="border-4" />

          {/* Serial (top-left) */}
          <div className="cert-serial">
            <div className="cert-serial-label">Serial No.</div>
            <div>{serialNumber}</div>
            <div className="cert-serial-hash">{serialHash}</div>
          </div>

          {/* Verified badge (top-right) */}
          <div className="cert-verified">
            <div className="cert-verified-badge">✓</div>
            Verified
          </div>

          {/* Corner ornaments */}
          <div className="corner corner-tl" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />
          <div className="corner corner-tr" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />
          <div className="corner corner-bl" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />
          <div className="corner corner-br" dangerouslySetInnerHTML={{ __html: CORNER_SVG }} />

          {/* Regal Watermark */}
          <svg className="watermark" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="110" stroke="#b8942d" strokeWidth="2" fill="none" />
            <circle cx="120" cy="120" r="102" stroke="#b8942d" strokeWidth="0.5" fill="none" />
            <circle cx="120" cy="120" r="90" stroke="#b8942d" strokeWidth="1" fill="none" />
            <circle cx="120" cy="120" r="60" stroke="#b8942d" strokeWidth="0.5" fill="none"/>
            {/* Crown */}
            <path d="M95 85 L100 70 L110 80 L120 65 L130 80 L140 70 L145 85 Z" fill="#b8942d" opacity="0.7"/>
            <circle cx="100" cy="70" r="2.5" fill="#b8942d"/>
            <circle cx="120" cy="65" r="3" fill="#b8942d"/>
            <circle cx="140" cy="70" r="2.5" fill="#b8942d"/>
            {/* Laurel left */}
            <path d="M60 120 Q50 115 45 125 Q60 125 60 120 Z" fill="#b8942d" opacity="0.6"/>
            <path d="M55 135 Q45 132 42 142 Q57 140 55 135 Z" fill="#b8942d" opacity="0.6"/>
            <path d="M55 105 Q45 102 42 92 Q57 98 55 105 Z" fill="#b8942d" opacity="0.6"/>
            <path d="M65 155 Q58 155 55 162 Q70 162 65 155 Z" fill="#b8942d" opacity="0.6"/>
            {/* Laurel right */}
            <path d="M180 120 Q190 115 195 125 Q180 125 180 120 Z" fill="#b8942d" opacity="0.6"/>
            <path d="M185 135 Q195 132 198 142 Q183 140 185 135 Z" fill="#b8942d" opacity="0.6"/>
            <path d="M185 105 Q195 102 198 92 Q183 98 185 105 Z" fill="#b8942d" opacity="0.6"/>
            <path d="M175 155 Q182 155 185 162 Q170 162 175 155 Z" fill="#b8942d" opacity="0.6"/>
            {/* Central star */}
            <path d="M120 95 L127 115 L148 115 L131 128 L138 148 L120 135 L102 148 L109 128 L92 115 L113 115 Z" fill="#b8942d" opacity="0.75"/>
            <text x="120" y="180" textAnchor="middle" fontSize="13" fontFamily="'Cinzel', serif" fill="#b8942d" letterSpacing="4" fontWeight="700">KKAKDUGI SCHOOL</text>
            <text x="120" y="198" textAnchor="middle" fontSize="9" fontFamily="'Cinzel', serif" fill="#b8942d" letterSpacing="3">EST · 2026</text>
          </svg>

          {/* Content */}
          <div className="cert-content">

            <div className="cert-top">
              <div className="cert-title">수 료 증</div>
              <div className="cert-title-sub">Certificate of Completion</div>
              <svg className="cert-title-flourish" viewBox="0 0 260 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10 Q65 10 130 10 Q195 10 260 10" stroke="#b8942d" strokeWidth="0.5" fill="none" opacity="0.6"/>
                <path d="M20 10 Q80 2 130 10 Q180 18 240 10" stroke="#d4af37" strokeWidth="1" fill="none"/>
                <circle cx="130" cy="10" r="3" fill="#d4af37"/>
                <circle cx="130" cy="10" r="1.5" fill="#fff8e7"/>
                <path d="M120 10 L126 8 L130 2 L134 8 L140 10 L134 12 L130 18 L126 12 Z" fill="#b8942d" opacity="0.7"/>
                <circle cx="50" cy="10" r="1.5" fill="#b8942d" opacity="0.7"/>
                <circle cx="210" cy="10" r="1.5" fill="#b8942d" opacity="0.7"/>
                <circle cx="20" cy="10" r="1" fill="#b8942d" opacity="0.5"/>
                <circle cx="240" cy="10" r="1" fill="#b8942d" opacity="0.5"/>
              </svg>
            </div>

            <div className="cert-middle">
              <div className="cert-desc">This is to certify that</div>

              <div className="cert-name-wrap">
                <div className="cert-name">{spacedName}</div>
              </div>

              <div className="cert-desc" style={{ marginTop: 10 }}>
                위 사람은 {userOrg || '깍두기 학교'}가 주관하는
              </div>
              <div className="cert-desc">
                예비 마케터 양성과정을 성실히 이수하였기에
              </div>
              <div className="cert-desc" style={{ marginBottom: 10 }}>
                이 증서를 수여합니다.
              </div>

              <div className="cert-course-badge">
                <span className="cert-course">예비 마케터 양성과정</span>
              </div>
              <div className="cert-course-sub">Prospective Marketer Training Program</div>
            </div>

            <div className="cert-bottom">
              <div className="cert-footer">
                <div className="cert-date-block">
                  <div className="cert-date-label">Date of Issue</div>
                  <div className="cert-date">{todayFormatted}</div>
                </div>

                <div className="cert-qr-wrap">
                  {/* QR placeholder */}
                  <svg className="cert-qr" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="14" height="14" fill="#1a1408"/>
                    <rect x="5" y="5" width="8" height="8" fill="#fff"/>
                    <rect x="7" y="7" width="4" height="4" fill="#1a1408"/>
                    <rect x="44" y="2" width="14" height="14" fill="#1a1408"/>
                    <rect x="47" y="5" width="8" height="8" fill="#fff"/>
                    <rect x="49" y="7" width="4" height="4" fill="#1a1408"/>
                    <rect x="2" y="44" width="14" height="14" fill="#1a1408"/>
                    <rect x="5" y="47" width="8" height="8" fill="#fff"/>
                    <rect x="7" y="49" width="4" height="4" fill="#1a1408"/>
                    {[
                      [20,2],[25,2],[30,5],[35,2],[20,8],[28,8],[35,10],[20,14],[25,16],[30,14],
                      [2,22],[8,22],[14,25],[22,22],[28,25],[35,22],[40,28],[45,22],[50,28],[55,22],
                      [5,30],[12,32],[20,30],[26,32],[33,30],[40,34],[48,32],[55,34],
                      [2,38],[10,40],[18,38],[26,40],[34,38],[42,40],[50,38],[55,42],
                      [22,46],[28,48],[34,46],[40,48],[48,46],[55,50],
                      [22,52],[30,54],[38,52],[46,55],[52,52],
                    ].map(([x, y], i) => (
                      <rect key={i} x={x} y={y} width="3" height="3" fill="#1a1408"/>
                    ))}
                  </svg>
                  <div className="cert-qr-label">Verify Online</div>
                </div>

                <div className="cert-signature-block">
                  <div className="cert-signatory-line">{userOrg || '깍두기 학교'}</div>
                  <div className="cert-signatory-sub">Host Institution</div>
                  <div className="cert-signatory-line" style={{ marginTop: 6 }}>에이머스교육컨설팅</div>
                  <div className="cert-signatory-sub">Amous Education Consulting</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hologram Seal (absolute positioned over signature area) */}
          <div className="cert-seal-wrap">
            <div className="cert-seal-glow" />
            <svg className="cert-seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e74c3c"/>
                  <stop offset="50%" stopColor="#c0392b"/>
                  <stop offset="100%" stopColor="#922b21"/>
                </linearGradient>
                <radialGradient id="sealRing" cx="50%" cy="50%">
                  <stop offset="70%" stopColor="transparent"/>
                  <stop offset="80%" stopColor="rgba(255,215,0,0.3)"/>
                  <stop offset="90%" stopColor="rgba(192,57,43,0.4)"/>
                  <stop offset="100%" stopColor="transparent"/>
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#sealRing)"/>
              <circle cx="50" cy="50" r="44" stroke="url(#sealGrad)" strokeWidth="3.5" fill="none"/>
              <circle cx="50" cy="50" r="40" stroke="#c0392b" strokeWidth="0.6" fill="none" opacity="0.5"/>
              <circle cx="50" cy="50" r="36" stroke="#c0392b" strokeWidth="0.3" fill="none" opacity="0.4"/>
              <g fill="#c0392b" opacity="0.6">
                <circle cx="50" cy="10" r="1.5"/>
                <circle cx="50" cy="90" r="1.5"/>
                <circle cx="10" cy="50" r="1.5"/>
                <circle cx="90" cy="50" r="1.5"/>
                <circle cx="22" cy="22" r="1"/>
                <circle cx="78" cy="22" r="1"/>
                <circle cx="22" cy="78" r="1"/>
                <circle cx="78" cy="78" r="1"/>
              </g>
              <path id="sealTop" d="M 20 50 A 30 30 0 0 1 80 50" fill="none"/>
              <text fontSize="7.5" fontFamily="'Cinzel', serif" fill="#c0392b" letterSpacing="2" fontWeight="700">
                <textPath href="#sealTop" startOffset="50%" textAnchor="middle">AMOUS EDU CONSULTING</textPath>
              </text>
              <text x="50" y="60" textAnchor="middle" fontSize="14" fontFamily="'Cinzel', serif" fill="#c0392b" fontWeight="900" letterSpacing="1">A</text>
              <text x="50" y="78" textAnchor="middle" fontSize="5" fontFamily="'Noto Serif KR', serif" fill="#c0392b" opacity="0.8" letterSpacing="1.5">에이머스교육</text>
              <text x="50" y="86" textAnchor="middle" fontSize="4" fontFamily="'Cinzel', serif" fill="#c0392b" opacity="0.6" letterSpacing="1">2026 · VERIFIED</text>
            </svg>
          </div>

        </div>
      </div>

      {/* Download Buttons */}
      <div className="cert-controls" style={{ maxWidth: 960 }}>
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
        style={{ marginTop: 16, color: 'rgba(212,169,55,0.6)', fontSize: 13, letterSpacing: 2, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {t('common.close', '닫기')}
      </button>
    </div>
  );
}
