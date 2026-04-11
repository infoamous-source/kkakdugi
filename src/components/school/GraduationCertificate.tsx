import { X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GraduationCertificateProps {
  userName: string;
  userOrg: string;
  teamName?: string;
  onClose: () => void;
}

/**
 * 수료증 — 사전 생성된 PNG 이미지 표시 + 다운로드
 * public/certs/cert_{이름}.png 파일 매칭
 */
export default function GraduationCertificate({ userName, onClose }: GraduationCertificateProps) {
  const { t } = useTranslation('common');

  // 파일명 생성 (이름의 /를 _로, 특수문자 제거)
  const safeName = userName.replace(/[/\\?%*:|"<>]/g, '_').trim();
  const certUrl = `/certs/cert_${safeName}.png`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = certUrl;
    link.download = `수료증_${userName}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      {/* 닫기 */}
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* 수료증 이미지 */}
      <div style={{ maxWidth: 960, width: '100%' }}>
        <img
          src={certUrl}
          alt={`${userName} 수료증`}
          className="w-full rounded-lg shadow-2xl"
          onError={(e) => {
            // 파일 없으면 기본 메시지
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML = `
                <div style="background:#1a2744;color:white;padding:60px;border-radius:12px;text-align:center">
                  <div style="font-size:48px;margin-bottom:16px">🎓</div>
                  <div style="font-size:24px;font-weight:700;margin-bottom:8px">수료증</div>
                  <div style="font-size:16px;opacity:0.7">${userName}</div>
                  <div style="font-size:12px;opacity:0.5;margin-top:12px">수료증 이미지를 준비 중입니다</div>
                </div>
              `;
            }
          }}
        />
      </div>

      {/* 다운로드 버튼 */}
      <div className="mt-6 flex gap-4" style={{ maxWidth: 960, width: '100%' }}>
        <button
          onClick={handleDownload}
          className="flex-1 py-3.5 bg-gradient-to-r from-[#1a2744] to-[#2c4a7c] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 hover:opacity-90"
        >
          <Download size={18} />
          PNG 다운로드
        </button>
      </div>

      <button
        onClick={onClose}
        style={{ marginTop: 16, color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 2, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {t('common.close', '닫기')}
      </button>
    </div>
  );
}
