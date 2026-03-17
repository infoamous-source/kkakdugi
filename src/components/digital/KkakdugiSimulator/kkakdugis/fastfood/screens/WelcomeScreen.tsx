import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: '#FFF9F0' }}
    >
      {/* Top brand area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #8B0000 0%, #CC0000 50%, #FF4444 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 320, height: 320, background: '#FFC107', top: -60, right: -60 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 200, height: 200, background: '#FFC107', bottom: -40, left: -40 }}
        />

        {/* Burger silhouette */}
        <div className="relative z-10 mb-6">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Top bun */}
            <path
              d="M20 52 Q20 28 60 28 Q100 28 100 52 Z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
            {/* Sesame seeds */}
            <ellipse cx="45" cy="38" rx="4" ry="2.5" fill="rgba(255,255,255,0.25)" transform="rotate(-20 45 38)" />
            <ellipse cx="60" cy="33" rx="4" ry="2.5" fill="rgba(255,255,255,0.25)" />
            <ellipse cx="76" cy="38" rx="4" ry="2.5" fill="rgba(255,255,255,0.25)" transform="rotate(20 76 38)" />
            {/* Lettuce layer */}
            <rect x="16" y="52" width="88" height="8" rx="2" fill="rgba(100,200,80,0.4)" />
            {/* Patty */}
            <rect x="18" y="60" width="84" height="12" rx="3" fill="rgba(120,60,20,0.5)" />
            {/* Cheese */}
            <rect x="14" y="72" width="92" height="5" rx="1" fill="rgba(255,193,7,0.6)" />
            {/* Bottom bun */}
            <path
              d="M20 77 L20 90 Q20 95 60 95 Q100 95 100 90 L100 77 Z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-black tracking-widest mb-1 relative z-10"
          style={{ fontSize: 38, letterSpacing: '0.2em', fontFamily: 'Arial Black, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
        >
          BURGER
        </h1>
        <p
          className="relative z-10 font-bold tracking-wider"
          style={{ color: '#FFC107', fontSize: 13, letterSpacing: '0.2em' }}
        >
          KIOSK ORDER
        </p>

        {/* Touch prompt */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ border: '2px solid rgba(255,193,7,0.6)', background: 'rgba(255,193,7,0.15)' }}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: 'rgba(255,193,7,0.4)' }}
            />
          </div>
          <p
            className="text-center font-medium"
            style={{ color: 'rgba(255,249,240,0.9)', fontSize: 14, letterSpacing: '0.05em' }}
          >
            {t('kkakdugi.screens.welcome.touch', '주문하시려면 화면을 터치해 주세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#6B0000' }}
      >
        <span style={{ color: '#FFCDD2', fontSize: 11 }}>매장 · Take Out</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? '#FFC107' : 'rgba(255,193,7,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: '#FFCDD2', fontSize: 11 }}>KO · EN · JP · CN</span>
      </div>
    </div>
  );
}
