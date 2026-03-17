import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F0FAFA' }}>
      {/* Main touch area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #0D7377 0%, #14919B 55%, #1ABC9C 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 340, height: 340, background: '#B2DFDB', top: -70, right: -70 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 220, height: 220, background: '#B2DFDB', bottom: -50, left: -50 }}
        />

        {/* Medical cross icon */}
        <div className="relative z-10 mb-8">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            {/* Outer glow ring */}
            <circle cx="55" cy="55" r="52" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Plus / cross shape with rounded corners */}
            <rect x="38" y="16" width="34" height="78" rx="10" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <rect x="16" y="38" width="78" height="34" rx="10" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            {/* Center highlight */}
            <rect x="38" y="38" width="34" height="34" rx="4" fill="rgba(255,255,255,0.15)" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold relative z-10 mb-1"
          style={{ fontSize: 40, letterSpacing: '0.15em', textShadow: '0 2px 14px rgba(0,0,0,0.3)' }}
        >
          {t('hospital.name', '종합병원')}
        </h1>
        <p
          className="relative z-10 font-light"
          style={{ color: 'rgba(178,236,232,0.9)', fontSize: 14, letterSpacing: '0.25em' }}
        >
          {t('hospital.kiosk', '무인 접수기')}
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
            style={{ color: 'rgba(240,250,250,0.9)', fontSize: 14, letterSpacing: '0.03em' }}
          >
            {t('hospital.welcome.touch', '접수하시려면 화면을 터치해 주세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#0A5558' }}
      >
        <span style={{ color: '#8BAAAA', fontSize: 11 }}>
          {t('hospital.welcome.types', '초진 · 재진')}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? '#2ECC71' : 'rgba(46,204,113,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: '#8BAAAA', fontSize: 11 }}>
          {t('hospital.welcome.hours', '09:00 ~ 17:00')}
        </span>
      </div>
    </div>
  );
}
