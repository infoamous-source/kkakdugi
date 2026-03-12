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
      style={{ backgroundColor: '#FFF8F0' }}
    >
      {/* Top brand area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #3D2B1F 0%, #6B3A1F 50%, #9C6B3C 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 320, height: 320, background: '#C89B3C', top: -60, right: -60 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 200, height: 200, background: '#C89B3C', bottom: -40, left: -40 }}
        />

        {/* Coffee cup silhouette */}
        <div className="relative z-10 mb-6">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Cup body */}
            <path
              d="M20 30 L30 95 Q30 105 45 105 L75 105 Q90 105 90 95 L100 30 Z"
              fill="rgba(255,255,255,0.12)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            {/* Cup handle */}
            <path
              d="M90 45 Q115 45 115 62 Q115 78 90 78"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            {/* Steam lines */}
            <path d="M45 20 Q50 10 45 2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M60 18 Q65 8 60 0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M75 20 Q80 10 75 2" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Liquid surface */}
            <path d="M28 45 Q60 52 92 45" stroke="rgba(200,155,60,0.6)" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold tracking-widest mb-1 relative z-10"
          style={{ fontSize: 42, letterSpacing: '0.25em', fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
        >
          CAFE
        </h1>
        <p
          className="relative z-10 font-light tracking-wider"
          style={{ color: '#C89B3C', fontSize: 13, letterSpacing: '0.2em' }}
        >
          KIOSK ORDER
        </p>

        {/* Touch prompt */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ border: '2px solid rgba(200,155,60,0.6)', background: 'rgba(200,155,60,0.15)' }}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: 'rgba(200,155,60,0.4)' }}
            />
          </div>
          <p
            className="text-center font-medium"
            style={{ color: 'rgba(255,248,240,0.85)', fontSize: 14, letterSpacing: '0.05em' }}
          >
            {t('kiosk.screens.welcome.touch', '주문하시려면 화면을 터치해 주세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#2C1A0E' }}
      >
        <span style={{ color: '#9E7E6A', fontSize: 11 }}>매장 · Take Out</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? '#C89B3C' : 'rgba(200,155,60,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: '#9E7E6A', fontSize: 11 }}>KO · EN · JP · CN</span>
      </div>
    </div>
  );
}
