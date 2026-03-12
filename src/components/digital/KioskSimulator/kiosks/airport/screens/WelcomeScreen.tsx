import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { AIRPORT_THEME } from '../data';

interface Props {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: Props) {
  const { t } = useTranslation();

  const languages = [
    { label: '한국어', active: true },
    { label: 'English', active: false },
    { label: '日本語', active: false },
    { label: '中文', active: false },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: AIRPORT_THEME.surface }}>
      {/* Main touch area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer select-none"
        onClick={() => { feedbackTap(); onNext(); }}
        style={{ background: 'linear-gradient(160deg, #0C4A6E 0%, #0369A1 55%, #0EA5E9 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 340, height: 340, background: '#BAE6FD', top: -70, right: -70 }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 220, height: 220, background: '#BAE6FD', bottom: -50, left: -50 }}
        />

        {/* Airplane icon */}
        <div className="relative z-10 mb-8">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            <circle cx="55" cy="55" r="52" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Airplane side view */}
            <path
              d="M25 58L42 52L50 38L54 38L50 52L72 46L78 36L82 36L76 48L90 44L90 48L76 54L82 66L78 66L72 56L50 62L54 76L50 76L42 62L25 68L25 63L38 58L25 53Z"
              fill="rgba(255,255,255,0.18)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-white font-bold relative z-10 mb-1"
          style={{ fontSize: 36, letterSpacing: '0.12em', textShadow: '0 2px 14px rgba(0,0,0,0.3)' }}
        >
          {t('airport.welcome.title', '셀프 체크인')}
        </h1>
        <p
          className="relative z-10 font-light"
          style={{ color: 'rgba(186,230,253,0.9)', fontSize: 14, letterSpacing: '0.25em' }}
        >
          {t('airport.welcome.subtitle', 'Self Check-in')}
        </p>

        {/* Language selection */}
        <div className="relative z-10 mt-8 flex gap-2">
          {languages.map((lang) => (
            <div
              key={lang.label}
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{
                backgroundColor: lang.active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                color: lang.active ? 'white' : 'rgba(255,255,255,0.6)',
                border: lang.active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {lang.label}
            </div>
          ))}
        </div>

        {/* Touch prompt */}
        <div className="relative z-10 mt-10 flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse"
            style={{ border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.12)' }}
          >
            <div
              className="w-9 h-9 rounded-full"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
          </div>
          <p
            className="text-center font-medium"
            style={{ color: AIRPORT_THEME.gold, fontSize: 14, letterSpacing: '0.03em' }}
          >
            {t('airport.welcome.touch', '화면을 터치하세요')}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: '#082F49' }}
      >
        <span style={{ color: '#64748B', fontSize: 11 }}>
          {t('airport.welcome.domestic', '국제선 출발')}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: i === 0 ? AIRPORT_THEME.accent : 'rgba(14,165,233,0.3)' }}
            />
          ))}
        </div>
        <span style={{ color: '#64748B', fontSize: 11 }}>
          {t('airport.welcome.terminal', 'Terminal 1')}
        </span>
      </div>
    </div>
  );
}
