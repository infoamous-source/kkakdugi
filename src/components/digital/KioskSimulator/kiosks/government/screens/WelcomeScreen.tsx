import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Main touch area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #1E293B 0%, #334155 55%, #475569 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 340, height: 340, background: '#94A3B8', top: -70, right: -70 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 220, height: 220, background: '#94A3B8', bottom: -50, left: -50 }}
        />

        {/* Government building SVG icon */}
        <div className="relative z-10 mb-8">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            {/* Outer glow ring */}
            <circle cx="55" cy="55" r="52" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Dome/roof */}
            <path d="M35 50 L55 25 L75 50" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" strokeLinejoin="round" />
            {/* Triangular pediment */}
            <path d="M28 50 L82 50" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <rect x="28" y="50" width="54" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
            {/* Columns */}
            <rect x="34" y="53" width="5" height="25" rx="1.5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="46" y="53" width="5" height="25" rx="1.5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="58" y="53" width="5" height="25" rx="1.5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="70" y="53" width="5" height="25" rx="1.5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            {/* Base */}
            <rect x="26" y="78" width="58" height="5" rx="1.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            {/* Small dome on top */}
            <circle cx="55" cy="28" r="4" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold relative z-10 mb-1"
          style={{ fontSize: 32, letterSpacing: '0.12em', textShadow: '0 2px 14px rgba(0,0,0,0.3)' }}
        >
          {t('government.name', '무인 민원발급기')}
        </h1>
        <p
          className="relative z-10 font-light"
          style={{ color: 'rgba(203,213,225,0.9)', fontSize: 14, letterSpacing: '0.25em' }}
        >
          {t('government.subtitle', '주민센터')}
        </p>

        {/* Touch prompt */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.12)' }}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
          </div>
          <p
            className="text-center font-medium"
            style={{ color: 'rgba(248,250,252,0.9)', fontSize: 14, letterSpacing: '0.03em' }}
          >
            {t('government.welcome.touch', '화면을 터치하세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#0F172A' }}
      >
        <span style={{ color: '#64748B', fontSize: 11 }}>
          {t('government.welcome.service', '민원서류 발급')}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? '#0EA5E9' : 'rgba(14,165,233,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: '#64748B', fontSize: 11 }}>
          {t('government.welcome.hours', '24시간 운영')}
        </span>
      </div>
    </div>
  );
}
