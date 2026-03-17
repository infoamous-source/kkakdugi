import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { CINEMA_THEME } from '../data';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CINEMA_THEME.bg }}>
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #1A0A2E 0%, #4C1D95 55%, #7C3AED 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 340, height: 340, background: '#C4B5FD', top: -70, right: -70 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 220, height: 220, background: '#C4B5FD', bottom: -50, left: -50 }}
        />

        {/* Film projector icon */}
        <div className="relative z-10 mb-8">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            {/* Outer glow ring */}
            <circle cx="55" cy="55" r="52" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            {/* Film reel body */}
            <circle cx="55" cy="48" r="26" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            {/* Inner reel */}
            <circle cx="55" cy="48" r="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
            {/* Sprocket holes */}
            <circle cx="55" cy="28" r="3" fill="rgba(255,255,255,0.2)" />
            <circle cx="55" cy="68" r="3" fill="rgba(255,255,255,0.2)" />
            <circle cx="35" cy="48" r="3" fill="rgba(255,255,255,0.2)" />
            <circle cx="75" cy="48" r="3" fill="rgba(255,255,255,0.2)" />
            {/* Film strip */}
            <rect x="28" y="80" width="54" height="10" rx="2" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="32" y="82" width="6" height="6" rx="1" fill="rgba(255,255,255,0.12)" />
            <rect x="42" y="82" width="6" height="6" rx="1" fill="rgba(255,255,255,0.12)" />
            <rect x="52" y="82" width="6" height="6" rx="1" fill="rgba(255,255,255,0.12)" />
            <rect x="62" y="82" width="6" height="6" rx="1" fill="rgba(255,255,255,0.12)" />
            {/* Light beam */}
            <path d="M68 38 L95 18 L95 58 L68 58 Z" fill="rgba(253,230,138,0.1)" stroke="rgba(253,230,138,0.2)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="font-bold relative z-10 mb-1"
          style={{ fontSize: 40, letterSpacing: '0.15em', color: CINEMA_THEME.text, textShadow: '0 2px 14px rgba(0,0,0,0.4)' }}
        >
          {t('cinema.name', '영화관')}
        </h1>
        <p
          className="relative z-10 font-light"
          style={{ color: 'rgba(196,181,253,0.9)', fontSize: 14, letterSpacing: '0.25em' }}
        >
          {t('cinema.kiosk', '무인 발권기')}
        </p>

        {/* Touch prompt */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ border: '2px solid rgba(253,230,138,0.5)', background: 'rgba(253,230,138,0.1)' }}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: 'rgba(253,230,138,0.25)' }}
            />
          </div>
          <p
            className="text-center font-medium"
            style={{ color: CINEMA_THEME.gold, fontSize: 14, letterSpacing: '0.03em' }}
          >
            {t('cinema.welcome.touch', '화면을 터치하세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#130826' }}
      >
        <span style={{ color: 'rgba(196,181,253,0.5)', fontSize: 11 }}>
          {t('cinema.welcome.formats', '2D / 3D')}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? CINEMA_THEME.gold : 'rgba(253,230,138,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: 'rgba(196,181,253,0.5)', fontSize: 11 }}>
          {t('cinema.welcome.hours', '10:00 ~ 24:00')}
        </span>
      </div>
    </div>
  );
}
