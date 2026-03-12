import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Main touch area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #1A365D 0%, #2B6CB0 55%, #3182CE 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 340, height: 340, background: '#BEE3F8', top: -70, right: -70 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 220, height: 220, background: '#BEE3F8', bottom: -50, left: -50 }}
        />

        {/* Bank building SVG icon */}
        <div className="relative z-10 mb-8">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            {/* Outer glow ring */}
            <circle cx="55" cy="55" r="52" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Bank building */}
            {/* Roof triangle */}
            <polygon points="55,20 30,42 80,42" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Roof bar */}
            <rect x="28" y="42" width="54" height="5" rx="1" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
            {/* Pillars */}
            <rect x="34" y="47" width="6" height="28" rx="1" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="48" y="47" width="6" height="28" rx="1" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="62" y="47" width="6" height="28" rx="1" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="76" y="47" width="0" height="0" rx="0" fill="none" />
            {/* Base */}
            <rect x="28" y="75" width="54" height="6" rx="1" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
            {/* Steps */}
            <rect x="24" y="81" width="62" height="4" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="20" y="85" width="70" height="4" rx="1" fill="rgba(255,255,255,0.10)" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold relative z-10 mb-1"
          style={{ fontSize: 40, letterSpacing: '0.15em', textShadow: '0 2px 14px rgba(0,0,0,0.3)', fontFamily: 'serif' }}
        >
          {t('bank.name', '은행')}
        </h1>
        <p
          className="relative z-10 font-light"
          style={{ color: 'rgba(190,227,248,0.9)', fontSize: 14, letterSpacing: '0.25em' }}
        >
          {t('bank.kiosk', '무인 업무기')}
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
            style={{ color: 'rgba(235,244,255,0.9)', fontSize: 14, letterSpacing: '0.03em' }}
          >
            {t('bank.welcome.touch', '화면을 터치하세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#1A365D' }}
      >
        <span style={{ color: '#A0AEC0', fontSize: 11 }}>
          {t('bank.welcome.services', '입금 · 출금 · 이체')}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? '#3182CE' : 'rgba(49,130,206,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: '#A0AEC0', fontSize: 11 }}>
          {t('bank.welcome.hours', '09:00 ~ 16:00')}
        </span>
      </div>
    </div>
  );
}
