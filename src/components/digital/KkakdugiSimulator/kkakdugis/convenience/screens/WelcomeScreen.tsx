import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { CONVENIENCE_THEME } from '../data';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: CONVENIENCE_THEME.bg }}
    >
      {/* Top brand area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: `linear-gradient(160deg, ${CONVENIENCE_THEME.headerBg} 0%, ${CONVENIENCE_THEME.primary} 50%, ${CONVENIENCE_THEME.accent} 100%)` }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 320, height: 320, background: CONVENIENCE_THEME.accent, top: -60, right: -60 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 200, height: 200, background: CONVENIENCE_THEME.accent, bottom: -40, left: -40 }}
        />

        {/* Storefront SVG */}
        <div className="relative z-10 mb-6">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Roof / awning */}
            <path
              d="M10 40 L60 12 L110 40 Z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            {/* Awning stripes */}
            <path d="M15 40 L25 40 L22 50 L12 50 Z" fill="rgba(255,255,255,0.12)" />
            <path d="M35 40 L45 40 L42 50 L32 50 Z" fill="rgba(255,255,255,0.12)" />
            <path d="M55 40 L65 40 L62 50 L52 50 Z" fill="rgba(255,255,255,0.12)" />
            <path d="M75 40 L85 40 L82 50 L72 50 Z" fill="rgba(255,255,255,0.12)" />
            <path d="M95 40 L105 40 L102 50 L92 50 Z" fill="rgba(255,255,255,0.12)" />
            {/* Store body */}
            <rect x="15" y="50" width="90" height="58" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            {/* Door */}
            <rect x="42" y="68" width="36" height="40" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            {/* Door handle */}
            <circle cx="72" cy="88" r="2" fill="rgba(255,255,255,0.5)" />
            {/* Window left */}
            <rect x="20" y="56" width="18" height="18" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            {/* Window right */}
            <rect x="82" y="56" width="18" height="18" rx="1" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            {/* Sign */}
            <rect x="30" y="22" width="60" height="14" rx="2" fill="rgba(255,255,255,0.2)" />
            <rect x="38" y="26" width="44" height="6" rx="1" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold tracking-widest mb-1 relative z-10"
          style={{ fontSize: 28, letterSpacing: '0.15em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
        >
          {t('kiosk.convenience.title', '무인 계산대')}
        </h1>
        <p
          className="relative z-10 font-light tracking-wider"
          style={{ color: CONVENIENCE_THEME.border, fontSize: 13, letterSpacing: '0.15em' }}
        >
          SELF CHECKOUT
        </p>

        {/* Touch prompt */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-2">
          {/* Barcode scan icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ border: `2px solid rgba(167,243,208,0.6)`, background: 'rgba(167,243,208,0.15)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              {/* Barcode lines */}
              <rect x="4" y="6" width="2" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="7" y="6" width="1" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="9" y="6" width="3" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="13" y="6" width="1" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="15" y="6" width="2" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="18" y="6" width="1" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="20" y="6" width="3" height="16" fill="rgba(255,255,255,0.7)" />
              <rect x="24" y="6" width="1" height="16" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <p
            className="text-center font-medium"
            style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, letterSpacing: '0.05em' }}
          >
            {t('kiosk.convenience.welcome.touch', '화면을 터치하세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <span style={{ color: 'rgba(167,243,208,0.6)', fontSize: 11 }}>
          {t('kiosk.convenience.welcome.scanGuide', '상품을 스캔해주세요')}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? CONVENIENCE_THEME.accent : 'rgba(167,243,208,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: 'rgba(167,243,208,0.6)', fontSize: 11 }}>24H</span>
      </div>
    </div>
  );
}
